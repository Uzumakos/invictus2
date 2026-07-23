import { NextRequest, NextResponse } from "next/server";
import { getCollection, addToCollection } from "@/lib/db";
import { Booking, CRMLead, PortalNotification } from "@/lib/types";
import { calculateLeadScoreAndMetrics } from "@/lib/leadScoring";
import crypto from "crypto";

export async function GET() {
  try {
    const bookings = await getCollection<Booking>("bookings");
    return NextResponse.json(bookings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id, // Client can optionally pass a pre-generated ID for reference code matching
      clientName,
      clientEmail,
      serviceId,
      serviceTitle,
      packageType,
      language,
      date,
      time,
      timezone,
      questionnaire,
      amount,
      paymentMethod,
      paymentReference,
      discoveryId,
    } = body;

    if (!clientName || !clientEmail || !serviceId || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookingId = id || "b_" + crypto.randomBytes(8).toString("hex");

    const newBooking: Booking = {
      id: bookingId,
      // clientId is not a DB column — bookings are linked to clients via client_email
      clientName,
      clientEmail,
      serviceId,
      serviceTitle,
      packageType,
      language,
      date,
      time,
      timezone,
      questionnaire: questionnaire || {},
      status: "awaiting_payment", // Initial status is awaiting payment per specifications
      amount: amount || 0,
      paymentMethod,
      paymentReference: paymentReference || bookingId, // Use bookingId as default reference
      discoveryId,
      createdAt: new Date().toISOString(),
    };

    await addToCollection("bookings", newBooking);

    // Feed booking as a lead in CRM pipeline
    const titleText = typeof serviceTitle === "object"
      ? (serviceTitle.en || serviceTitle.fr || "Consultation")
      : (serviceTitle || "Consultation");

    const scoringInput = {
      budget: amount ? `Under $1,000` : undefined, // Discovery Call price is $60, which is under $1000
      notes: questionnaire?.goals || "",
      projectType: "Discovery Call",
    };
    const scoringResult = calculateLeadScoreAndMetrics(scoringInput);

    const newLead: CRMLead = {
      id: "lead_" + crypto.randomBytes(8).toString("hex"),
      company: clientName + " Org",
      contactName: clientName,
      email: clientEmail,
      industry: "Consultation Request",
      budget: `$${amount || "350"} (Awaiting payment)`,
      notes: `Booked ${titleText} for ${date} at ${time} (${timezone}). Method: ${paymentMethod || "None"}. Goals: ${questionnaire?.goals || "None"}`,
      source: "Consultation Booking",
      status: "discovery",
      createdAt: new Date().toISOString(),
      // Lead Scoring & CRM Fields
      leadScore: scoringResult.leadScore,
      priority: scoringResult.priority,
      estimatedValue: scoringResult.estimatedValue,
      probabilityOfClosing: scoringResult.probabilityOfClosing,
      acquisitionSource: "Discovery Call",
      lastActivity: new Date().toISOString(),
      nextAction: "Conduct discovery call session",
      assignedConsultant: "Amedee Erns Baptiste",
      tags: ["discovery", "booking"],
      preferredLanguage: language || "en",
    } as any;
    await addToCollection("leads", newLead);

    // Generate client portal notification
    const newNotif: PortalNotification = {
      id: "notif_" + crypto.randomBytes(8).toString("hex"),
      clientEmail: clientEmail.toLowerCase().trim(),
      text: `New consultation booked: '${titleText}' on ${date} at ${time} (${timezone}). Status: Awaiting Payment.`,
      type: "meeting",
      timestamp: new Date().toISOString(),
      read: false,
    };
    await addToCollection("portalNotifications", newNotif);

    return NextResponse.json(newBooking, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


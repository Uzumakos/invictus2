import { NextRequest, NextResponse } from "next/server";
import { getCollection, addToCollection } from "@/lib/db";
import { Booking, CRMLead, PortalNotification } from "@/lib/types";
import { calculateLeadScoreAndMetrics } from "@/lib/leadScoring";
import {
  getAdminFromRequest,
  getPortalUserFromRequest,
  filterItemsForPortalClient,
  unauthorizedResponse,
} from "@/lib/apiAuth";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    let bookings = await getCollection<Booking>("bookings");

    if (!admin) {
      const portalUser = await getPortalUserFromRequest(req);
      if (!portalUser) {
        return unauthorizedResponse();
      }
      bookings = filterItemsForPortalClient(
        bookings as unknown as Record<string, unknown>[],
        portalUser.email
      ) as unknown as Booking[];
    }

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
      id,
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
      status: "awaiting_payment",
      amount: amount || 0,
      paymentMethod,
      paymentReference: paymentReference || bookingId,
      discoveryId,
      createdAt: new Date().toISOString(),
    };

    await addToCollection("bookings", newBooking);

    const titleText =
      typeof serviceTitle === "object"
        ? serviceTitle.en || serviceTitle.fr || "Consultation"
        : serviceTitle || "Consultation";

    const scoringInput = {
      budget: amount ? `Under $1,000` : undefined,
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
    } as CRMLead;
    await addToCollection("leads", newLead);

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

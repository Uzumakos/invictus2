import { NextRequest, NextResponse } from "next/server";
import { loadDB, saveDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";
import crypto from "crypto";

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await loadDB();
    const users = (db.users as any[]) || [];
    const publicUsers = users.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json(publicUsers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await loadDB();
    const users = (db.users as any[]) || [];

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };

    const { addToCollection } = await import("@/lib/db");
    await addToCollection("users", newUser);

    if (role === "client") {
      try {
        const { getSupabaseAdmin } = await import("@/lib/supabaseClient");
        const dbClient = getSupabaseAdmin();
        const { data: existingProfile } = await dbClient
          .from("client_billing_profiles")
          .select("id")
          .eq("email", newUser.email)
          .maybeSingle();

        if (!existingProfile) {
          await addToCollection("clientBillingProfiles", {
            id: crypto.randomUUID(),
            clientId: newUser.id,
            companyName: name,
            primaryContactName: name,
            email: newUser.email,
            billingAddress: "Port-au-Prince",
            country: "Haiti",
            phone: "",
            whatsappNumber: "",
            countryCode: "US",
            currency: "USD",
            preferredLanguage: "fr",
            paymentTerms: "NET_30",
            defaultDiscount: 0,
            isApproved: true,
            createdAt: new Date().toISOString()
          });
        }
      } catch (profileErr) {
        console.error("Auto-creation of client billing profile failed:", profileErr);
      }
    }

    const { passwordHash: _, ...publicUser } = newUser;
    return NextResponse.json(publicUser, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


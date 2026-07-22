import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const dbClient = getSupabaseAdmin();

    // 1. Check client_billing_profiles table
    const { data: profile, error: profileError } = await dbClient
      .from("client_billing_profiles")
      .select("id, is_approved")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("Error checking client profile in verification:", profileError.message);
      return NextResponse.json({ error: "Database query error" }, { status: 500 });
    }

    if (profile) {
      return NextResponse.json({
        exists: true,
        approved: profile.is_approved === true,
        message: profile.is_approved ? "Registered" : "Pending"
      });
    }

    // 2. Fallback: check users table with role 'client'
    const { data: user, error: userError } = await dbClient
      .from("users")
      .select("id, role")
      .eq("email", email)
      .eq("role", "client")
      .maybeSingle();

    if (userError) {
      console.error("Error checking user table in verification:", userError.message);
    }

    if (user) {
      return NextResponse.json({
        exists: true,
        approved: true,
        message: "Registered"
      });
    }

    // 3. Fallback: check clients table
    const { data: client, error: clientError } = await dbClient
      .from("clients")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (clientError) {
      console.error("Error checking clients table in verification:", clientError.message);
    }

    if (client) {
      return NextResponse.json({
        exists: true,
        approved: true, // assume approved if in clients table
        message: "Registered"
      });
    }

    return NextResponse.json({
      exists: false,
      approved: false,
      message: "Not registered"
    });
  } catch (err: any) {
    console.error("Failed to verify client email:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

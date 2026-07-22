import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSession } from "@/lib/portalAuth";
import { getSupabaseAdmin } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    const { user, status } = await verifyPortalSession(req);
    if (status !== 200 || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbClient = getSupabaseAdmin();
    const { data: userData, error: userError } = await dbClient
      .from("users")
      .select("password_hash")
      .eq("email", user.email.toLowerCase().trim())
      .maybeSingle();

    if (userError) {
      console.error("Error looking up user password status:", userError.message);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const hasPassword = !!(userData && userData.password_hash && !userData.password_hash.includes("placeholder"));

    return NextResponse.json({ hasPassword });
  } catch (err: any) {
    console.error("Password status API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

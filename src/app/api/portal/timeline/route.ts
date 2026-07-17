import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { verifyPortalSession } from "@/lib/portalAuth";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyPortalSession(req);
    if (session.status !== 200 || !session.user) {
      return NextResponse.json({ error: session.error || "Unauthorized" }, { status: session.status });
    }

    const dbClient = getSupabaseAdmin();
    const email = session.user.email;

    // 1. Fetch client billing profile ID by email
    const { data: profile, error: profileError } = await dbClient
      .from("client_billing_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!profile) {
      return NextResponse.json([]); // No profile registered for this email yet
    }

    // 2. Fetch milestones for this client_id
    const { data: milestones, error: milestonesError } = await dbClient
      .from("client_milestones")
      .select("*")
      .eq("client_id", profile.id)
      .order("created_at", { ascending: true });

    if (milestonesError) {
      return NextResponse.json({ error: milestonesError.message }, { status: 400 });
    }

    // Convert keys to camelCase
    const formatted = (milestones || []).map((m: any) => ({
      id: m.id,
      clientId: m.client_id,
      titleEn: m.title_en,
      titleFr: m.title_fr,
      status: m.status,
      completedAt: m.completed_at,
      createdAt: m.created_at
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

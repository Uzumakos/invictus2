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
      return NextResponse.json({ scoreValue: 0, category: "N/A", recommendations: { en: [], fr: [] } });
    }

    // 2. Fetch scorecards for this client_id
    const { data: scorecards, error: scorecardsError } = await dbClient
      .from("client_digital_scores")
      .select("*")
      .eq("client_id", profile.id);

    if (scorecardsError) {
      return NextResponse.json({ error: scorecardsError.message }, { status: 400 });
    }

    if (!scorecards || scorecards.length === 0) {
      return NextResponse.json({ scoreValue: 0, category: "N/A", recommendations: { en: [], fr: [] } });
    }

    const sc = scorecards[0]; // Take primary/first scorecard
    return NextResponse.json({
      id: sc.id,
      clientId: sc.client_id,
      scoreValue: sc.score_value,
      category: sc.category,
      recommendations: sc.recommendations || { en: [], fr: [] },
      updatedAt: sc.updated_at
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

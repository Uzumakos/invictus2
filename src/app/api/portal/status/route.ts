import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSession } from "@/lib/portalAuth";

export async function GET(req: NextRequest) {
  try {
    const { user, status } = await verifyPortalSession(req);
    if (status !== 200 || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 401 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, sub: payload.sub });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

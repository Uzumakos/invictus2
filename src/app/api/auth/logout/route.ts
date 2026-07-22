import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out." });

  // Delete admin_token cookie
  response.cookies.delete("admin_token");
  response.cookies.delete("client_token");

  return response;
}
export async function GET() {
  return POST();
}

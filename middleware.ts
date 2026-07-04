import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./lib/i18n/routing";

const handleI18n = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip i18n middleware for admin, api, _next, and static files
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return handleI18n(req);
}

export const config = {
  // Match everything — filtering is done in the function above
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

// next-intl middleware for locale routing
const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip proxy/i18n for API routes ───────────────────────────────────────
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ── Admin route protection ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow login page through
    if (pathname === "/admin/login" || pathname === "/admin/login/") {
      return NextResponse.next();
    }

    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const payload = await verifyToken(token);
      if (!payload) {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url)
        );
        response.cookies.delete("admin_token");
        return response;
      }
      return NextResponse.next();
    } catch (err) {
      console.error("PROXY ADMIN VERIFICATION ERROR:", err);
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // ── next-intl locale routing (for all non-admin routes) ─────────────────
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Admin routes
    "/admin/:path*",
    // next-intl: match all paths except api, internals and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};

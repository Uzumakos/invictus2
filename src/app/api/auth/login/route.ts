import { NextRequest, NextResponse } from "next/server";
import { signToken, comparePassword } from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, recordSuccessfulLogin, getClientIP } from "@/lib/rate-limit";
import { loadDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  // 1. Check rate limit
  const rateLimitStatus = checkRateLimit(ip);
  if (!rateLimitStatus.allowed) {
    const lockMinutes = rateLimitStatus.lockedUntil 
      ? Math.ceil((rateLimitStatus.lockedUntil - Date.now()) / (60 * 1000))
      : 15;
    return NextResponse.json(
      { error: `Too many login attempts. Locked out. Please try again in ${lockMinutes} minute(s).` },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminHash) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH not defined in .env.local");
      return NextResponse.json(
        { error: "Server authentication setup incomplete." },
        { status: 500 }
      );
    }

    // 2. Look up user in database
    let user = null;
    let isCorrect = false;
    try {
      const db = await loadDB();
      const users = (db.users as any[]) || [];
      user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === "admin");
    } catch (dbErr) {
      console.error("DB read error in login:", dbErr);
    }

    if (user) {
      isCorrect = await comparePassword(password, user.passwordHash);
    } else {
      // Fallback to env file configurations
      if (email === adminEmail) {
        isCorrect = await comparePassword(password, adminHash);
      }
    }

    if (!isCorrect) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 4. Success — generate token and set cookie
    recordSuccessfulLogin(ip);
    const token = signToken(email);

    const response = NextResponse.json({ success: true, message: "Welcome, admin." });

    // Set JWT in HTTPOnly secure cookie
    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Auth login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

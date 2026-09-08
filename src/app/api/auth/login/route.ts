import { NextRequest, NextResponse } from "next/server";
import { signToken, comparePassword, isAllowedAdminEmail } from "@/lib/auth";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
  getClientIP,
} from "@/lib/rate-limit";
import { loadDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);

  const rateLimitStatus = checkRateLimit(ip);
  if (!rateLimitStatus.allowed) {
    const lockMinutes = rateLimitStatus.lockedUntil
      ? Math.ceil((rateLimitStatus.lockedUntil - Date.now()) / (60 * 1000))
      : 15;
    return NextResponse.json(
      {
        error: `Too many login attempts. Locked out. Please try again in ${lockMinutes} minute(s).`,
      },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!(await isAllowedAdminEmail(normalizedEmail))) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    let isCorrect = false;

    try {
      const db = await loadDB();
      const users = (db.users as { email?: string; role?: string; passwordHash?: string }[]) || [];
      const user = users.find(
        (u) =>
          u.role === "admin" &&
          u.email?.toLowerCase().trim() === normalizedEmail &&
          u.passwordHash
      );
      if (user?.passwordHash) {
        isCorrect = await comparePassword(password, user.passwordHash);
      }
    } catch (dbErr) {
      console.error("DB read error in login:", dbErr);
    }

    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    if (!isCorrect && adminHash && !adminHash.includes("placeholder")) {
      try {
        isCorrect = await comparePassword(password, adminHash);
      } catch (hashErr) {
        console.error("Bcrypt compare error:", hashErr);
      }
    }

    if (!isCorrect) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    recordSuccessfulLogin(ip);
    const token = signToken(normalizedEmail);

    const response = NextResponse.json({
      success: true,
      message: "Welcome, admin.",
    });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Auth login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import { AdminRateLimitEntry } from "@/lib/types";

// In-memory store — resets on server restart
// For production, use Redis or Supabase
const store = new Map<string, AdminRateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATIONS = [
  1 * 60 * 1000,   // 1st lockout: 1 min
  5 * 60 * 1000,   // 2nd lockout: 5 min
  15 * 60 * 1000,  // 3rd+ lockout: 15 min
];

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  attemptsLeft: number;
  lockedUntil?: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  // Check if currently locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  // Reset window if it has expired
  if (now - entry.lastAttempt > WINDOW_MS) {
    store.delete(ip);
    return { allowed: true, attemptsLeft: MAX_ATTEMPTS - 1 };
  }

  const attemptsLeft = MAX_ATTEMPTS - entry.attempts - 1;
  return { allowed: attemptsLeft >= 0, attemptsLeft: Math.max(0, attemptsLeft) };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = store.get(ip) || { attempts: 0, lastAttempt: now };

  entry.attempts += 1;
  entry.lastAttempt = now;

  // Apply lockout if max attempts exceeded
  if (entry.attempts >= MAX_ATTEMPTS) {
    const lockoutIndex = Math.min(
      Math.floor(entry.attempts / MAX_ATTEMPTS) - 1,
      LOCKOUT_DURATIONS.length - 1
    );
    entry.lockedUntil = now + LOCKOUT_DURATIONS[lockoutIndex];
  }

  store.set(ip, entry);
}

export function recordSuccessfulLogin(ip: string): void {
  store.delete(ip);
}

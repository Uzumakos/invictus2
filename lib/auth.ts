import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-me-in-production";
const SESSION_EXPIRES = process.env.ADMIN_SESSION_EXPIRES || "8h";

export interface JWTPayload {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Sign a JWT for the admin session
 */
export function signToken(email: string): string {
  return jwt.sign({ sub: email, role: "admin" }, JWT_SECRET, {
    expiresIn: SESSION_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Verify and decode a JWT token. Returns null if invalid/expired.
 */
export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Compare a plain-text password against a stored bcrypt hash.
 */
export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Hash a plain-text password (for setup scripts only).
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

/**
 * Validate admin credentials from environment variables.
 * Returns true if the email matches ADMIN_EMAIL and
 * the password matches ADMIN_PASSWORD_HASH.
 */
export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH not set in .env.local");
    return false;
  }

  if (email !== adminEmail) return false;
  return comparePassword(password, adminHash);
}

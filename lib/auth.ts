import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { loadDB } from "@/lib/db";

const SESSION_EXPIRES = process.env.ADMIN_SESSION_EXPIRES || "8h";

function resolveRequiredSecret(
  envKey: string,
  devFallback: string
): string {
  const secret = process.env[envKey];
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${envKey} must be set in production`);
  }
  return devFallback;
}

function getAdminJwtSecret(): string {
  return resolveRequiredSecret(
    "ADMIN_JWT_SECRET",
    "dev-only-admin-jwt-secret"
  );
}

function getClientJwtSecret(): string {
  const dedicated = process.env.CLIENT_JWT_SECRET;
  if (dedicated) return dedicated;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CLIENT_JWT_SECRET must be set in production");
  }
  return getAdminJwtSecret();
}

export interface JWTPayload {
  sub: string;
  role: "admin" | "client";
  iat: number;
  exp: number;
}

export function signToken(email: string): string {
  return jwt.sign({ sub: email, role: "admin" }, getAdminJwtSecret(), {
    expiresIn: SESSION_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

export function signClientToken(email: string): string {
  return jwt.sign({ sub: email, role: "client" }, getClientJwtSecret(), {
    expiresIn: SESSION_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

export async function verifyAdminToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, getAdminJwtSecret()) as JWTPayload;
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyClientToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, getClientJwtSecret()) as JWTPayload;
    if (payload.role !== "client") return null;
    return payload;
  } catch {
    return null;
  }
}

/** @deprecated Prefer verifyAdminToken or verifyClientToken */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  return verifyAdminToken(token);
}

export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function isAllowedAdminEmail(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  const envAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (envAdmin && normalized === envAdmin) return true;

  try {
    const db = await loadDB();
    const users = (db.users as { email?: string; role?: string }[]) || [];
    return users.some(
      (u) =>
        u.role === "admin" &&
        u.email?.toLowerCase().trim() === normalized
    );
  } catch {
    return false;
  }
}

export async function validateAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  if (!(await isAllowedAdminEmail(normalized))) return false;

  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminHash || adminHash.includes("placeholder")) {
    if (process.env.NODE_ENV === "production") return false;
    return false;
  }

  return comparePassword(password, adminHash);
}

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, type JWTPayload } from "@/lib/auth";
import { verifyPortalSession, type AuthenticatedUser } from "@/lib/portalAuth";
import { getCollection } from "@/lib/db";

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function getAdminFromRequest(
  req: NextRequest
): Promise<JWTPayload | null> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return null;
  const payload = await verifyAdminToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

/** Returns a 401 response, or null if the caller is an authenticated admin. */
export async function requireAdmin(
  req: NextRequest
): Promise<NextResponse | null> {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorizedResponse();
  return null;
}

export async function getPortalUserFromRequest(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  const session = await verifyPortalSession(req);
  if (session.status !== 200 || !session.user) return null;
  return session.user;
}

/** CMS / marketing content readable without login (draft filtering applied separately). */
export const PUBLIC_READ_RESOURCES = new Set([
  "case-studies",
  "training-programs",
  "consulting-services",
  "faq-items",
  "testimonials",
  "recommendation-rules",
]);

/** Anonymous POST (forms, checkout). */
export const PUBLIC_POST_RESOURCES = new Set([
  "leads",
  "discoveries",
  "bookings",
  "payments",
]);

/** Portal client may read; scoped by client email on the server. */
export const PORTAL_READ_RESOURCES = new Set([
  "tasks",
  "messages",
  "projects",
  "payments",
  "consultations",
  "notifications",
  "bookings",
  "discoveries",
]);

/** Portal client may create (must match session email). */
export const PORTAL_POST_RESOURCES = new Set([
  "tasks",
  "messages",
  "notifications",
]);

/** Portal client may update/delete own records (see portalItemOwnedByEmail). */
export const PORTAL_PATCH_RESOURCES = new Set([
  "tasks",
  "messages",
  "notifications",
]);

export const PORTAL_DELETE_RESOURCES = new Set(["tasks"]);

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function readClientEmail(item: Record<string, unknown>): string | null {
  const direct = item.clientEmail ?? item.client_email;
  if (typeof direct === "string" && direct.includes("@")) {
    return normalizeEmail(direct);
  }
  const answers = item.answers as Record<string, unknown> | undefined;
  if (answers) {
    const fromAnswers = answers.email ?? answers.clientEmail;
    if (typeof fromAnswers === "string" && fromAnswers.includes("@")) {
      return normalizeEmail(fromAnswers);
    }
  }
  return null;
}

export function portalItemOwnedByEmail(
  item: Record<string, unknown>,
  clientEmail: string
): boolean {
  const owner = readClientEmail(item);
  if (!owner) return false;
  return owner === normalizeEmail(clientEmail);
}

export function filterItemsForPortalClient(
  items: Record<string, unknown>[],
  clientEmail: string
): Record<string, unknown>[] {
  const target = normalizeEmail(clientEmail);
  return items.filter((item) => {
    const owner = readClientEmail(item);
    return owner === target;
  });
}

export async function assertPortalOwnsItem(
  collectionKey: string,
  id: string,
  clientEmail: string
): Promise<boolean> {
  const items = (await getCollection(collectionKey)) as Record<string, unknown>[];
  const item = items.find((entry) => String(entry.id) === String(id));
  if (!item) return false;
  return portalItemOwnedByEmail(item, clientEmail);
}

export async function requireAdminOrPortalRead(
  req: NextRequest,
  resource: string
): Promise<
  | { kind: "admin" }
  | { kind: "portal"; user: AuthenticatedUser }
  | NextResponse
> {
  const admin = await getAdminFromRequest(req);
  if (admin) return { kind: "admin" };

  if (!PORTAL_READ_RESOURCES.has(resource)) {
    return unauthorizedResponse();
  }

  const user = await getPortalUserFromRequest(req);
  if (!user) return unauthorizedResponse();
  return { kind: "portal", user };
}

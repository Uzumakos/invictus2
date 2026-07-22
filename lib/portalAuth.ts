import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "./supabaseClient";
import { verifyToken } from "./auth";

export interface AuthenticatedUser {
  email: string;
  id: string;
}

export function getAuthToken(req: NextRequest): string | null {
  // 1. Check Authorization Header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookies
  const cookieStore = req.cookies;
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name === "sb-access-token" || (c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))) {
      try {
        const parsed = JSON.parse(c.value);
        if (Array.isArray(parsed) && parsed[0]) {
          return parsed[0];
        }
        if (parsed.access_token) {
          return parsed.access_token;
        }
      } catch {
        return c.value;
      }
    }
  }

  return null;
}

export async function verifyPortalSession(req: NextRequest): Promise<{ user: AuthenticatedUser | null; status: number; error?: string }> {
  const dbClient = getSupabaseAdmin();
  let email: string | null = null;
  let clientId: string | null = null;

  // 1. Check if there is a client_token cookie (Custom Password Login JWT)
  const clientToken = req.cookies.get("client_token")?.value;
  if (clientToken) {
    const payload = await verifyToken(clientToken);
    if (payload && payload.role === "client" && payload.sub) {
      email = payload.sub;
    }
  }

  // 2. Fallback to Supabase token
  if (!email) {
    const token = getAuthToken(req);
    if (token) {
      const { data: { user }, error: authError } = await dbClient.auth.getUser(token);
      if (!authError && user && user.email) {
        email = user.email;
        clientId = user.id;
      }
    }
  }

  // If no email found in either session, return unauthorized
  if (!email) {
    return { user: null, status: 401, error: "Unauthorized" };
  }

  // Whitelist check
  const { data: profile, error: profileError } = await dbClient
    .from("client_billing_profiles")
    .select("id, is_approved")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    return { user: null, status: 400, error: profileError.message };
  }

  if (!profile || profile.is_approved !== true) {
    return { user: null, status: 403, error: "Access pending admin approval" };
  }

  return {
    user: {
      email: email,
      id: clientId || profile.id
    },
    status: 200
  };
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret, path, type } = body;

    let isAuthorized = false;

    // 1. Check via secret token
    if (secret && secret === process.env.ADMIN_JWT_SECRET) {
      isAuthorized = true;
    }

    // 2. Check via browser cookie session
    if (!isAuthorized) {
      const token = req.cookies.get("admin_token")?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    // Trigger Incremental Static Regeneration (ISR) revalidation
    // Revalidates specified locale routes
    revalidatePath(path, type || "page");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: any) {
    console.error("Cache revalidation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

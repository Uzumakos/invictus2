import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret, path, type } = body;

    let isAuthorized = false;

    const revalidateSecret = process.env.REVALIDATE_SECRET;
    if (secret && revalidateSecret && secret === revalidateSecret) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      const token = req.cookies.get("admin_token")?.value;
      if (token) {
        const payload = await verifyAdminToken(token);
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

    revalidatePath(path, type || "page");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err: unknown) {
    console.error("Cache revalidation error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

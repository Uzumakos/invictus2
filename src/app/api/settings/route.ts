import { NextRequest, NextResponse } from "next/server";
import { loadDB, saveDB } from "@/lib/db";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const db = await loadDB();
    const settings = db.settings || {};
    return NextResponse.json(settings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const db = await loadDB();

    db.settings = {
      ...((db.settings as Record<string, unknown>) || {}),
      ...body,
    };

    await saveDB(db);
    return NextResponse.json(db.settings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  return PATCH(req);
}

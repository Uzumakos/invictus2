import { NextRequest, NextResponse } from "next/server";
import { loadDB, saveDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === "admin";
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = await loadDB();
    const users = (db.users as any[]) || [];

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const admins = users.filter((u) => u.role === "admin");
    if (users[index].role === "admin" && admins.length <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 });
    }

    users.splice(index, 1);
    db.users = users;
    await saveDB(db);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


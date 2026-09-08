import { NextRequest, NextResponse } from "next/server";
import { deleteFromCollection, loadDB } from "@/lib/db";
import { requireAdmin } from "@/lib/apiAuth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const db = await loadDB();
    const users = (db.users as { id: string; role?: string }[]) || [];

    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const admins = users.filter((u) => u.role === "admin");
    if (userToDelete.role === "admin" && admins.length <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 });
    }

    await deleteFromCollection("users", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

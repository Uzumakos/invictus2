import { NextRequest, NextResponse } from "next/server";
import { loadDB, saveDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/auth";

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return payload?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await loadDB();
    const users = (db.users as any[]) || [];
    const publicUsers = users.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json(publicUsers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await loadDB();
    const users = (db.users as any[]) || [];

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = {
      id: "u_" + Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    db.users = users;
    await saveDB(db);

    const { passwordHash: _, ...publicUser } = newUser;
    return NextResponse.json(publicUser, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


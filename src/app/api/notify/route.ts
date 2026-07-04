import { NextRequest, NextResponse } from "next/server";
import { addToCollection, getCollection } from "@/lib/db";
import { NotifyEntry } from "@/lib/types";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const currentList = getCollection<NotifyEntry>("notifyList");
    const exists = currentList.some((entry) => entry.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    const entry: NotifyEntry = {
      id: "notify_" + crypto.randomBytes(8).toString("hex"),
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    addToCollection("notifyList", entry);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { loadDB, saveDB } from "@/lib/db";
import { PaymentConfig } from "@/lib/types";

export async function GET() {
  try {
    const db = await loadDB();
    const paymentConfig = db.paymentConfig || { methods: [] };
    return NextResponse.json(paymentConfig);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json(); // Expected Partial<PaymentConfig> or { methods: PaymentMethod[] }
    const db = await loadDB();

    if (!db.paymentConfig) {
      db.paymentConfig = { methods: [] };
    }

    db.paymentConfig = {
      ...(db.paymentConfig as PaymentConfig),
      ...body,
    };

    await saveDB(db);
    return NextResponse.json(db.paymentConfig);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  return PATCH(req);
}


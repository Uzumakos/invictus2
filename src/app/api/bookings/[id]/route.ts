import { NextRequest, NextResponse } from "next/server";
import { updateInCollection } from "@/lib/db";
import { Booking } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = updateInCollection<Booking>("bookings", id, body);
    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

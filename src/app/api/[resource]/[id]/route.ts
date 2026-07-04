import { NextRequest, NextResponse } from "next/server";
import { updateInCollection } from "@/lib/db";

const ALLOWED_RESOURCES = [
  "tasks",
  "consultations",
  "leads",
  "notifications",
  "discoveries"
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const { resource, id } = await params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json({ error: "Resource not found or read-only" }, { status: 404 });
    }

    const body = await req.json();

    let collectionKey = resource;
    if (resource === "tasks") collectionKey = "portalTasks";
    if (resource === "consultations") collectionKey = "portalConsultations";
    if (resource === "leads") collectionKey = "leads";
    if (resource === "notifications") collectionKey = "portalNotifications";
    if (resource === "discoveries") collectionKey = "discoveries";

    const updated = updateInCollection(collectionKey, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

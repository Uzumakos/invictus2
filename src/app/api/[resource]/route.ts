import { NextRequest, NextResponse } from "next/server";
import { getCollection, addToCollection } from "@/lib/db";
import crypto from "crypto";

const ALLOWED_RESOURCES = [
  "tasks",
  "documents",
  "messages",
  "projects",
  "payments",
  "consultations",
  "notifications",
  "leads",
  "discoveries"
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const { resource } = await params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Map resource names to collection keys in db.json if they differ
    let collectionKey = resource;
    if (resource === "tasks") collectionKey = "portalTasks";
    if (resource === "documents") collectionKey = "portalDocuments";
    if (resource === "messages") collectionKey = "portalMessages";
    if (resource === "projects") collectionKey = "portalProjects";
    if (resource === "payments") collectionKey = "portalPayments";
    if (resource === "consultations") collectionKey = "portalConsultations";
    if (resource === "notifications") collectionKey = "portalNotifications";
    if (resource === "discoveries") collectionKey = "discoveries";

    const items = getCollection(collectionKey);
    return NextResponse.json(items);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
) {
  try {
    const { resource } = await params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const body = await req.json();

    let collectionKey = resource;
    let prefix = "item";
    if (resource === "tasks") { collectionKey = "portalTasks"; prefix = "task"; }
    if (resource === "documents") { collectionKey = "portalDocuments"; prefix = "doc"; }
    if (resource === "messages") { collectionKey = "portalMessages"; prefix = "msg"; }
    if (resource === "projects") { collectionKey = "portalProjects"; prefix = "proj"; }
    if (resource === "payments") { collectionKey = "portalPayments"; prefix = "pay"; }
    if (resource === "consultations") { collectionKey = "portalConsultations"; prefix = "con"; }
    if (resource === "notifications") { collectionKey = "portalNotifications"; prefix = "notif"; }
    if (resource === "leads") { collectionKey = "leads"; prefix = "lead"; }
    if (resource === "discoveries") { collectionKey = "discoveries"; prefix = "disc"; }

    const newItem = {
      id: `${prefix}_${crypto.randomBytes(6).toString("hex")}`,
      createdAt: new Date().toISOString(),
      ...body,
    };

    addToCollection(collectionKey, newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

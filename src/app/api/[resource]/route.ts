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
  "discoveries",
  "translations",
  "case-studies",
  "testimonials",
  "faq-items",
  "training-programs",
  "organizations",
  "consulting-services"
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

    // CMS collections
    if (resource === "case-studies") collectionKey = "projects";
    if (resource === "faq-items") collectionKey = "faqItems";
    if (resource === "training-programs") collectionKey = "trainingPrograms";
    if (resource === "consulting-services") collectionKey = "consultingServices";

    const items = await getCollection(collectionKey);
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

    // CMS collections
    if (resource === "case-studies") { collectionKey = "projects"; prefix = "proj"; }
    if (resource === "testimonials") { collectionKey = "testimonials"; prefix = "test"; }
    if (resource === "faq-items") { collectionKey = "faqItems"; prefix = "faq"; }
    if (resource === "training-programs") { collectionKey = "trainingPrograms"; prefix = "train"; }
    if (resource === "organizations") { collectionKey = "organizations"; prefix = "org"; }
    if (resource === "consulting-services") { collectionKey = "consultingServices"; prefix = "srv"; }
    if (resource === "translations") { collectionKey = "translations"; }

    let newItem: any;
    if (resource === "translations") {
      newItem = {
        key: body.key,
        en: body.en,
        fr: body.fr
      };
    } else {
      newItem = {
        id: body.id || `${prefix}_${crypto.randomBytes(6).toString("hex")}`,
        createdAt: new Date().toISOString(),
        ...body,
      };
    }

    await addToCollection(collectionKey, newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


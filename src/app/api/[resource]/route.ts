import { NextRequest, NextResponse } from "next/server";
import { getCollection, addToCollection } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
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
  "consulting-services",
  "media",
  "sections",
  "business-profile",
  "client-billing-profiles",
  "consulting-hours",
  "client-milestones",
  "client-digital-scores",
  "brand-assets",
  "seo-metadata"
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

    // CMS, ERP & Telemetry collections
    if (resource === "case-studies") collectionKey = "projects";
    if (resource === "faq-items") collectionKey = "faqItems";
    if (resource === "training-programs") collectionKey = "trainingPrograms";
    if (resource === "consulting-services") collectionKey = "consultingServices";
    if (resource === "media") collectionKey = "mediaLibrary";
    if (resource === "sections") collectionKey = "pageSections";
    if (resource === "business-profile") collectionKey = "businessProfile";
    if (resource === "client-billing-profiles") collectionKey = "clientBillingProfiles";
    if (resource === "consulting-hours") collectionKey = "consultingHours";
    if (resource === "client-milestones") collectionKey = "clientMilestones";
    if (resource === "client-digital-scores") collectionKey = "clientDigitalScores";
    if (resource === "brand-assets") collectionKey = "brandAssets";
    if (resource === "seo-metadata") collectionKey = "seoMetadata";

    let items = await getCollection(collectionKey);

    // Dynamic filtering for public users vs administrators
    const adminToken = req.cookies.get("admin_token")?.value;
    let isAdmin = false;
    if (adminToken) {
      try {
        const payload = await verifyToken(adminToken);
        if (payload) isAdmin = true;
      } catch {}
    }

    // If public request, filter out draft or archived status records
    if (!isAdmin) {
      if (["projects", "trainingPrograms", "consultingServices"].includes(collectionKey)) {
        items = items.filter((item: any) => item.status === "published" || !item.status);
      }
    }

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

    // CMS, ERP & Telemetry collections
    if (resource === "case-studies") { collectionKey = "projects"; prefix = "proj"; }
    if (resource === "testimonials") { collectionKey = "testimonials"; prefix = "test"; }
    if (resource === "faq-items") { collectionKey = "faqItems"; prefix = "faq"; }
    if (resource === "training-programs") { collectionKey = "trainingPrograms"; prefix = "train"; }
    if (resource === "organizations") { collectionKey = "organizations"; prefix = "org"; }
    if (resource === "consulting-services") { collectionKey = "consultingServices"; prefix = "srv"; }
    if (resource === "translations") { collectionKey = "translations"; }
    if (resource === "media") { collectionKey = "mediaLibrary"; prefix = "med"; }
    if (resource === "sections") { collectionKey = "pageSections"; prefix = "sec"; }
    if (resource === "business-profile") { collectionKey = "businessProfile"; prefix = "biz"; }
    if (resource === "client-billing-profiles") { collectionKey = "clientBillingProfiles"; prefix = "cli"; }
    if (resource === "consulting-hours") { collectionKey = "consultingHours"; prefix = "hrs"; }
    if (resource === "client-milestones") { collectionKey = "clientMilestones"; prefix = "mst"; }
    if (resource === "client-digital-scores") { collectionKey = "clientDigitalScores"; prefix = "ds"; }
    if (resource === "brand-assets") { collectionKey = "brandAssets"; prefix = "brand"; }
    if (resource === "seo-metadata") { collectionKey = "seoMetadata"; prefix = "seo"; }

    let newItem: any;
    if (resource === "translations") {
      newItem = {
        key: body.key,
        en: body.en,
        fr: body.fr
      };
    } else {
      const isUuidResource = [
        "client-billing-profiles",
        "client-milestones",
        "client-digital-scores",
        "consulting-hours",
        "documents",
        "brand-assets",
        "seo-metadata",
        "testimonials",
        "sections",
        "business-profile"
      ].includes(resource);

      const hasNoCreatedAt = [
        "business-profile",
        "brand-assets",
        "seo-metadata"
      ].includes(resource);

      newItem = {
        id: body.id || (isUuidResource ? crypto.randomUUID() : `${prefix}_${crypto.randomBytes(6).toString("hex")}`),
        ...(hasNoCreatedAt ? {} : { createdAt: new Date().toISOString() }),
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

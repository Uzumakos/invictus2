import { NextRequest, NextResponse } from "next/server";
import { updateInCollection, deleteFromCollection } from "@/lib/db";

const ALLOWED_RESOURCES = [
  "tasks",
  "consultations",
  "leads",
  "notifications",
  "discoveries",
  "recommendation-rules",
  "payments",
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
  "seo-metadata",
  "projects"
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
    if (resource === "recommendation-rules") collectionKey = "recommendationRules";
    if (resource === "payments") collectionKey = "portalPayments";
    if (resource === "projects") collectionKey = "portalProjects";

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

    const updated = await updateInCollection(collectionKey, id, body);
    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const { resource, id } = await params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json({ error: "Resource not found or read-only" }, { status: 404 });
    }

    let collectionKey = resource;
    if (resource === "tasks") collectionKey = "portalTasks";
    if (resource === "consultations") collectionKey = "portalConsultations";
    if (resource === "leads") collectionKey = "leads";
    if (resource === "notifications") collectionKey = "portalNotifications";
    if (resource === "discoveries") collectionKey = "discoveries";
    if (resource === "payments") collectionKey = "portalPayments";
    if (resource === "projects") collectionKey = "portalProjects";

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

    const deleted = await deleteFromCollection(collectionKey, id);
    if (!deleted) {
      return NextResponse.json({ error: "Item not found or failed to delete" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

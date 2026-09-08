import { NextRequest, NextResponse } from "next/server";
import { updateInCollection, deleteFromCollection, getCollection } from "@/lib/db";
import { calculateLeadScoreAndMetrics } from "@/lib/leadScoring";
import {
  getAdminFromRequest,
  getPortalUserFromRequest,
  PORTAL_PATCH_RESOURCES,
  PORTAL_DELETE_RESOURCES,
  assertPortalOwnsItem,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/apiAuth";

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
  "projects",
  "revenues",
  "expenses",
  "subscriptions",
  "budgets",
  "funding-goals",
  "funding-contributions",
  "asset-registry"
];

async function resolveCollectionKey(resource: string): Promise<string> {
  let collectionKey = resource;
  if (resource === "tasks") collectionKey = "portalTasks";
  if (resource === "messages") collectionKey = "portalMessages";
  if (resource === "consultations") collectionKey = "portalConsultations";
  if (resource === "leads") collectionKey = "leads";
  if (resource === "notifications") collectionKey = "portalNotifications";
  if (resource === "discoveries") collectionKey = "discoveries";
  if (resource === "recommendation-rules") collectionKey = "recommendationRules";
  if (resource === "payments") collectionKey = "portalPayments";
  if (resource === "projects") collectionKey = "portalProjects";
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
  if (resource === "revenues") collectionKey = "revenues";
  if (resource === "expenses") collectionKey = "expenses";
  if (resource === "subscriptions") collectionKey = "subscriptions";
  if (resource === "budgets") collectionKey = "budgets";
  if (resource === "funding-goals") collectionKey = "fundingGoals";
  if (resource === "funding-contributions") collectionKey = "fundingContributions";
  if (resource === "asset-registry") collectionKey = "assetRegistry";
  return collectionKey;
}

async function authorizeMutation(
  req: NextRequest,
  resource: string,
  id: string,
  mode: "patch" | "delete"
): Promise<NextResponse | null> {
  const admin = await getAdminFromRequest(req);
  if (admin) return null;

  const allowedSet =
    mode === "patch" ? PORTAL_PATCH_RESOURCES : PORTAL_DELETE_RESOURCES;
  if (!allowedSet.has(resource)) {
    return unauthorizedResponse();
  }

  const portalUser = await getPortalUserFromRequest(req);
  if (!portalUser) {
    return unauthorizedResponse();
  }

  const collectionKey = await resolveCollectionKey(resource);
  const owns = await assertPortalOwnsItem(
    collectionKey,
    id,
    portalUser.email
  );
  if (!owns) {
    return forbiddenResponse();
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> }
) {
  try {
    const { resource, id } = await params;
    if (!ALLOWED_RESOURCES.includes(resource)) {
      return NextResponse.json({ error: "Resource not found or read-only" }, { status: 404 });
    }

    const authError = await authorizeMutation(req, resource, id, "patch");
    if (authError) return authError;

    const body = await req.json();

    let collectionKey = await resolveCollectionKey(resource);

    let bodyToUpdate = { ...body };

    if (resource === "leads") {
      const leadsList = await getCollection<any>("leads");
      const currentLead = leadsList.find((l: any) => l.id === id);
      if (currentLead) {
        const mergedLead = { ...currentLead, ...body };
        const isGeneralInquiry = mergedLead.status === "lead";
        const scoringResult = calculateLeadScoreAndMetrics({
          budget: mergedLead.budget,
          timeline: mergedLead.timeline,
          notes: mergedLead.notes,
          companyType: mergedLead.companyType,
          projectType: mergedLead.projectType,
          previousRelationship: mergedLead.previousRelationship,
        });

        bodyToUpdate = {
          ...bodyToUpdate,
          leadScore: isGeneralInquiry ? 0 : scoringResult.leadScore,
          priority: isGeneralInquiry ? "Low Priority" : scoringResult.priority,
          probabilityOfClosing: isGeneralInquiry ? 0 : (body.probabilityOfClosing !== undefined ? Number(body.probabilityOfClosing) : scoringResult.probabilityOfClosing),
          estimatedValue: body.estimatedValue !== undefined ? Number(body.estimatedValue) : (currentLead.estimatedValue || 0),
          lastActivity: new Date().toISOString(),
        };
      }
    }

    const updated = await updateInCollection(collectionKey, id, bodyToUpdate);
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

    const authError = await authorizeMutation(req, resource, id, "delete");
    if (authError) return authError;

    let collectionKey = await resolveCollectionKey(resource);

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

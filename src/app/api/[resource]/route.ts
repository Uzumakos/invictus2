import { NextRequest, NextResponse } from "next/server";
import { getCollection, addToCollection } from "@/lib/db";
import { calculateLeadScoreAndMetrics } from "@/lib/leadScoring";
import {
  getAdminFromRequest,
  getPortalUserFromRequest,
  PUBLIC_READ_RESOURCES,
  PUBLIC_POST_RESOURCES,
  PORTAL_READ_RESOURCES,
  PORTAL_POST_RESOURCES,
  filterItemsForPortalClient,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/apiAuth";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  "recommendation-rules",
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
  "clients",
  "whatsapp-templates",
  "whatsapp-interactions",
  "revenues",
  "expenses",
  "subscriptions",
  "budgets",
  "funding-goals",
  "funding-contributions",
  "asset-registry"
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
    if (resource === "recommendation-rules") collectionKey = "recommendationRules";

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
    if (resource === "clients") collectionKey = "clients";
    if (resource === "whatsapp-templates") collectionKey = "whatsappTemplates";
    if (resource === "whatsapp-interactions") collectionKey = "whatsappInteractions";
    if (resource === "revenues") collectionKey = "revenues";
    if (resource === "expenses") collectionKey = "expenses";
    if (resource === "subscriptions") collectionKey = "subscriptions";
    if (resource === "budgets") collectionKey = "budgets";
    if (resource === "funding-goals") collectionKey = "fundingGoals";
    if (resource === "funding-contributions") collectionKey = "fundingContributions";
    if (resource === "asset-registry") collectionKey = "assetRegistry";

    let items = await getCollection(collectionKey);

    const admin = await getAdminFromRequest(req);

    if (PUBLIC_READ_RESOURCES.has(resource)) {
      if (!admin) {
        if (
          ["projects", "trainingPrograms", "consultingServices"].includes(
            collectionKey
          )
        ) {
          items = items.filter(
            (item: { status?: string }) =>
              item.status === "published" || !item.status
          );
        }
      }
      return NextResponse.json(items);
    }

    if (PORTAL_READ_RESOURCES.has(resource)) {
      if (admin) {
        return NextResponse.json(items);
      }
      const portalUser = await getPortalUserFromRequest(req);
      if (!portalUser) {
        return unauthorizedResponse();
      }
      items = filterItemsForPortalClient(
        items as Record<string, unknown>[],
        portalUser.email
      );
      return NextResponse.json(items);
    }

    if (!admin) {
      return unauthorizedResponse();
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

    const admin = await getAdminFromRequest(req);
    const portalUser = await getPortalUserFromRequest(req);

    if (PUBLIC_POST_RESOURCES.has(resource)) {
      // Public form submissions (no session required)
    } else if (PORTAL_POST_RESOURCES.has(resource)) {
      if (!admin && !portalUser) {
        return unauthorizedResponse();
      }
    } else if (!admin) {
      return unauthorizedResponse();
    }

    let body = await req.json();

    if (
      PORTAL_POST_RESOURCES.has(resource) &&
      portalUser &&
      !admin
    ) {
      const targetEmail = portalUser.email.toLowerCase().trim();
      const bodyEmail = (
        body.clientEmail ??
        body.client_email ??
        ""
      )
        .toString()
        .toLowerCase()
        .trim();
      if (bodyEmail && bodyEmail !== targetEmail) {
        return forbiddenResponse("Cannot create records for another client");
      }
      body = { ...body, clientEmail: targetEmail };
    }

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
    if (resource === "revenues") { collectionKey = "revenues"; prefix = "rev"; }
    if (resource === "expenses") { collectionKey = "expenses"; prefix = "exp"; }
    if (resource === "subscriptions") { collectionKey = "subscriptions"; prefix = "sub"; }
    if (resource === "budgets") { collectionKey = "budgets"; prefix = "bud"; }
    if (resource === "funding-goals") { collectionKey = "fundingGoals"; prefix = "fg"; }
    if (resource === "funding-contributions") { collectionKey = "fundingContributions"; prefix = "fc"; }
    if (resource === "asset-registry") { collectionKey = "assetRegistry"; prefix = "ast"; }

    let newItem: any;
    if (resource === "translations") {
      newItem = {
        key: body.key,
        en: body.en,
        fr: body.fr
      };
    } else if (resource === "discoveries") {
      const answersObj = body.answers ? { ...body.answers } : { ...body };
      delete answersObj.summary;
      delete answersObj.id;
      delete answersObj.createdAt;
      delete answersObj.created_at;
      delete answersObj.archived;

      newItem = {
        id: body.id || `disc_${crypto.randomBytes(6).toString("hex")}`,
        createdAt: new Date().toISOString(),
        answers: answersObj,
        summary: body.summary || {},
        archived: body.archived ?? false
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
        "business-profile",
        "whatsapp-interactions",   // whatsapp_interactions.id is UUID PRIMARY KEY
        "whatsapp-templates",      // whatsapp_templates.id is VARCHAR but allow UUID override
        "clients",                  // clients.id is UUID PRIMARY KEY
        "revenues",
        "expenses",
        "subscriptions",
        "budgets",
        "funding-goals",
        "funding-contributions",
        "asset-registry"
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

      if (resource === "leads") {
        const isGeneralInquiry = body.status === "lead";
        const scoringResult = calculateLeadScoreAndMetrics({
          budget: body.budget,
          timeline: body.timeline,
          notes: body.notes,
          companyType: body.companyType,
          projectType: body.projectType,
          previousRelationship: body.previousRelationship,
        });

        newItem = {
          ...newItem,
          leadScore: isGeneralInquiry ? 0 : scoringResult.leadScore,
          priority: isGeneralInquiry ? "Low Priority" : scoringResult.priority,
          estimatedValue: body.estimatedValue !== undefined ? Number(body.estimatedValue) : 0,
          probabilityOfClosing: isGeneralInquiry ? 0 : scoringResult.probabilityOfClosing,
          acquisitionSource: isGeneralInquiry ? "General Inquiry" : (body.acquisitionSource || body.source || "Proposal Request"),
          lastActivity: new Date().toISOString(),
          nextAction: body.nextAction || (isGeneralInquiry ? "Review general inquiry" : "Review proposal request"),
          assignedConsultant: body.assignedConsultant || "Amedee Erns Baptiste",
          tags: body.tags || (body.projectType ? [body.projectType] : []),
        };
      }
    }

    await addToCollection(collectionKey, newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    console.error(err);
    // Surface the actual error message for better client-side error display
    const message = err?.message || "Internal server error";
    const code = err?.code;
    return NextResponse.json({ error: message, code }, { status: 500 });
  }
}

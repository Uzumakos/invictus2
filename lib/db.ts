import { supabase, getSupabaseAdmin } from "./supabaseClient";

const tableMap: Record<string, string> = {
  settings: "site_settings",
  paymentConfig: "payment_methods",
  organizations: "organizations",
  bookings: "bookings",
  leads: "leads",
  portalTasks: "portal_tasks",
  portalDocuments: "portal_documents",
  portalMessages: "portal_messages",
  portalProjects: "portal_projects",
  portalPayments: "portal_payments",
  portalNotifications: "portal_notifications",
  discoveries: "discoveries",
  recommendationRules: "recommendation_rules",
  projects: "projects",
  testimonials: "testimonials",
  faqItems: "faq_items",
  articles: "articles",
  trainingPrograms: "training_programs",
  users: "users",
  consultingServices: "consulting_services",
  mediaLibrary: "media_library",
  pageSections: "page_sections",
  businessProfile: "business_profile",
  clientBillingProfiles: "client_billing_profiles",
  commercialDocuments: "commercial_documents",
  commercialDocumentItems: "commercial_document_items",
  consultingHours: "consulting_hours",
  clientMilestones: "client_milestones",
  clientDigitalScores: "client_digital_scores",
  brandAssets: "brand_assets",
  seoMetadata: "seo_metadata",
  clients: "clients",
  whatsappTemplates: "whatsapp_templates",
  whatsappInteractions: "whatsapp_interactions"
};

// Helper to map snake_case database columns to camelCase JSON keys
function mapRowToCamelCase(row: Record<string, any> | null): Record<string, any> | null {
  if (!row) return null;
  const newObj: Record<string, any> = {};
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = row[key];
  }
  return newObj;
}

// Helper to map camelCase JSON keys to snake_case database columns
function mapItemToSnakeCase(item: Record<string, any> | null): Record<string, any> | null {
  if (!item) return null;
  const newObj: Record<string, any> = {};
  for (const key in item) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = item[key];
  }
  return newObj;
}

export async function loadDB(): Promise<Record<string, unknown>> {
  try {
    const dbClient = getSupabaseAdmin();
    const [
      { data: settings },
      { data: methods },
      { data: projects },
      { data: testimonials },
      { data: faqItems },
      { data: articles },
      { data: trainingPrograms },
      { data: organizations },
      { data: users },
      { data: consultingServices }
    ] = await Promise.all([
      dbClient.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      dbClient.from("payment_methods").select("*"),
      dbClient.from("projects").select("*"),
      dbClient.from("testimonials").select("*"),
      dbClient.from("faq_items").select("*"),
      dbClient.from("articles").select("*"),
      dbClient.from("training_programs").select("*"),
      dbClient.from("organizations").select("*"),
      dbClient.from("users").select("*"),
      dbClient.from("consulting_services").select("*")
    ]);

    const formattedSettings = settings ? {
      trainingEnabled: settings.training_enabled,
      profileImageUrl: settings.profile_image_url,
      adminPath: settings.admin_path,
      socialLinks: settings.social_links
    } : {
      trainingEnabled: true,
      profileImageUrl: "",
      adminPath: "/admin",
      socialLinks: { github: "", linkedin: "", twitter: "" }
    };

    return {
      settings: formattedSettings,
      paymentConfig: { methods: (methods || []).map(m => mapRowToCamelCase(m)) },
      projects: (projects || []).map(p => mapRowToCamelCase(p)),
      testimonials: (testimonials || []).map(t => mapRowToCamelCase(t)),
      faqItems: (faqItems || []).map(f => mapRowToCamelCase(f)),
      articles: (articles || []).map(a => mapRowToCamelCase(a)),
      trainingPrograms: (trainingPrograms || []).map(t => mapRowToCamelCase(t)),
      organizations: (organizations || []).map(o => mapRowToCamelCase(o)),
      users: (users || []).map(u => mapRowToCamelCase(u)),
      consultingServices: (consultingServices || []).map(c => mapRowToCamelCase(c))
    };
  } catch (err) {
    console.error("Failed to load Supabase DB context:", err);
    return {
      settings: { trainingEnabled: true, profileImageUrl: "", adminPath: "/admin", socialLinks: {} },
      paymentConfig: { methods: [] },
      projects: [],
      testimonials: [],
      faqItems: [],
      articles: [],
      trainingPrograms: [],
      organizations: [],
      users: [],
      consultingServices: []
    };
  }
}

export async function saveDB(data: Record<string, unknown>): Promise<void> {
  try {
    const dbClient = getSupabaseAdmin();
    if (data.settings) {
      const s = data.settings as any;
      await dbClient.from("site_settings").upsert({
        id: 1,
        training_enabled: s.trainingEnabled ?? true,
        profile_image_url: s.profileImageUrl || "",
        admin_path: s.adminPath || "/admin",
        social_links: s.socialLinks || { github: "", linkedin: "", twitter: "" }
      });
    }

    if (data.paymentConfig && (data.paymentConfig as any).methods) {
      const methods = (data.paymentConfig as any).methods;
      try {
        const { data: existing } = await dbClient.from("payment_methods").select("id");
        if (existing) {
          const currentIds = new Set(methods.map((m: any) => m.id));
          const toDelete = existing.filter(e => !currentIds.has(e.id)).map(e => e.id);
          if (toDelete.length > 0) {
            await dbClient.from("payment_methods").delete().in("id", toDelete);
          }
        }

        const rows = methods.map((m: any) => mapItemToSnakeCase(m));
        const { error: pmErr } = await dbClient.from("payment_methods").upsert(rows);
        if (pmErr) {
          console.error("Failed to save payment_methods in Supabase:", pmErr.message);
        }
      } catch (err: any) {
        console.error("Failed to upsert payment_methods:", err.message);
      }
    }
  } catch (err) {
    console.error("Failed to save site_settings or payment_methods in Supabase:", err);
  }
}

export async function getCollection<T>(key: string): Promise<T[]> {
  const dbClient = getSupabaseAdmin();
  const table = tableMap[key] || key;
  const { data, error } = await dbClient.from(table).select("*");
  if (error) {
    console.error(`Error fetching collection ${key}:`, error.message);
    return [];
  }
  let items = (data || []).map(row => mapRowToCamelCase(row)) as T[];

  // Auto-seed default consulting offers if database table is empty
  if (key === "consultingServices" && items.length === 0) {
    try {
      const { consultingOffers } = await import("./data");
      if (consultingOffers && consultingOffers.length > 0) {
        for (const offer of consultingOffers) {
          const dbRow = mapItemToSnakeCase({ ...offer, status: "published" });
          if (dbRow) {
            await dbClient.from("consulting_services").insert(dbRow);
          }
        }
        const { data: reFetched } = await dbClient.from("consulting_services").select("*");
        if (reFetched && reFetched.length > 0) {
          items = reFetched.map(row => mapRowToCamelCase(row)) as T[];
        }
      }
    } catch (err) {
      console.error("Auto-seed consultingServices failed:", err);
    }
  }

  return items;
}

export async function addToCollection<T extends { id: string }>(
  key: string,
  item: T
): Promise<T> {
  const dbClient = getSupabaseAdmin();
  const table = tableMap[key] || key;
  const dbRow = mapItemToSnakeCase(item);
  const { error } = await dbClient.from(table).insert(dbRow);
  if (error) {
    console.error(`Error adding to collection ${key}:`, error.message);
    if (error.code === "PGRST205" || error.code === "PGRST204" || error.message?.includes("schema cache")) {
      console.warn(`Table "${table}" or missing column for collection "${key}" requires migration in Supabase. Run schema_v6_erp_billing.sql.`);
      if (dbRow) {
        delete dbRow.status;
        delete dbRow.tiers;
        const { error: retryErr } = await dbClient.from(table).insert(dbRow);
        if (!retryErr) return item;
      }
      return item;
    }
    throw error;
  }
  return item;
}

export async function updateInCollection<T extends { id?: string; key?: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const dbClient = getSupabaseAdmin();
  const table = tableMap[key] || key;
  const dbRow = mapItemToSnakeCase(updates) || {};
  const pkName = table === "translations" ? "key" : "id";
  const { data, error } = await dbClient
    .from(table)
    .update(dbRow)
    .eq(pkName, id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(`Error updating in collection ${key} for id ${id}:`, error.message);
    if (error.code === "PGRST205" || error.code === "PGRST204" || error.message?.includes("schema cache")) {
      console.warn(`Table "${table}" or missing column for collection "${key}" requires migration in Supabase. Run schema_v6_erp_billing.sql.`);
      if (dbRow) {
        delete dbRow.status;
        delete dbRow.tiers;
        const { data: retryData, error: retryErr } = await dbClient
          .from(table)
          .update(dbRow)
          .eq(pkName, id)
          .select("*")
          .maybeSingle();

        if (!retryErr && retryData) {
          return mapRowToCamelCase(retryData) as T;
        }
      }
      return { id, ...updates } as T;
    }
    return null;
  }
  return mapRowToCamelCase(data) as T;
}

export async function deleteFromCollection(key: string, id: string): Promise<boolean> {
  const dbClient = getSupabaseAdmin();
  const table = tableMap[key] || key;
  const pkName = table === "translations" ? "key" : "id";
  const { error } = await dbClient.from(table).delete().eq(pkName, id);
  if (error) {
    console.error(`Error deleting from collection ${key} for id ${id}:`, error.message);
    if (error.code === "PGRST205" || error.code === "PGRST204" || error.message?.includes("schema cache")) {
      return true;
    }
    return false;
  }
  return true;
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const dbClient = getSupabaseAdmin();
    const { data, error } = await dbClient
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return fallback;
    const mapped = mapRowToCamelCase(data);
    return (mapped?.[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function patchSettings(updates: Record<string, unknown>): Promise<void> {
  try {
    const dbClient = getSupabaseAdmin();
    const dbRow = mapItemToSnakeCase(updates) || {};
    await dbClient
      .from("site_settings")
      .update(dbRow)
      .eq("id", 1);
  } catch (err) {
    console.error("Failed to patch site_settings:", err);
  }
}

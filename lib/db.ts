import { supabase, getSupabaseAdmin } from "./supabaseClient";
import { initialTestimonials, initialFaqItems } from "./data";
import crypto from "crypto";

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

    const parsedTestimonials = (testimonials || []).map(t => mapRowToCamelCase(t));
    const parsedFaqItems = (faqItems || []).map(f => mapRowToCamelCase(f));

    return {
      settings: formattedSettings,
      paymentConfig: { methods: (methods || []).map(m => mapRowToCamelCase(m)) },
      projects: (projects || []).map(p => mapRowToCamelCase(p)),
      testimonials: parsedTestimonials.length > 0 ? parsedTestimonials : initialTestimonials,
      faqItems: parsedFaqItems.length > 0 ? parsedFaqItems : initialFaqItems,
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
      testimonials: initialTestimonials,
      faqItems: initialFaqItems,
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

    if (data.users && Array.isArray(data.users)) {
      try {
        for (const u of data.users as any[]) {
          const uRow = mapItemToSnakeCase(u);
          if (uRow) {
            await dbClient.from("users").upsert(uRow);
          }
        }
      } catch (uErr: any) {
        console.error("Failed to save users in Supabase:", uErr.message);
      }
    }
  } catch (err) {
    console.error("Failed to save site_settings, payment_methods, or users in Supabase:", err);
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

  // Fallback for clients if clients table is empty by querying client_billing_profiles
  if (key === "clients" && items.length === 0) {
    try {
      const { data: bData } = await dbClient.from("client_billing_profiles").select("*");
      if (bData && bData.length > 0) {
        items = bData.map(row => {
          const camel = mapRowToCamelCase(row) || {};
          return {
            id: camel.id,
            name: camel.primaryContactName || camel.companyName || "Kind B",
            fullName: camel.primaryContactName || camel.companyName || "Kind B",
            email: camel.email,
            company: camel.companyName,
            whatsappNumber: camel.whatsappNumber || camel.phone || "+50948476300",
            countryCode: camel.countryCode || "US",
            preferredLanguage: camel.preferredLanguage || "fr",
            createdAt: camel.createdAt
          };
        }) as T[];
      }
    } catch (err) {
      console.error("Fallback clients from client_billing_profiles failed:", err);
    }
  }

  // Fallback for clientBillingProfiles if table is empty by querying clients table
  if (key === "clientBillingProfiles" && items.length === 0) {
    try {
      const { data: cData } = await dbClient.from("clients").select("*");
      if (cData && cData.length > 0) {
        items = cData.map(row => {
          const camel = mapRowToCamelCase(row) || {};
          return {
            id: camel.id,
            companyName: camel.company || camel.fullName || camel.name || "Client",
            primaryContactName: camel.fullName || camel.name || "Client",
            email: camel.email,
            billingAddress: "Port-au-Prince",
            country: "Haiti",
            phone: camel.whatsappNumber || camel.phone || "",
            whatsappNumber: camel.whatsappNumber || camel.phone || "",
            countryCode: camel.countryCode || "US",
            currency: "USD",
            preferredLanguage: camel.preferredLanguage || "fr",
            paymentTerms: "NET_30",
            defaultDiscount: 0,
            isApproved: true,
            createdAt: camel.createdAt
          };
        }) as T[];
      }
    } catch (err) {
      console.error("Fallback clientBillingProfiles from clients failed:", err);
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

  if ((key === "clientBillingProfiles" || table === "client_billing_profiles") && dbRow) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!dbRow.client_id || !uuidRegex.test(String(dbRow.client_id))) {
      dbRow.client_id = crypto.randomUUID();
    }
  }

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
        throw retryErr;
      }
    }
    throw error;
  }

  // Dual sync: If adding to clientBillingProfiles, also sync to clients table in Supabase
  if (key === "clientBillingProfiles" || table === "client_billing_profiles") {
    try {
      const clientRow = {
        id: item.id,
        full_name: (item as any).primaryContactName || (item as any).companyName || "Client",
        email: (item as any).email,
        whatsapp_number: (item as any).whatsappNumber || (item as any).phone || "",
        country_code: (item as any).countryCode || "US",
        preferred_language: (item as any).preferredLanguage || "fr"
      };
      await dbClient.from("clients").upsert(clientRow);
    } catch (cErr) {
      console.error("Dual sync to clients table failed:", cErr);
    }
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

  // Dual sync: If updating clientBillingProfiles, also sync to clients table in Supabase
  if (key === "clientBillingProfiles" || table === "client_billing_profiles") {
    try {
      const u = updates as any;
      const clientRow: any = { id };
      if (u.primaryContactName || u.companyName) clientRow.full_name = u.primaryContactName || u.companyName;
      if (u.email) clientRow.email = u.email;
      if (u.whatsappNumber || u.phone) clientRow.whatsapp_number = u.whatsappNumber || u.phone;
      if (u.countryCode) clientRow.country_code = u.countryCode;
      if (u.preferredLanguage) clientRow.preferred_language = u.preferredLanguage;
      await dbClient.from("clients").upsert(clientRow);
    } catch (cErr) {
      console.error("Dual sync update to clients table failed:", cErr);
    }
  }

  return mapRowToCamelCase(data) as T;
}

export async function deleteFromCollection(key: string, id: string): Promise<boolean> {
  const dbClient = getSupabaseAdmin();
  const table = tableMap[key] || key;
  const pkName = table === "translations" ? "key" : "id";
  const { error } = await dbClient.from(table).delete().eq(pkName, id);

  if (key === "clientBillingProfiles" || table === "client_billing_profiles") {
    try {
      await dbClient.from("clients").delete().eq("id", id);
    } catch (cErr) {
      console.error("Dual sync delete from clients table failed:", cErr);
    }
  }

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

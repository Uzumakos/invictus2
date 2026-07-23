const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const ws = require("ws");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

const dbPath = path.join(__dirname, "../db.json");
if (!fs.existsSync(dbPath)) {
  console.error("Missing db.json file.");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

// Strict column whitelists matching schema.sql
const tableSchemas = {
  bookings: [
    "id", "client_name", "client_email", "goals", "context", "package_type",
    "service_id", "service_title", "date", "time", "timezone", "language",
    "status", "amount", "payment_method", "payment_reference", "questionnaire", "created_at"
  ],
  leads: [
    "id", "company", "contact_name", "email", "budget", "notes", "source",
    "status", "created_at", "lead_score", "priority", "estimated_value",
    "probability_of_closing", "acquisition_source", "last_activity", "next_action",
    "tags", "assigned_consultant", "website", "country", "timeline",
    "project_type", "expected_deliverables", "preferred_contact_method",
    "preferred_language", "attachment_url", "company_type", "previous_relationship",
    "reason"
  ],
  portal_tasks: [
    "id", "client_email", "title", "description", "deadline", "status",
    "assigned_to", "created_at"
  ],
  portal_documents: [
    "id", "client_email", "title", "category", "size", "url", "uploaded_at", "created_at"
  ],
  portal_messages: [
    "id", "client_email", "sender", "text", "attachment", "timestamp", "created_at"
  ],
  portal_projects: [
    "id", "client_email", "title", "description", "status", "progress",
    "start_date", "target_launch", "created_at"
  ],
  portal_payments: [
    "id", "client_email", "client_name", "amount", "currency", "service", "date", "status",
    "invoice_url", "payment_method", "payment_reference", "created_at"
  ],
  portal_notifications: [
    "id", "client_email", "text", "type", "read", "timestamp", "created_at"
  ],
  discoveries: [
    "id", "answers", "summary", "archived", "created_at"
  ],
  projects: [
    "id", "title", "category", "image", "technologies", "description",
    "problem", "research", "architecture", "challenges", "solutions", "results", "lessons", "created_at"
  ],
  testimonials: [
    "id", "name", "role", "company", "avatar", "content", "rating", "created_at"
  ],
  faq_items: [
    "id", "question", "answer", "created_at"
  ],
  articles: [
    "id", "published_at", "reading_time", "tags", "category", "title",
    "excerpt", "content", "created_at"
  ],
  training_programs: [
    "id", "title", "duration", "audience", "description", "syllabus", "created_at"
  ],
  users: [
    "id", "name", "email", "password_hash", "role", "created_at"
  ]
};

async function seed() {
  console.log("Seeding data from db.json to Supabase...");

  // 1. Seed site_settings
  if (db.settings) {
    console.log("Seeding site_settings...");
    const settings = db.settings;
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        id: 1,
        training_enabled: settings.trainingEnabled ?? true,
        profile_image_url: settings.profileImageUrl || "",
        admin_path: settings.adminPath || "/admin",
        social_links: settings.socialLinks || { github: "", linkedin: "", twitter: "" }
      });
    if (error) console.error("Error seeding site_settings:", error.message);
    else console.log("✅ Seeded site_settings");
  }

  // 2. Seed payment_methods
  if (db.paymentConfig && db.paymentConfig.methods) {
    console.log("Seeding payment_methods...");
    const methods = db.paymentConfig.methods.map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      enabled: m.enabled ?? true,
      logo_url: m.logoUrl || "",
      phone_number: m.phoneNumber || null,
      account_number: m.accountNumber || null,
      account_holder: m.accountHolder || null,
      email: m.email || null
    }));

    const { error } = await supabase.from("payment_methods").upsert(methods);
    if (error) console.error("Error seeding payment_methods:", error.message);
    else console.log("✅ Seeded payment_methods");
  }

  // 3. Seed recommendation_rules
  if (db.recommendationRules || db.recommendation_rules) {
    console.log("Seeding recommendation_rules...");
    const rulesSource = db.recommendationRules || db.recommendation_rules || [];
    const rules = rulesSource.map(r => ({
      id: r.id,
      conditions: r.conditions,
      condition_operator: r.condition_operator || r.conditionOperator || "AND",
      actions: r.actions,
      priority: r.priority || 0,
      enabled: r.enabled ?? true
    }));

    const { error } = await supabase.from("recommendation_rules").upsert(rules);
    if (error) console.error("Error seeding recommendation_rules:", error.message);
    else console.log("✅ Seeded recommendation_rules");
  }

  // 3b. Seed translations dynamically from messages/*.json
  const enPath = path.join(__dirname, "../messages/en.json");
  const frPath = path.join(__dirname, "../messages/fr.json");
  if (fs.existsSync(enPath) && fs.existsSync(frPath)) {
    console.log("Seeding translations dynamically from messages/en.json and fr.json...");
    try {
      const enRaw = JSON.parse(fs.readFileSync(enPath, "utf-8"));
      const frRaw = JSON.parse(fs.readFileSync(frPath, "utf-8"));
      
      const enFlat = flattenObject(enRaw);
      const frFlat = flattenObject(frRaw);
      
      const allKeys = Array.from(new Set([...Object.keys(enFlat), ...Object.keys(frFlat)]));
      const translationRows = allKeys.map(key => ({
        key,
        en: enFlat[key] || "",
        fr: frFlat[key] || ""
      }));

      // Upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < translationRows.length; i += batchSize) {
        const batch = translationRows.slice(i, i + batchSize);
        const { error } = await supabase.from("translations").upsert(batch);
        if (error) {
          console.error(`Error seeding translations batch starting at ${i}:`, error.message);
        }
      }
      console.log(`✅ Seeded ${translationRows.length} translation rows.`);
    } catch (err) {
      console.error("Error reading or seeding translation files:", err);
    }
  }

  // 4. Seed other collections
  const collectionsMap = [
    { key: "bookings", table: "bookings" },
    { key: "leads", table: "leads" },
    { key: "portalTasks", table: "portal_tasks" },
    { key: "portalDocuments", table: "portal_documents" },
    { key: "portalMessages", table: "portal_messages" },
    { key: "portalProjects", table: "portal_projects" },
    { key: "portalPayments", table: "portal_payments" },
    { key: "portalNotifications", table: "portal_notifications" },
    { key: "discoveries", table: "discoveries" },
    { key: "projects", table: "projects" },
    { key: "testimonials", table: "testimonials" },
    { key: "faqItems", table: "faq_items" },
    { key: "articles", table: "articles" },
    { key: "trainingPrograms", table: "training_programs" },
    { key: "users", table: "users" }
  ];

  for (const item of collectionsMap) {
    const records = db[item.key] || [];
    if (records.length > 0) {
      console.log(`Checking rows in "${item.table}" before seeding...`);
      const { count } = await supabase.from(item.table).select("*", { count: "exact", head: true });
      if (count === 0) {
        console.log(`Seeding table "${item.table}" with ${records.length} records...`);
        
        const mappedRecords = records.map(r => {
          const newObj = {};
          const whitelist = tableSchemas[item.table];
          
          for (const k in r) {
            const snakeKey = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            if (whitelist.includes(snakeKey)) {
              newObj[snakeKey] = r[k];
            }
          }
          
          // Fill in missing default required fields
          if (item.table === "bookings") {
            if (!newObj.client_name) newObj.client_name = r.clientName || r.clientEmail || "";
            if (!newObj.package_type) newObj.package_type = "Consulting";
            if (!newObj.service_title) newObj.service_title = { en: "Consulting", fr: "Consultation" };
          }
          
          return newObj;
        });

        const { error } = await supabase.from(item.table).insert(mappedRecords);
        if (error) console.error(`Error seeding "${item.table}":`, error.message);
        else console.log(`✅ Seeded "${item.table}"`);
      } else {
        console.log(`Skipped seeding "${item.table}" (already contains rows).`);
      }
    }
  }

  console.log("Seeding process completed.");
}

function flattenObject(obj, prefix = "") {
  let res = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        res = { ...res, ...flattenObject(val, newKey) };
      } else if (Array.isArray(val)) {
        val.forEach((item, index) => {
          if (typeof item === "object" && item !== null) {
            res = { ...res, ...flattenObject(item, `${newKey}.${index}`) };
          } else {
            res[`${newKey}.${index}`] = item;
          }
        });
      } else {
        res[newKey] = val;
      }
    }
  }
  return res;
}

seed();

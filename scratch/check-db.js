const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
const ws = require("ws");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

const tables = [
  "site_settings",
  "payment_methods",
  "bookings",
  "leads",
  "portal_tasks",
  "portal_documents",
  "portal_messages",
  "portal_projects",
  "portal_payments",
  "portal_notifications",
  "discoveries",
  "recommendation_rules",
  "organizations"
];

async function check() {
  console.log("Checking tables in Supabase...");
  for (const table of tables) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`❌ Table "${table}" does not exist or errored:`, error.message);
      } else {
        console.log(`✅ Table "${table}" exists. Row count: ${count}`);
      }
    } catch (err) {
      console.log(`❌ Table "${table}" failed:`, err.message);
    }
  }
}

check();

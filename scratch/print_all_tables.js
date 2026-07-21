const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
const ws = require("ws");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

async function dumpAll() {
  const tables = [
    "clients", "client_billing_profiles", "users", "bookings", "leads"
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*");
    console.log(`=== TABLE: ${t} (${data?.length || 0} rows) ===`);
    if (data && data.length > 0) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

dumpAll();

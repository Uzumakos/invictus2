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

async function checkServices() {
  const { data: services, error } = await supabase.from("consulting_services").select("*");
  console.log("=== CONSULTING SERVICES IN SUPABASE ===");
  if (error) console.error("Error:", error);
  else console.log(JSON.stringify(services, null, 2));
}

checkServices();

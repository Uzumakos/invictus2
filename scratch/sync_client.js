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

async function testInsert() {
  const { data: p } = await supabase.from("client_billing_profiles").select("*").single();

  const { data, error } = await supabase.from("clients").upsert({
    id: p.id,
    full_name: p.primary_contact_name || p.company_name || "Kind B",
    email: p.email,
    whatsapp_number: p.whatsapp_number || p.phone || "+50948476300",
    country_code: p.country_code || "US",
    preferred_language: p.preferred_language || "fr"
  }).select();

  console.log("Upsert Error:", error);
  console.log("Upserted Data:", data);
}

testInsert();

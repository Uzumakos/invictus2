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

function mapRowToCamelCase(row) {
  if (!row) return null;
  const newObj = {};
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = row[key];
  }
  return newObj;
}

async function checkDirect() {
  console.log("=== client_billing_profiles from Supabase ===");
  const { data: cbp } = await supabase.from("client_billing_profiles").select("*");
  console.log(JSON.stringify((cbp || []).map(mapRowToCamelCase), null, 2));

  console.log("=== payment_methods from Supabase ===");
  const { data: pm } = await supabase.from("payment_methods").select("*");
  console.log(JSON.stringify((pm || []).map(mapRowToCamelCase), null, 2));
}

checkDirect();

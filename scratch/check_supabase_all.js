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

async function checkAllSupabase() {
  console.log("=== SUPABASE CONSULTING SERVICES ===");
  const { data: cs, error: csErr } = await supabase.from("consulting_services").select("*");
  if (csErr) console.error(csErr);
  else console.log(JSON.stringify(cs, null, 2));

  console.log("=== SUPABASE CLIENT BILLING PROFILES ===");
  const { data: cbp, error: cbpErr } = await supabase.from("client_billing_profiles").select("*");
  if (cbpErr) console.error(cbpErr);
  else console.log(JSON.stringify(cbp, null, 2));

  console.log("=== SUPABASE CLIENTS ===");
  const { data: c, error: cErr } = await supabase.from("clients").select("*");
  if (cErr) console.error(cErr);
  else console.log(JSON.stringify(c, null, 2));

  console.log("=== SUPABASE PAYMENT METHODS ===");
  const { data: pm, error: pmErr } = await supabase.from("payment_methods").select("*");
  if (pmErr) console.error(pmErr);
  else console.log(JSON.stringify(pm, null, 2));
}

checkAllSupabase();

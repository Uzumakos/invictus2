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

async function checkBoth() {
  const { data: clients, error: cErr } = await supabase.from("clients").select("*");
  console.log("=== CLIENTS ===", clients);

  const { data: cbp, error: cbpErr } = await supabase.from("client_billing_profiles").select("*");
  console.log("=== CLIENT BILLING PROFILES ===", cbp);
}

checkBoth();

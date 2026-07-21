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

async function updateUnibankUsd() {
  const { data, error } = await supabase.from("payment_methods").upsert({
    id: "unibank_usd",
    name: "Unibank USD",
    type: "bank",
    enabled: true,
    logo_url: "https://ik.imagekit.io/tche25kem/Unibank%20logo%201.png?updatedAt=1752244982369",
    account_number: "108-2016-27764576",
    account_holder: "Amedee Erns Baptiste"
  }).select();

  console.log("Error:", error);
  console.log("Updated Unibank USD:", data);
}

updateUnibankUsd();

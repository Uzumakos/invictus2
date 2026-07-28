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

async function run() {
  console.log("Checking commercial_documents table...");
  const { data, error } = await supabase.from("commercial_documents").select("*").limit(1);
  if (error) {
    console.error("Error fetching commercial_documents:", error);
  } else {
    console.log("Columns in commercial_documents:", data && data[0] ? Object.keys(data[0]) : "No rows found");
  }

  console.log("\nChecking portal_payments table...");
  const { data: payData, error: payError } = await supabase.from("portal_payments").select("*").limit(1);
  if (payError) {
    console.error("Error fetching portal_payments:", payError);
  } else {
    console.log("Columns in portal_payments:", payData && payData[0] ? Object.keys(payData[0]) : "No rows found");
  }
}

run();

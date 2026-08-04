const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");
const ws = require("ws");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: ws },
});

async function run() {
  const { error } = await supabase.from("expenses").select("id").limit(1);
  if (error) {
    console.log("❌ Table 'expenses' does not exist or failed:", error.message);
  } else {
    console.log("✅ Table 'expenses' exists!");
  }
}

run();

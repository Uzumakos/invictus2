const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  try {
    const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const spec = await res.json();
    const rpcs = Object.keys(spec.paths).filter(p => p.startsWith("/rpc/"));
    console.log("Available RPCs:", rpcs);
  } catch (err) {
    console.error("Failed to query schema:", err.message);
  }
}

run();

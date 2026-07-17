const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  try {
    const res = await fetch(`${url}/rest/v1/users?role=eq.admin&apikey=${key}`);
    if (res.ok) {
      const users = await res.json();
      console.log("Admin Users in DB:", users);
    } else {
      console.error("Failed to query users table:", res.status);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();

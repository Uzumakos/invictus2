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

async function checkTestimonials() {
  const { data: testimonials, error } = await supabase.from("testimonials").select("*");
  console.log("=== TESTIMONIALS COUNT ===", testimonials?.length);
  console.log(JSON.stringify(testimonials, null, 2));
}

checkTestimonials();

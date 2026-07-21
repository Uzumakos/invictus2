const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey);

async function check() {
  const { data: testimonials, error: tErr } = await supabase.from("testimonials").select("*");
  console.log("=== TESTIMONIALS ===");
  if (tErr) console.error("Error fetching testimonials:", tErr);
  else console.log("Testimonials count:", testimonials?.length, testimonials);

  const { data: faqItems, error: fErr } = await supabase.from("faq_items").select("*");
  console.log("=== FAQ ITEMS ===");
  if (fErr) console.error("Error fetching faq_items:", fErr);
  else console.log("FAQ items count:", faqItems?.length, faqItems);
}

check();

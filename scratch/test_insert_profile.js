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

async function testInsertProfile() {
  const testPayload = {
    id: "12345678-1234-4321-8765-123456789012",
    client_id: "00000000-0000-0000-0000-000000000000",
    company_name: "Test Client Co",
    primary_contact_name: "Test Contact",
    email: "testclient@domain.com",
    billing_address: "123 Main St",
    country: "Haiti",
    phone: "+50937000000",
    whatsapp_number: "+50937000000",
    country_code: "US",
    currency: "USD",
    preferred_language: "en",
    payment_terms: "NET_30",
    default_discount: 0,
    is_approved: true
  };

  const { data, error } = await supabase.from("client_billing_profiles").insert(testPayload).select();
  console.log("Insert Error:", error);
  console.log("Inserted Profile Data:", data);
}

testInsertProfile();

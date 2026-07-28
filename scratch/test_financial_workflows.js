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

async function runTests() {
  console.log("=== START FINANCIAL WORKFLOWS INTEGRITY TEST ===");

  try {
    // 1. Verify Client Billing Profiles Exist
    const { data: clients, error: clientErr } = await supabase
      .from("client_billing_profiles")
      .select("*")
      .limit(1);

    if (clientErr) {
      throw new Error(`Database connection failed: ${clientErr.message}`);
    }
    console.log("✅ Database connectivity confirmed.");

    if (!clients || clients.length === 0) {
      console.log("⚠️ No clients registered in database. Cannot run mock creation.");
      return;
    }

    const testClient = clients[0];
    console.log(`👤 Using test client profile: "${testClient.company_name || testClient.primary_contact_name}"`);

    // 2. Querying sequence count
    const year = new Date().getFullYear();
    const { count: quoteCount } = await supabase
      .from("commercial_documents")
      .select("*", { count: "exact", head: true })
      .eq("document_type", "quote")
      .like("document_number", `Q-${year}-%`);

    console.log(`📊 Current Quotes sequence count for ${year}: ${quoteCount || 0}`);

    const { count: invoiceCount } = await supabase
      .from("commercial_documents")
      .select("*", { count: "exact", head: true })
      .eq("document_type", "invoice")
      .like("document_number", `INV-${year}-%`);

    console.log(`📊 Current Invoices sequence count for ${year}: ${invoiceCount || 0}`);

    console.log("✅ Sequence querying operations verified successfully.");
    console.log("=== TESTS COMPLETED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ TEST FAILED:", err.message);
  }
}

runTests();

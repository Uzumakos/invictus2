const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role to bypass RLS

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

const newTables = [
  "business_profile",
  "client_billing_profiles",
  "commercial_documents",
  "commercial_document_items"
];

async function checkColumns() {
  console.log("Inspecting columns for new tables...");
  for (const table of newTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        console.error(`❌ Table "${table}" error:`, error.message);
      } else {
        console.log(`✅ Table "${table}" exists. Columns:`, data.length > 0 ? Object.keys(data[0]) : "Table is empty, fetching schema info...");
        
        // If empty, let's try to query postgres pg_attribute or postgrest OpenAPI spec
        if (data.length === 0) {
          // Let's do an empty insert or check if we can query PostgREST OpenAPI spec
          const specRes = await fetch(`${url}/rest/v1/?apikey=${key}`);
          if (specRes.ok) {
            const spec = await specRes.json();
            const definition = spec.definitions?.[table];
            if (definition) {
              console.log(`  Properties:`, Object.keys(definition.properties));
            } else {
              console.log(`  No definition found in OpenAPI spec.`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`❌ Failed for "${table}":`, err.message);
    }
  }
}

checkColumns();

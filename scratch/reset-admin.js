const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const ws = require("ws");

// Load environment variables
const envPath = path.join(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const newPassword = process.argv[2];

if (!newPassword) {
  console.error("❌ Error: Please specify the new password.");
  console.log("\nUsage: npm run reset-admin <new_password>");
  process.exit(1);
}

async function main() {
  try {
    console.log("🔄 Resetting administrator credentials...");

    // 1. Generate bcrypt hash for the new password
    console.log("🔑 Hashing new password...");
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, salt);

    // 2. Update .env.local
    if (fs.existsSync(envPath)) {
      console.log("📝 Updating .env.local...");
      let envContent = fs.readFileSync(envPath, "utf-8");
      
      const hashRegex = /^ADMIN_PASSWORD_HASH=.*$/m;
      const escapedHash = hash.replace(/\$/g, "\\$");
      if (hashRegex.test(envContent)) {
        envContent = envContent.replace(hashRegex, `ADMIN_PASSWORD_HASH=${escapedHash}`);
      } else {
        envContent += `\nADMIN_PASSWORD_HASH=${escapedHash}`;
      }
      fs.writeFileSync(envPath, envContent, "utf-8");
      console.log("✅ Updated ADMIN_PASSWORD_HASH in .env.local");
    } else {
      console.warn("⚠️ Warning: .env.local file not found.");
    }

    // 3. Update db.json
    const dbPath = path.join(__dirname, "../db.json");
    if (fs.existsSync(dbPath)) {
      console.log("📝 Updating db.json...");
      const dbContent = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      
      if (dbContent.users) {
        const adminUser = dbContent.users.find(u => u.role === "admin");
        if (adminUser) {
          adminUser.passwordHash = hash;
          fs.writeFileSync(dbPath, JSON.stringify(dbContent, null, 2), "utf-8");
          console.log("✅ Updated admin password in db.json");
        } else {
          console.warn("⚠️ Warning: Admin user not found in db.json's users list.");
        }
      }
    }

    // 4. Update Supabase
    if (url && serviceKey) {
      console.log("🌐 Connecting to Supabase...");
      const supabase = createClient(url, serviceKey, {
        auth: { persistSession: false },
        realtime: { transport: ws }
      });

      console.log("🔍 Checking for admin user in database...");
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", "admin@invictus.com")
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Failed to query users table: ${fetchError.message}`);
      }

      if (!user) {
        console.log("➕ Admin user not found in database. Inserting new admin user...");
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: "u_seed_1",
            name: "Admin User",
            email: "admin@invictus.com",
            password_hash: hash,
            role: "admin",
            created_at: new Date().toISOString()
          });

        if (insertError) {
          throw new Error(`Failed to insert admin user: ${insertError.message}`);
        }
        console.log("✅ Inserted admin user in Supabase");
      } else {
        console.log("✏️ Updating existing admin user password in database...");
        const { error: updateError } = await supabase
          .from("users")
          .update({ password_hash: hash })
          .eq("email", "admin@invictus.com");

        if (updateError) {
          throw new Error(`Failed to update admin user: ${updateError.message}`);
        }
        console.log("✅ Updated admin user in Supabase");
      }
    } else {
      console.warn("⚠️ Warning: Supabase URL or Service Key not defined. Skipping database update.");
    }

    console.log("\n🎉 Admin password reset completed successfully!");
    console.log("👉 Remember to restart your next dev server (npm run dev) to apply the new .env.local credentials!");

  } catch (err) {
    console.error("\n❌ Error during reset:", err.message || err);
    process.exit(1);
  }
}

main();

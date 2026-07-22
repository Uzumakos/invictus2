import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSession } from "@/lib/portalAuth";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { comparePassword, hashPassword } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { user, status } = await verifyPortalSession(req);
    if (status !== 200 || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 });
    }

    const email = user.email.toLowerCase().trim();
    const dbClient = getSupabaseAdmin();

    // 1. Look up user in 'users' table
    const { data: existingUser, error: userError } = await dbClient
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      console.error("Error checking user in change-password:", userError.message);
      return NextResponse.json({ error: "Database query error" }, { status: 500 });
    }

    // 2. If password exists, verify current password
    if (existingUser && existingUser.password_hash && !existingUser.password_hash.includes("placeholder")) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }
      const isCorrect = await comparePassword(currentPassword, existingUser.password_hash);
      if (!isCorrect) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
    }

    // 3. Hash the new password
    const hashed = await hashPassword(newPassword);

    // 4. Save/update user row
    if (existingUser) {
      // Update
      const { error: updateError } = await dbClient
        .from("users")
        .update({ password_hash: hashed })
        .eq("id", existingUser.id);

      if (updateError) {
        console.error("Error updating user password:", updateError.message);
        return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
      }
    } else {
      // Insert new client user
      // Fetch billing profile to get name
      const { data: profile } = await dbClient
        .from("client_billing_profiles")
        .select("primary_contact_name, company_name")
        .eq("email", email)
        .maybeSingle();

      const name = profile?.primary_contact_name || profile?.company_name || email.split("@")[0];

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password_hash: hashed,
        role: "client"
      };

      const { error: insertError } = await dbClient
        .from("users")
        .insert(newUser);

      if (insertError) {
        console.error("Error creating new client user:", insertError.message);
        return NextResponse.json({ error: "Failed to create user password profile." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { comparePassword, signClientToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbClient = getSupabaseAdmin();

    // 1. Fetch user from 'users' table
    const { data: user, error: userError } = await dbClient
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userError) {
      console.error("Database error looking up user:", userError.message);
      return NextResponse.json({ error: "Database lookup failed." }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 2. Compare password
    const isCorrect = await comparePassword(password, user.password_hash);
    if (!isCorrect) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // 3. Verify approval status in client_billing_profiles
    const { data: profile, error: profileError } = await dbClient
      .from("client_billing_profiles")
      .select("is_approved")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error("Database error checking billing profile:", profileError.message);
    }

    // If profile exists, check if approved
    if (profile && profile.is_approved !== true) {
      return NextResponse.json({ 
        error: "Access Pending. Your email must be approved by the administrator before accessing the client portal." 
      }, { status: 403 });
    }

    // 4. Create the JWT token
    const token = signClientToken(normalizedEmail);

    const response = NextResponse.json({ 
      success: true, 
      message: "Access granted.",
      user: {
        email: normalizedEmail,
        name: user.name
      }
    });

    // Set cookie
    response.cookies.set({
      name: "client_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Client portal login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anonymous Key in environment variables.");
}

// Client-side & Standard public client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a server-side Supabase client using the service role key.
 * Use this only in API routes/Server Actions for administrative actions bypassing RLS.
 */
export function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Falling back to anonymous client.");
    return supabase;
  }
  return createClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

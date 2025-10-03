import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client with service role access
 * This bypasses Row Level Security (RLS) policies
 * 
 * Use ONLY in API routes for admin operations like:
 * - Creating user profiles
 * - System-level operations
 * 
 * Never use this in client-side code!
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Alias for createServiceRoleClient for consistency
 */
export function getServiceRoleClient() {
  return createServiceRoleClient();
}


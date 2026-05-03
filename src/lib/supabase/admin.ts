import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminEnv } from "./env";

/**
 * Service-role Supabase client. Bypasses RLS — only use from server
 * actions/route handlers that have already verified the caller's
 * identity through orthogonal means (e.g. matching a user's cédula
 * against profile_contact before resetting their PIN).
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't set so callers can
 * fall back to a "feature unavailable" path rather than crashing.
 */
export function createSupabaseAdminClient() {
  const env = getSupabaseAdminEnv();
  if (!env) return null;
  return createClient(env.url, env.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

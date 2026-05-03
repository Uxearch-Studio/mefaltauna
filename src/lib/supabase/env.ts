/**
 * Centralised env access for Supabase. Returns null when env vars are
 * missing so the rest of the app can degrade gracefully — auth-gated
 * pages will simply show "not configured" instead of crashing the build.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Service-role config — only available server-side and only set on
 * environments where we genuinely need admin privileges (PIN reset,
 * support tooling). Returns null when the env var is missing so
 * callers can surface a graceful "feature unavailable" state.
 */
export function getSupabaseAdminEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000"
  );
}

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser-side Supabase client (singleton). Returns null when env vars
 * are missing so UI can show a "not configured" message gracefully.
 */
export function getSupabaseBrowserClient() {
  if (cached) return cached;
  const env = getSupabaseEnv();
  if (!env) return null;
  cached = createBrowserClient(env.url, env.anonKey);
  return cached;
}

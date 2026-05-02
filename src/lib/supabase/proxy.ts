import { type NextRequest, type NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Refreshes Supabase auth cookies on the response produced by the
 * i18n middleware. Called from src/proxy.ts so every request that
 * hits the app has an up-to-date session.
 *
 * No-op when Supabase env vars are missing.
 */
export async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse,
) {
  const env = getSupabaseEnv();
  if (!env) return;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
}

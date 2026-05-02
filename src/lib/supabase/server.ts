import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Server-side Supabase client. Reads/writes auth cookies via Next's
 * cookies() API so sessions stay in sync across server components,
 * server actions and route handlers.
 *
 * Returns null when env vars are missing (e.g. before the user has
 * created a Supabase project) so callers can degrade gracefully.
 */
export async function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll was called from a Server Component; this is OK
          // when middleware refreshes sessions (it does — see proxy.ts).
        }
      },
    },
  });
}

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type AuthUser = {
  id: string;
  email: string | null;
  username: string | null;
};

/**
 * Reads the current authenticated user from cookies.
 * Returns null when no session exists or Supabase isn't configured.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Best-effort fetch of profile username — non-blocking.
  let username: string | null = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  } catch {
    // table may not exist yet during initial setup
  }

  return {
    id: user.id,
    email: user.email ?? null,
    username,
  };
}

/**
 * Use in server components/actions that require auth.
 * Redirects to /[locale]/sign-in with `next` set to the current path.
 */
export async function requireUser(opts: {
  locale: string;
  next?: string;
}): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (user) return user;

  const params = new URLSearchParams();
  if (opts.next) params.set("next", opts.next);
  const qs = params.size ? `?${params.toString()}` : "";
  redirect(`/${opts.locale}/sign-in${qs}`);
}

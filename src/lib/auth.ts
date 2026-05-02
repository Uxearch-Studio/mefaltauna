import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type AuthUser = {
  id: string;
  email: string | null;
  username: string | null;
};

/**
 * Phone numbers act as the user's identity. Supabase auth requires an
 * email, so we encode the phone as a fake email under our domain. The
 * mailbox doesn't exist — Supabase never sends to it because we
 * disabled email confirmations at the project level.
 */
const PHONE_DOMAIN = "phone.mefaltauna.app";
const COL_PREFIX = "57";

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  // 10-digit Colombian mobile (starts with 3) → prefix with 57
  if (digits.length === 10 && digits.startsWith("3")) {
    return COL_PREFIX + digits;
  }
  return digits;
}

export function phoneToEmail(input: string): string {
  return `${normalizePhone(input)}@${PHONE_DOMAIN}`;
}

export function emailToPhone(email: string | null): string | null {
  if (!email || !email.endsWith(`@${PHONE_DOMAIN}`)) return null;
  const digits = email.split("@")[0];
  return digits.startsWith(COL_PREFIX) ? digits.slice(COL_PREFIX.length) : digits;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // 10 digit COL: 300 123 4567
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return digits;
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  // Permissive: 7-15 digits. Local Colombia mobiles are 10, with
  // country code 12, others vary.
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

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
    username: username ?? emailToPhone(user.email ?? null),
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

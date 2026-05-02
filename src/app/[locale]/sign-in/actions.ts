"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/env";

export type SignInState = {
  error?: "not_configured" | "invalid_email" | "send_failed";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMagicLinkAction(
  prev: SignInState | undefined,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = String(formData.get("locale") ?? "es");
  const next = String(formData.get("next") ?? `/${locale}`);

  if (!EMAIL_RE.test(email)) {
    return { error: "invalid_email" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: "not_configured" };
  }

  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { error: "send_failed" };
  }

  redirect(`/${locale}/check-email?email=${encodeURIComponent(email)}`);
}

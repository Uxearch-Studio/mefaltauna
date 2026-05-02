"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isValidPhone,
  isValidPin,
  normalizePhone,
  phoneToEmail,
} from "@/lib/auth";

export type AuthState = {
  /** Form re-renders with this filled when the server bounces back. */
  phone?: string;
  /** True when sign-in failed and we want the user to confirm a new PIN. */
  needsConfirm?: boolean;
  error?:
    | "invalid_phone"
    | "invalid_pin"
    | "pins_mismatch"
    | "wrong_pin"
    | "signup_failed"
    | "auth_error"
    | "not_configured";
};

export async function phonePinAction(
  prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const phoneInput = String(formData.get("phone") ?? "").trim();
  const pin = String(formData.get("pin") ?? "");
  const pinConfirm = String(formData.get("pin_confirm") ?? "");
  const locale = String(formData.get("locale") ?? "es");
  const next = String(formData.get("next") ?? `/${locale}/app/feed`);

  if (!isValidPhone(phoneInput)) {
    return { error: "invalid_phone" };
  }
  if (!isValidPin(pin)) {
    return { phone: phoneInput, error: "invalid_pin" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { phone: phoneInput, error: "not_configured" };
  }

  const email = phoneToEmail(phoneInput);

  // First try: maybe the user already exists.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });
  if (!signInError) {
    redirect(next);
  }

  // Sign-in failed. Either the account doesn't exist OR the PIN is wrong.
  // We can't tell from the error alone, so:
  // - Without pin_confirm → ask the user to confirm their PIN once. If they
  //   actually have an account with a different PIN, the signup attempt
  //   below will fail with "user_already_exists" and we surface "wrong_pin".
  if (!pinConfirm) {
    return { phone: phoneInput, needsConfirm: true };
  }

  if (pin !== pinConfirm) {
    return { phone: phoneInput, needsConfirm: true, error: "pins_mismatch" };
  }

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password: pin,
    options: {
      // Stash the digits-only phone on user_metadata so triggers / UI can
      // read it without parsing the email back.
      data: { phone: normalizePhone(phoneInput) },
    },
  });
  if (signUpError) {
    const code = (signUpError as { code?: string }).code;
    const msg = signUpError.message?.toLowerCase() ?? "";
    if (code === "user_already_exists" || msg.includes("already")) {
      return { phone: phoneInput, error: "wrong_pin" };
    }
    return { phone: phoneInput, error: "signup_failed" };
  }

  // mailer_autoconfirm=true gives us a session straight away, but call
  // signInWithPassword to be defensive.
  await supabase.auth.signInWithPassword({ email, password: pin });
  redirect(next);
}

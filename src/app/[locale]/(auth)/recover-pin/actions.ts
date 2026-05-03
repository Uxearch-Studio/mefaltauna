"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidPin, normalizePhone, phoneToEmail } from "@/lib/auth";

export type RecoverState = {
  phone?: string;
  national_id?: string;
  error?:
    | "not_configured"
    | "service_unavailable"
    | "invalid_phone"
    | "invalid_id"
    | "invalid_pin"
    | "pins_mismatch"
    | "no_match"
    | "blocked"
    | "reset_failed";
};

/**
 * Knowledge-based PIN recovery: the user proves they own the account
 * by providing the WhatsApp number AND the national_id stored in
 * profile_contact (only the legitimate owner ever filled the publish
 * gate, so this is the strongest knowledge proof we have without an
 * SMS provider). On success we use the service-role admin client to
 * rewrite the auth password and immediately sign the user in.
 */
export async function recoverPinAction(
  prev: RecoverState | undefined,
  formData: FormData,
): Promise<RecoverState> {
  const phoneInput = String(formData.get("phone") ?? "").trim();
  const nationalIdInput = String(formData.get("national_id") ?? "").trim();
  const pin = String(formData.get("pin") ?? "");
  const pinConfirm = String(formData.get("pin_confirm") ?? "");
  const locale = String(formData.get("locale") ?? "es");

  const phoneDigits = phoneInput.replace(/\D/g, "");
  if (phoneDigits.length < 7) {
    return { phone: phoneInput, error: "invalid_phone" };
  }

  const idDigits = nationalIdInput.replace(/\D/g, "");
  if (idDigits.length < 6 || idDigits.length > 12) {
    return {
      phone: phoneInput,
      national_id: nationalIdInput,
      error: "invalid_id",
    };
  }

  if (!isValidPin(pin)) {
    return {
      phone: phoneInput,
      national_id: nationalIdInput,
      error: "invalid_pin",
    };
  }
  if (pin !== pinConfirm) {
    return {
      phone: phoneInput,
      national_id: nationalIdInput,
      error: "pins_mismatch",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { phone: phoneInput, error: "not_configured" };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // Service role isn't configured on this environment — the feature
    // is wired but the deployment hasn't been granted admin keys.
    return { phone: phoneInput, error: "service_unavailable" };
  }

  // Resolve auth user from the email-as-phone pattern.
  const email = phoneToEmail(phoneInput);
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    return { phone: phoneInput, error: "reset_failed" };
  }
  const target = list.users.find((u) => u.email === email);
  if (!target) {
    return { phone: phoneInput, error: "no_match" };
  }

  // Knowledge proof: cédula must match profile_contact for that user.
  const { data: contact } = await admin
    .from("profile_contact")
    .select("national_id")
    .eq("user_id", target.id)
    .maybeSingle();
  if (!contact || contact.national_id !== idDigits) {
    return {
      phone: phoneInput,
      national_id: nationalIdInput,
      error: "no_match",
    };
  }

  // Refuse to recover an account that's already blocked. Recovery
  // would otherwise let a blocked user back in by simply rotating
  // their PIN.
  const { data: prof } = await admin
    .from("profiles")
    .select("is_blocked")
    .eq("id", target.id)
    .maybeSingle();
  if (prof?.is_blocked) {
    return { phone: phoneInput, error: "blocked" };
  }

  // Rotate the password (PIN) via the admin endpoint.
  const { error: updateErr } = await admin.auth.admin.updateUserById(
    target.id,
    {
      password: pin,
      user_metadata: {
        ...(target.user_metadata ?? {}),
        phone: normalizePhone(phoneInput),
      },
    },
  );
  if (updateErr) {
    return { phone: phoneInput, error: "reset_failed" };
  }

  // Immediately sign the user in with the new PIN.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });
  if (signInError) {
    return { phone: phoneInput, error: "reset_failed" };
  }

  redirect(`/${locale}/app/feed`);
}

"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/supabase/env";
import {
  buildCheckoutUrl,
  buildWompiReference,
  getWompiConfig,
  PASS_PRICE_COP_CENTS,
} from "@/lib/wompi";
import { emailToPhone } from "@/lib/auth";

export type StartCheckoutState = {
  error?:
    | "not_configured"
    | "wompi_not_configured"
    | "unauthenticated"
    | "already_member"
    | "db_error";
};

/**
 * Creates a PENDING payment row, then redirects the user to Wompi
 * Web Checkout. Wompi will POST the final status to /api/wompi/webhook
 * and redirect the user back to /app/membership/return.
 */
export async function startCheckoutAction(
  prev: StartCheckoutState | undefined,
  formData: FormData,
): Promise<StartCheckoutState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const config = getWompiConfig();
  if (!config) return { error: "wompi_not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  // Don't double-charge a member.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_member")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.is_member) {
    return { error: "already_member" };
  }

  const reference = buildWompiReference(user.id);
  const locale = String(formData.get("locale") ?? "es");

  // We use the admin client so the insert isn't gated by RLS — RLS on
  // payments only allows SELECT for the row owner; writes go through
  // the webhook + server actions like this one.
  const admin = createSupabaseAdminClient();
  if (!admin) return { error: "wompi_not_configured" };
  const { error: insertErr } = await admin.from("payments").insert({
    user_id: user.id,
    amount_cop: PASS_PRICE_COP_CENTS / 100,
    currency: "COP",
    wompi_reference: reference,
    status: "PENDING",
  });
  if (insertErr) return { error: "db_error" };

  const phoneFromEmail = emailToPhone(user.email ?? null);
  const customerEmail = phoneFromEmail
    ? // Fake email pattern for phone-auth accounts won't accept Wompi
      // mail confirmations — leave undefined so Wompi prompts for it.
      undefined
    : (user.email ?? undefined);

  const redirectUrl = `${getSiteUrl()}/${locale}/app/membership/return`;

  const url = buildCheckoutUrl({
    config,
    reference,
    amountInCents: PASS_PRICE_COP_CENTS,
    redirectUrl,
    customerEmail,
  });

  redirect(url);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateColombianMobile } from "@/lib/phone";

export type PublishState = {
  error?:
    | "not_configured"
    | "unauthenticated"
    | "no_duplicates"
    | "missing_sticker"
    | "missing_type"
    | "missing_price"
    | "invalid_wants"
    | "db_error";
};

export type ContactState = {
  error?:
    | "not_configured"
    | "unauthenticated"
    | "missing_fields"
    | "invalid_id"
    | "invalid_phone"
    | "not_mobile_phone"
    | "fake_phone"
    | "whatsapp_taken"
    | "national_id_taken"
    | "db_error";
};

export async function saveContactAction(
  prev: ContactState | undefined,
  formData: FormData,
): Promise<ContactState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const nationalId = String(formData.get("national_id") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const locale = String(formData.get("locale") ?? "es");

  if (!firstName || !lastName || !nationalId || !city || !whatsapp) {
    return { error: "missing_fields" };
  }

  // Light validation — Colombian cédulas are 6-12 digits.
  const idDigits = nationalId.replace(/\D/g, "");
  if (idDigits.length < 6 || idDigits.length > 12) {
    return { error: "invalid_id" };
  }

  const phoneCheck = validateColombianMobile(whatsapp);
  if (!phoneCheck.ok) {
    return {
      error:
        phoneCheck.reason === "not_mobile"
          ? "not_mobile_phone"
          : phoneCheck.reason === "fake"
            ? "fake_phone"
            : "invalid_phone",
    };
  }
  const phoneDigits = phoneCheck.digits;

  const { error } = await supabase.from("profile_contact").upsert(
    {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      national_id: idDigits,
      whatsapp: phoneDigits,
      city,
    },
    { onConflict: "user_id" },
  );
  if (error) {
    // Postgres unique violation — surface which field collided so the
    // form can highlight it. The DB trigger normalises both fields to
    // digits-only before the unique index is checked.
    if ((error as { code?: string }).code === "23505") {
      const target = (
        (error as { details?: string }).details ?? error.message ?? ""
      ).toLowerCase();
      if (target.includes("whatsapp")) return { error: "whatsapp_taken" };
      if (target.includes("national_id")) {
        return { error: "national_id_taken" };
      }
    }
    return { error: "db_error" };
  }

  // Mirror the city onto the public profile so reputation/match
  // pages can use it without exposing PII. display_name carries the
  // public name (used by the FUT card and inbox).
  const displayName = `${firstName} ${lastName.charAt(0)}.`;
  await supabase
    .from("profiles")
    .update({ city, display_name: displayName })
    .eq("id", user.id);

  // Mirror display_name into auth.users.user_metadata so the Supabase
  // Auth admin panel shows it. Doesn't require service role.
  await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
    },
  });

  revalidatePath(`/${locale}/app/publish`);
  return {};
}

const VALID_TYPES = ["trade", "sale", "both"] as const;
type ListingType = (typeof VALID_TYPES)[number];

export async function publishListingAction(
  prev: PublishState | undefined,
  formData: FormData,
): Promise<PublishState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const stickerId = Number(formData.get("sticker_id"));
  const type = String(formData.get("type") ?? "");
  const priceStr = String(formData.get("price_cop") ?? "").trim();
  const wantsMode = String(formData.get("wants_mode") ?? "any");
  const wantsStickerId = formData.get("wants_sticker_id");
  const wantsTeamCode = formData.get("wants_team_code");
  const photoUrl = String(formData.get("photo_url") ?? "").trim() || null;
  const locale = String(formData.get("locale") ?? "es");
  const paymentMethodsRaw = formData.getAll("payment_methods");
  const allowedMethods = ["cash", "transfer"] as const;
  const paymentMethods = paymentMethodsRaw
    .map((v) => String(v))
    .filter((v): v is (typeof allowedMethods)[number] =>
      (allowedMethods as readonly string[]).includes(v),
    );

  if (!stickerId) return { error: "missing_sticker" };
  if (!VALID_TYPES.includes(type as ListingType)) return { error: "missing_type" };

  // Confirm the user actually has duplicates of the sticker they want to list.
  const { data: inv } = await supabase
    .from("inventory")
    .select("count")
    .eq("user_id", user.id)
    .eq("sticker_id", stickerId)
    .maybeSingle();
  if (!inv || inv.count < 2) return { error: "no_duplicates" };

  // Sale / both → require a positive price.
  let priceCop: number | null = null;
  if (type === "sale" || type === "both") {
    const n = Number(priceStr.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return { error: "missing_price" };
    priceCop = n;
  }

  // Trade / both → optional wants
  let wsId: number | null = null;
  let wTeam: string | null = null;
  if (type === "trade" || type === "both") {
    if (wantsMode === "specific") {
      const id = Number(wantsStickerId);
      if (!Number.isFinite(id) || id <= 0) return { error: "invalid_wants" };
      wsId = id;
    } else if (wantsMode === "team") {
      const code = String(wantsTeamCode ?? "").trim();
      if (!code) return { error: "invalid_wants" };
      wTeam = code;
    }
  }

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    sticker_id: stickerId,
    type,
    price_cop: priceCop,
    wants_sticker_id: wsId,
    wants_team_code: wTeam,
    photo_url: photoUrl,
  };
  if (paymentMethods.length > 0) {
    insertPayload.payment_methods = paymentMethods;
  }

  const { error } = await supabase.from("listings").insert(insertPayload);
  if (error) return { error: "db_error" };

  revalidatePath(`/${locale}/app/feed`);
  revalidatePath(`/${locale}/app/album`);
  redirect(`/${locale}/app/feed`);
}

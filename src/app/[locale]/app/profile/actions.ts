"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateColombianMobile } from "@/lib/phone";

export type ProfileEditState = {
  ok?: boolean;
  error?:
    | "not_configured"
    | "unauthenticated"
    | "missing_fields"
    | "invalid_phone"
    | "not_mobile_phone"
    | "fake_phone"
    | "whatsapp_taken"
    | "national_id_taken"
    | "db_error";
};

export async function updateProfileAction(
  prev: ProfileEditState | undefined,
  formData: FormData,
): Promise<ProfileEditState> {
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
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim() || null;
  const locale = String(formData.get("locale") ?? "es");

  if (
    !firstName ||
    !lastName ||
    !nationalId ||
    !city ||
    !neighborhood ||
    !whatsapp
  ) {
    return { error: "missing_fields" };
  }

  const idDigits = nationalId.replace(/\D/g, "");
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

  const contactRes = await supabase.from("profile_contact").upsert(
    {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      national_id: idDigits,
      whatsapp: phoneDigits,
      city,
      neighborhood,
    },
    { onConflict: "user_id" },
  );
  if (contactRes.error) {
    if ((contactRes.error as { code?: string }).code === "23505") {
      const target = (
        (contactRes.error as { details?: string }).details ??
        contactRes.error.message ??
        ""
      ).toLowerCase();
      if (target.includes("whatsapp")) return { error: "whatsapp_taken" };
      if (target.includes("national_id")) {
        return { error: "national_id_taken" };
      }
    }
    return { error: "db_error" };
  }

  const profileUpdate: Record<string, unknown> = {
    city,
    display_name: `${firstName} ${lastName.charAt(0)}.`,
  };
  if (username) profileUpdate.username = username;
  if (avatarUrl) profileUpdate.avatar_url = avatarUrl;

  const profileRes = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);
  if (profileRes.error) return { error: "db_error" };

  // Mirror every PII field into auth.users.user_metadata so the
  // Supabase Auth admin panel surfaces them (display_name on the
  // column, full set in the user detail drawer). doesn't require
  // service-role — auth.updateUser writes to the current session
  // user's own metadata.
  await supabase.auth.updateUser({
    data: {
      display_name: profileUpdate.display_name,
      first_name: firstName,
      last_name: lastName,
      national_id: idDigits,
      city,
      neighborhood,
      whatsapp: phoneDigits,
    },
  });

  revalidatePath(`/${locale}/app/profile`);
  return { ok: true };
}

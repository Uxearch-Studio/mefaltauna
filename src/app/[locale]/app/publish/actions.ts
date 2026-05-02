"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const locale = String(formData.get("locale") ?? "es");

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

  const { error } = await supabase.from("listings").insert({
    user_id: user.id,
    sticker_id: stickerId,
    type,
    price_cop: priceCop,
    wants_sticker_id: wsId,
    wants_team_code: wTeam,
  });
  if (error) return { error: "db_error" };

  revalidatePath(`/${locale}/app/feed`);
  revalidatePath(`/${locale}/app/album`);
  redirect(`/${locale}/app/feed`);
}

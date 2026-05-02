"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ToggleResult = {
  ok: boolean;
  count: number;
  error?: string;
};

export async function cycleStickerAction(
  stickerId: number,
  locale: string,
): Promise<ToggleResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, count: 0, error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, count: 0, error: "unauthenticated" };

  const { data: existing } = await supabase
    .from("inventory")
    .select("count")
    .eq("user_id", user.id)
    .eq("sticker_id", stickerId)
    .maybeSingle();

  const current = existing?.count ?? 0;
  const next = current >= 3 ? 0 : current + 1;

  if (next === 0) {
    const { error } = await supabase
      .from("inventory")
      .delete()
      .eq("user_id", user.id)
      .eq("sticker_id", stickerId);
    if (error) return { ok: false, count: current, error: error.message };
  } else {
    const { error } = await supabase.from("inventory").upsert(
      {
        user_id: user.id,
        sticker_id: stickerId,
        count: next,
      },
      { onConflict: "user_id,sticker_id" },
    );
    if (error) return { ok: false, count: current, error: error.message };
  }

  revalidatePath(`/${locale}/app/album`);
  return { ok: true, count: next };
}

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdjustResult = {
  ok: boolean;
  count: number;
  error?: string;
};

/**
 * Increment or decrement the user's count for a sticker by `delta`.
 * No upper cap — duplicates can grow without limit.
 * Hitting 0 deletes the inventory row.
 */
export async function adjustStickerAction(
  stickerId: number,
  delta: number,
  locale: string,
): Promise<AdjustResult> {
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
  const next = Math.max(0, current + delta);

  if (next === 0) {
    if (current > 0) {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("user_id", user.id)
        .eq("sticker_id", stickerId);
      if (error) return { ok: false, count: current, error: error.message };
    }
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

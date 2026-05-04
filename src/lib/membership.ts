import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns whether the given user has paid for the mefaltauna pass.
 * Single source of truth so every gate (inbox, chat, contact button)
 * checks the same column.
 */
export async function fetchIsMember(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_member")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.is_member);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Open or create a conversation between the current user and the
 * owner of the given listing. Idempotent — returns the existing
 * conversation if the same pair has talked about this listing before.
 */
export async function openConversationAction(
  listingId: string,
  locale: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/sign-in?next=/${locale}/app/feed`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, user_id")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) {
    redirect(`/${locale}/app/feed`);
  }

  if (listing.user_id === user.id) {
    // Don't allow self-chat. Bounce back.
    redirect(`/${locale}/app/feed`);
  }

  const [a, b] = [user.id, listing.user_id as string].sort();

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a", a)
    .eq("user_b", b)
    .eq("listing_id", listingId)
    .maybeSingle();

  let conversationId: string;
  if (existing) {
    conversationId = existing.id as string;
  } else {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ user_a: a, user_b: b, listing_id: listingId })
      .select("id")
      .single();
    if (error || !created) {
      redirect(`/${locale}/app/feed`);
    }
    conversationId = created.id as string;
  }

  redirect(`/${locale}/app/inbox/${conversationId}`);
}

export type SendMessageState = {
  error?: "empty" | "too_long" | "not_participant" | "not_configured" | "db_error";
};

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<SendMessageState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_participant" };

  const trimmed = body.trim();
  if (!trimmed) return { error: "empty" };
  if (trimmed.length > 2000) return { error: "too_long" };

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { error: "not_participant" };
  if (conv.user_a !== user.id && conv.user_b !== user.id) {
    return { error: "not_participant" };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: trimmed,
  });
  if (error) return { error: "db_error" };

  revalidatePath(`/[locale]/app/inbox/${conversationId}`, "page");
  return {};
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { detectPii, type PiiHit } from "@/lib/pii";

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

  // One conversation per pair, regardless of which listing started it.
  // Look up by pair only — the listing_id is just contextual metadata
  // pointing at the most recent listing the chat is about.
  const { data: existing } = await supabase
    .from("conversations")
    .select("id, listing_id, archived_at_a, archived_at_b")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();

  let conversationId: string;
  if (existing) {
    conversationId = existing.id as string;
    // Refresh the listing context if the user is opening a chat from
    // a different sticker, and unarchive on the current user's side
    // so the thread reappears in their inbox.
    const updates: Record<string, unknown> = {};
    if (existing.listing_id !== listingId) updates.listing_id = listingId;
    if (a === user.id && existing.archived_at_a) updates.archived_at_a = null;
    if (b === user.id && existing.archived_at_b) updates.archived_at_b = null;
    if (Object.keys(updates).length > 0) {
      await supabase
        .from("conversations")
        .update(updates)
        .eq("id", conversationId);
    }
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

/**
 * Soft-deletes the conversation from the current user's inbox. The
 * other party's view is unaffected — if they reply, the thread re-
 * appears for the user when openConversationAction reactivates it.
 */
export async function archiveConversationAction(
  conversationId: string,
): Promise<{ ok?: true; error?: "not_configured" | "not_participant" }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "not_configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_participant" };

  await supabase.rpc("archive_conversation", { conv_id: conversationId });
  revalidatePath("/[locale]/app/inbox", "page");
  revalidatePath("/[locale]/app", "layout");
  return { ok: true };
}

export type SendMessageState = {
  error?:
    | "empty"
    | "too_long"
    | "not_participant"
    | "not_configured"
    | "db_error"
    | "pii_phone"
    | "pii_email"
    | "blocked";
  /** When the message was rejected for PII, how many strikes the user
   * has accumulated and whether the account is now blocked. */
  strikes?: number;
  blocked?: boolean;
};

/**
 * Marks the conversation as read by the current user. Called from
 * the conversation page when the user opens it.
 */
export async function markConversationReadAction(
  conversationId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.rpc("mark_conversation_read", { conv_id: conversationId });
  // Refresh the inbox list (per-row unread chip) AND the app layout
  // (bottom-nav unread badge). Without the layout invalidation the
  // badge stays stuck until the user reloads the tab.
  revalidatePath("/[locale]/app/inbox", "page");
  revalidatePath("/[locale]/app", "layout");
}

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

  // Hard block — once an account has crossed the 3-strike threshold
  // it can't send anything else until support manually clears it.
  const { data: meProfile } = await supabase
    .from("profiles")
    .select("is_blocked, strikes")
    .eq("id", user.id)
    .maybeSingle();
  if (meProfile?.is_blocked) {
    return {
      error: "blocked",
      blocked: true,
      strikes: meProfile.strikes ?? 3,
    };
  }

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

  // Anti-PII guard. Phone numbers + emails (including obfuscated
  // forms) are rejected before they reach the conversation, and the
  // sender is hit with a strike via the security-definer RPC.
  const hit: PiiHit | null = detectPii(trimmed);
  if (hit) {
    const { data: bump } = await supabase
      .rpc("bump_strike", { target: user.id })
      .single<{ strikes: number; is_blocked: boolean }>();
    return {
      error: hit === "phone" ? "pii_phone" : "pii_email",
      strikes: bump?.strikes ?? 1,
      blocked: bump?.is_blocked ?? false,
    };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: trimmed,
  });
  if (error) return { error: "db_error" };

  // Server-side cache: refresh both the conversation page and the
  // inbox list so last_message_at + ordering stay accurate. Layout
  // also refreshes for the recipient's badge on next render.
  revalidatePath(`/[locale]/app/inbox/${conversationId}`, "page");
  revalidatePath("/[locale]/app/inbox", "page");
  revalidatePath("/[locale]/app", "layout");
  return {};
}

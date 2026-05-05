"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  /** The signed-in user. We listen for messages addressed to them
   *  (i.e. inserted into a conversation they're in but where they
   *  aren't the sender) and refresh the server tree so the
   *  bottom-nav unread badge updates without a navigation. */
  currentUserId: string;
};

/**
 * App-wide listener that subscribes to the global `messages` INSERT
 * stream and triggers `router.refresh()` whenever a NEW message
 * arrives that the current user hasn't sent themselves. The cost is
 * one RSC re-render — no realtime presence, no per-row state — so
 * the unread badge in the BottomNav becomes effectively live without
 * us having to mirror the badge count into client state.
 *
 * Mounted from the app shell layout so every signed-in page gets
 * the live update. Inside the chat itself, the existing
 * conversation-scoped channel handles the in-place message render
 * (and is left alone here) so we don't double-process.
 */
export function MessagesRealtimeRefresher({ currentUserId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`messages-feed:${currentUserId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload: { new: Record<string, unknown> }) => {
          const senderId = payload.new.sender_id as string | undefined;
          // Only react to messages from OTHER people. Our own sends
          // are handled by the chat-scoped channel + optimistic UI.
          if (!senderId || senderId === currentUserId) return;
          // Server tree refresh — repopulates the unread badge in
          // the bottom nav, the inbox list ordering, etc.
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, router]);

  return null;
}

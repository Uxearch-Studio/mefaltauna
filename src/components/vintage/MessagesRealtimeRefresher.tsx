"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  /** Signed-in user. We listen for new messages addressed to them so
   *  the bottom-nav unread badge and the inbox list update without a
   *  manual reload. */
  currentUserId: string;
};

/**
 * App-wide listener that triggers `router.refresh()` whenever a
 * conversation the user participates in is touched (which the
 * `messages_update_conversation` trigger does on every new message).
 *
 * Implementation note: we previously listened to an unfiltered
 * `messages` INSERT stream and relied on RLS to filter it down to the
 * caller. In practice that proved unreliable — Supabase Realtime
 * silently drops events for unfiltered subscriptions in some
 * configurations, so users who navigated AWAY from a conversation
 * never saw their badge tick up when a new message arrived.
 *
 * Two filtered channels (one for `user_a=eq.<uid>`, one for
 * `user_b=eq.<uid>`) on `conversations` UPDATE are far more reliable
 * because each one specifies exactly which rows to watch — no RLS
 * evaluation is required at broadcast time.
 *
 * As an extra safety net, we also re-refresh on tab visibility
 * change so a phone waking up from background catches up immediately.
 */
export function MessagesRealtimeRefresher({ currentUserId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const log = (...args: unknown[]) =>
      console.log("[MessagesRealtimeRefresher]", ...args);

    // Two channels so the filter can be a single equality expression
    // — Realtime postgres_changes filters do not support OR.
    const channelA = supabase
      .channel(`conv-bumps-a:${currentUserId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `user_a=eq.${currentUserId}`,
        },
        () => {
          log("conversation bump (user_a)");
          router.refresh();
        },
      )
      .subscribe((status: string) => log("channelA status:", status));

    const channelB = supabase
      .channel(`conv-bumps-b:${currentUserId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `user_b=eq.${currentUserId}`,
        },
        () => {
          log("conversation bump (user_b)");
          router.refresh();
        },
      )
      .subscribe((status: string) => log("channelB status:", status));

    // Belt-and-suspenders: when the tab becomes visible again after
    // having been backgrounded (phone unlock, OS-level pause, etc.)
    // do a one-shot refresh so we don't show stale state from before
    // the device went to sleep.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        log("visibilitychange → refresh");
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      supabase.removeChannel(channelA);
      supabase.removeChannel(channelB);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [currentUserId, router]);

  return null;
}

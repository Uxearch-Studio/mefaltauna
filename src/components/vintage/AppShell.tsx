"use client";

import { usePathname } from "@/i18n/navigation";
import { BottomNav } from "./BottomNav";
import { MessagesRealtimeRefresher } from "./MessagesRealtimeRefresher";

type Props = {
  children: React.ReactNode;
  unreadCount: number;
  currentUserId: string;
};

/**
 * Client-side shell that wraps every /app/* page. We need to be
 * client-side because the layout has to know the current pathname so
 * it can hide the BottomNav (and reclaim the bottom padding) when the
 * user is inside a single conversation. In the chat view the screen
 * is dedicated to chat — bottom-nav was hiding the composer on iOS
 * and felt like clutter even when it didn't.
 */
export function AppShell({ children, unreadCount, currentUserId }: Props) {
  const pathname = usePathname();
  // Match any single conversation page: /app/inbox/<id> with an id
  // segment. The inbox list itself (/app/inbox) keeps the nav.
  const isConversation = /^\/app\/inbox\/[^/]+$/.test(pathname);

  return (
    <>
      <main className={isConversation ? "min-h-screen" : "pb-28 min-h-screen"}>
        {children}
      </main>
      {!isConversation && <BottomNav unreadCount={unreadCount} />}
      <MessagesRealtimeRefresher currentUserId={currentUserId} />
    </>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  FeedIcon,
  AlbumIcon,
  CalendarIcon,
  PublishIcon,
  InboxIcon,
  ProfileIcon,
} from "./Icons";

type Tab = {
  href:
    | "/app/feed"
    | "/app/album"
    | "/app/calendar"
    | "/app/publish"
    | "/app/inbox"
    | "/app/profile";
  key: "feed" | "album" | "calendar" | "publish" | "inbox" | "profile";
  Icon: React.ComponentType<{ className?: string }>;
};

// Order: feed (browse) → album (collection) → calendar (schedule) →
// publish (action, kept centered as the highlight) → inbox (chat) →
// profile (account). 6 tabs fit the 64×4 grid comfortably; on narrow
// screens we tighten the gap further with surface-glass below.
const TABS: Tab[] = [
  { href: "/app/feed",     key: "feed",     Icon: FeedIcon },
  { href: "/app/album",    key: "album",    Icon: AlbumIcon },
  { href: "/app/calendar", key: "calendar", Icon: CalendarIcon },
  { href: "/app/publish",  key: "publish",  Icon: PublishIcon },
  { href: "/app/inbox",    key: "inbox",    Icon: InboxIcon },
  { href: "/app/profile",  key: "profile",  Icon: ProfileIcon },
];

type Props = {
  unreadCount?: number;
};

export function BottomNav({ unreadCount = 0 }: Props) {
  const t = useTranslations("appNav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 z-40"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <ul className="surface-glass rounded-full px-2 py-2 shadow-xl shadow-black/10 flex items-center justify-between">
          {TABS.map((tab) => {
            const active =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const isPublish = tab.key === "publish";
            const isInbox = tab.key === "inbox";
            const Icon = tab.Icon;

            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={t(tab.key)}
                  title={t(tab.key)}
                  className={cn(
                    "relative mx-auto flex items-center justify-center size-11 rounded-full transition-colors",
                    isPublish
                      ? active
                        ? "bg-foreground text-background"
                        : "bg-highlight text-highlight-foreground hover:bg-foreground hover:text-background"
                      : active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-5" />
                  {isInbox && unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm"
                      aria-label={`${unreadCount} unread`}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

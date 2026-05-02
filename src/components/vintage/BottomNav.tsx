"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import {
  FeedIcon,
  AlbumIcon,
  PublishIcon,
  InboxIcon,
  ProfileIcon,
} from "./Icons";

type Tab = {
  href:
    | "/app/feed"
    | "/app/album"
    | "/app/publish"
    | "/app/inbox"
    | "/app/profile";
  key: "feed" | "album" | "publish" | "inbox" | "profile";
  Icon: React.ComponentType<{ className?: string }>;
};

const TABS: Tab[] = [
  { href: "/app/feed",    key: "feed",    Icon: FeedIcon },
  { href: "/app/album",   key: "album",   Icon: AlbumIcon },
  { href: "/app/publish", key: "publish", Icon: PublishIcon },
  { href: "/app/inbox",   key: "inbox",   Icon: InboxIcon },
  { href: "/app/profile", key: "profile", Icon: ProfileIcon },
];

export function BottomNav() {
  const t = useTranslations("appNav");
  const pathname = usePathname();

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 surface-glass rounded-full px-2 py-2 shadow-lg shadow-black/5"
    >
      <ul className="flex items-center gap-1">
        {TABS.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const isPublish = tab.key === "publish";
          const Icon = tab.Icon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                aria-label={t(tab.key)}
                title={t(tab.key)}
                className={cn(
                  "relative flex items-center justify-center size-12 rounded-full transition-colors",
                  isPublish
                    ? active
                      ? "bg-foreground text-background"
                      : "bg-accent text-accent-foreground hover:bg-foreground hover:text-background"
                    : active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

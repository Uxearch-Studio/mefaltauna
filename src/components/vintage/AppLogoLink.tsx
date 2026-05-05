"use client";

import { useLocale } from "next-intl";
import { Logo } from "./Logo";

type Props = {
  title?: string;
};

/**
 * Brand link in the AppTopBar. Always points at `/app/feed` and is
 * rendered as a plain anchor (NOT a next-intl Link) so each tap
 * triggers a full HTTP navigation. The Next.js client-side router
 * has been intermittently failing on Safari with "page couldn't
 * load" until we finish diagnosing the root cause; hard nav makes
 * the brand-back affordance bulletproof in the meantime.
 */
export function AppLogoLink({ title }: Props) {
  const locale = useLocale();
  const href = `/${locale}/app/feed`;

  return (
    <a
      href={href}
      className="flex items-center gap-2 hover:opacity-70 transition-opacity min-w-0"
    >
      <Logo />
      {title && (
        <span className="ml-1.5 text-xs font-medium text-muted-foreground truncate hidden sm:inline">
          · {title}
        </span>
      )}
    </a>
  );
}

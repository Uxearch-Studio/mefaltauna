"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const ROUTES = [
  { href: "/album" as const, key: "album" },
  { href: "/feed" as const, key: "feed" },
  { href: "/matches" as const, key: "matches" },
  { href: "/how-it-works" as const, key: "howItWorks" },
];

export function NavLinks() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-5 font-pixel text-[10px] uppercase">
      {ROUTES.map((route) => {
        const active =
          pathname === route.href || pathname.startsWith(`${route.href}/`);
        return (
          <Link
            key={route.href}
            href={route.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-1.5 transition-colors",
              active
                ? "text-accent crt-glow"
                : "text-foreground hover:text-accent",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            >
              ▶
            </span>
            {t(route.key)}
          </Link>
        );
      })}
    </nav>
  );
}

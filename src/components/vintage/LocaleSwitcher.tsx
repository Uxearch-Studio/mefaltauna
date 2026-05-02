"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex border-2 border-border h-9"
    >
      {routing.locales.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => router.replace(pathname, { locale })}
            aria-pressed={active}
            className={cn(
              "px-2 font-mono text-xs uppercase tracking-widest transition-colors",
              active
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-foreground/10",
            )}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}

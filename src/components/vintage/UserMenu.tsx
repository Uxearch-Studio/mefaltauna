"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { AuthUser } from "@/lib/auth";

type Props = {
  user: AuthUser;
};

export function UserMenu({ user }: Props) {
  const t = useTranslations("userMenu");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = user.username ?? user.email?.split("@")[0] ?? "user";
  const initial = label.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center size-9 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[14rem] surface-card overflow-hidden z-50 animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-muted-foreground">{t("signedInAs")}</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>

          <form method="post" action={`/${locale}/sign-out`}>
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

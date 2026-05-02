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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center h-9 px-3 font-pixel text-[10px] uppercase bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <span className="max-w-[8rem] truncate">{label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[12rem] bg-background border-2 border-border border-sticker z-50"
        >
          <div className="px-3 py-3 border-b-2 border-border">
            <p className="font-pixel text-[10px] uppercase text-muted-foreground">
              {t("signedInAs")}
            </p>
            <p className="font-mono text-sm truncate">{user.email}</p>
          </div>

          <form method="post" action={`/${locale}/sign-out`}>
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-3 py-3 font-pixel text-[10px] uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              {t("signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

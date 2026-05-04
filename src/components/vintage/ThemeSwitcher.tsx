"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark" | "auto";

const THEMES: Theme[] = ["light", "dark", "auto"];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "auto") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

const ICONS: Record<Theme, React.ReactNode> = {
  light: (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.2 4.2l1.1 1.1M14.7 14.7l1.1 1.1M4.2 15.8l1.1-1.1M14.7 5.3l1.1-1.1" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11.4A7 7 0 1 1 8.6 4a5.6 5.6 0 0 0 7.4 7.4Z" />
    </svg>
  ),
  auto: (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3.5v13" />
      <path d="M10 3.5a6.5 6.5 0 0 1 0 13" fill="currentColor" />
    </svg>
  ),
};

export function ThemeSwitcher() {
  const t = useTranslations("theme");
  // Default UI state matches the boot script: visitors who haven't
  // picked a theme see the dark icon since dark is what they're
  // actually looking at.
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "auto") {
      setTheme(stored);
    } else {
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  function cycle() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={t("label")}
      title={mounted ? t(theme) : undefined}
      className={cn(
        "inline-flex items-center justify-center size-9 rounded-full border border-border",
        "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
      )}
    >
      <span suppressHydrationWarning>{ICONS[mounted ? theme : "auto"]}</span>
    </button>
  );
}

export const themeBootScript = `
(function(){
  function apply() {
    try {
      var t = localStorage.getItem('theme');
      // mefaltauna defaults to dark — when the visitor hasn't chosen a
      // theme yet we present the brand violet stage, not the OS pref.
      if (t === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else if (t === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (t === 'auto') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
  apply();
  // Re-apply on bfcache restore (e.g. browser back button) so the
  // theme doesn't snap when navigating back.
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) apply();
  });
})();
`;

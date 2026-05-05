"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

const SUN_ICON = (
  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="3.5" />
    <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.2 4.2l1.1 1.1M14.7 14.7l1.1 1.1M4.2 15.8l1.1-1.1M14.7 5.3l1.1-1.1" />
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11.4A7 7 0 1 1 8.6 4a5.6 5.6 0 0 0 7.4 7.4Z" />
  </svg>
);

/**
 * Two-state theme toggle: light ↔ dark. We dropped the third "auto"
 * step because the cycle was confusing — users tapped the button
 * expecting an immediate flip and instead landed on a state that
 * inherited the OS preference, which on dark-OS devices made the
 * tap look like a no-op. mefaltauna defaults to dark; the toggle is
 * the user's explicit override.
 *
 * Convention: the icon shows the OPPOSITE theme — the one you'll
 * switch to if you tap. So in dark mode you see a sun (suggesting
 * "switch to light"); in light mode you see a moon. Same pattern X,
 * GitHub, and most Vercel-style apps use.
 */
export function ThemeSwitcher() {
  const t = useTranslations("theme");
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  // Show the icon for the opposite theme so users can see what
  // tapping the button will do.
  const iconForCurrent = theme === "dark" ? SUN_ICON : MOON_ICON;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("label")}
      title={mounted ? t(theme === "dark" ? "light" : "dark") : undefined}
      className={cn(
        "inline-flex items-center justify-center size-9 rounded-full border border-border",
        "text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
      )}
    >
      <span suppressHydrationWarning>{iconForCurrent}</span>
    </button>
  );
}

export const themeBootScript = `
(function(){
  function apply() {
    try {
      var t = localStorage.getItem('theme');
      // Two-state: anything that isn't explicitly 'light' resolves to
      // dark, including the legacy 'auto' value some clients have
      // saved from the previous three-state version.
      var theme = t === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
  apply();
  // Re-apply on bfcache restore (browser back button) so the theme
  // doesn't snap when navigating back through history.
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) apply();
  });
})();
`;

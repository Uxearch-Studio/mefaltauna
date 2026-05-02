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

export function ThemeSwitcher() {
  const t = useTranslations("theme");
  const [theme, setTheme] = useState<Theme>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "auto";
    setTheme(stored);
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
        "inline-flex items-center justify-center size-9",
        "border-2 border-border bg-background text-foreground",
        "hover:bg-foreground hover:text-background transition-colors",
      )}
    >
      <span className="font-mono text-xs leading-none" suppressHydrationWarning>
        {!mounted ? "·" : theme === "light" ? "☼" : theme === "dark" ? "☾" : "⊙"}
      </span>
    </button>
  );
}

/**
 * Inline script content used in <head> to apply the stored theme
 * before paint, preventing FOUC.
 */
export const themeBootScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (e) {}
})();
`;

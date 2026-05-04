"use client";

import { useEffect } from "react";

const COLOR_DARK = "#0d0521";
const COLOR_LIGHT = "#fafaf7";

/**
 * Keeps the document's <meta name="theme-color"> in sync with the
 * theme the user actually has applied. The OS uses this color for
 * the status bar (iOS PWA), the address bar tint (Android Chrome),
 * and the title bar of installed PWA windows on desktop.
 *
 * Without this component the meta tag is whatever the static metadata
 * said it was — so the user could pick light mode and still see the
 * dark violet status bar above it. We also update on every change of
 * the html `data-theme` attribute, so the theme switcher takes effect
 * immediately.
 */
export function ThemeColorMeta() {
  useEffect(() => {
    const root = document.documentElement;

    function readTheme(): "light" | "dark" {
      const attr = root.getAttribute("data-theme");
      if (attr === "light") return "light";
      if (attr === "dark") return "dark";
      // No explicit attribute: fall back to OS preference (auto mode).
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    function ensureSingleMeta(): HTMLMetaElement {
      // Strip any static theme-color tags that Next produced from the
      // metadata config. We want exactly one tag whose content we can
      // overwrite, so the OS doesn't pick a stale fallback.
      const existing = document.head.querySelectorAll<HTMLMetaElement>(
        'meta[name="theme-color"]',
      );
      let kept: HTMLMetaElement | null = null;
      existing.forEach((el) => {
        if (!kept && !el.hasAttribute("media")) {
          kept = el;
        } else {
          el.remove();
        }
      });
      if (!kept) {
        kept = document.createElement("meta");
        kept.setAttribute("name", "theme-color");
        document.head.appendChild(kept);
      }
      return kept;
    }

    const meta = ensureSingleMeta();
    function apply() {
      const theme = readTheme();
      meta.setAttribute("content", theme === "dark" ? COLOR_DARK : COLOR_LIGHT);
    }

    apply();

    // Re-apply whenever the theme switcher writes data-theme.
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    // Re-apply when OS preference changes (only relevant in auto mode).
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", apply);

    return () => {
      observer.disconnect();
      mq.removeEventListener?.("change", apply);
    };
  }, []);

  return null;
}

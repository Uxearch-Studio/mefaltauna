"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

/**
 * BeforeInstallPromptEvent — declared as a Chrome/Edge Manifest API
 * extension. Not in lib.dom yet, so we define the shape we use.
 */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Floating "Install" trigger that appears in the AppTopBar trailing
 * slot once the browser fires `beforeinstallprompt`. iOS doesn't fire
 * that event, so on iOS Safari we instead show a soft hint with the
 * "Share → Add to Home Screen" instructions.
 */
export function InstallShortcut({ className = "" }: { className?: string }) {
  const t = useTranslations("install");
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect iOS Safari (no beforeinstallprompt support there).
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    setIsIos(ios);

    // Already running as a PWA — hide the button entirely.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (standalone) {
      setInstalled(true);
      try {
        localStorage.setItem("mfu:installed", "1");
      } catch {}
    }

    // Persisted hint from a previous accept on this browser. Lets us
    // hide the button when the user opens the site in a regular tab
    // after they've already installed the PWA — the standalone media
    // query only matches inside the installed window, not in browser.
    try {
      if (localStorage.getItem("mfu:installed") === "1") {
        setInstalled(true);
      }
    } catch {}

    // Chrome's getInstalledRelatedApps lets us check whether *this*
    // PWA is already installed without being inside it. Best-effort —
    // browsers without the API just fall through.
    type NavigatorWithRelated = Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<{ id?: string; url?: string }>>;
    };
    const navWithRelated = window.navigator as NavigatorWithRelated;
    if (typeof navWithRelated.getInstalledRelatedApps === "function") {
      navWithRelated
        .getInstalledRelatedApps()
        .then((apps) => {
          if (apps && apps.length > 0) {
            setInstalled(true);
            try {
              localStorage.setItem("mfu:installed", "1");
            } catch {}
          }
        })
        .catch(() => {});
    }

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
      try {
        localStorage.setItem("mfu:installed", "1");
      } catch {}
    }
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  // Nothing to show on a desktop browser that won't trigger the
  // prompt and isn't iOS — keeping the slot clean is better than
  // shipping a button that does nothing.
  if (!deferred && !isIos) return null;

  function trigger() {
    if (deferred) {
      deferred.prompt();
      return;
    }
    setShowHint(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={trigger}
        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap ${className}`}
        aria-label={t("install")}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        {t("install")}
      </button>

      {showHint && <InstallHintModal onClose={() => setShowHint(false)} />}
    </>
  );
}

/**
 * Rendered via createPortal directly into document.body so the modal
 * escapes any ancestor containing block. The header that triggers it
 * uses `backdrop-blur`, which creates a containing block for fixed
 * descendants — without the portal, the dialog ends up positioned
 * relative to the header instead of the viewport (visible above the
 * nav, sized like the header, untappable).
 */
function InstallHintModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("install");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Lock body scroll while the modal is up so iOS Safari doesn't
    // bounce the page underneath when the user pans on the backdrop.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background text-foreground rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl border border-border"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("iosTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="size-8 -mt-1 -mr-1 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
          >
            ✕
          </button>
        </div>

        {/* Animated visual: stylized Safari toolbar with the share
            button highlighted by an arrow that bobs up and down to
            draw the eye. Vector-only, no images, fast. */}
        <div className="relative rounded-2xl border border-border bg-muted/40 px-4 pt-5 pb-3 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Safari
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              mefaltauna.com
            </span>
          </div>

          {/* Mock toolbar buttons row */}
          <div className="relative flex items-center justify-between gap-2 px-1 pb-2">
            <ToolbarIcon>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </ToolbarIcon>
            <ToolbarIcon>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </ToolbarIcon>

            {/* The share button — highlighted */}
            <div className="relative">
              <span
                aria-hidden
                className="absolute -inset-1 rounded-xl bg-accent/30 anim-share-pulse"
              />
              <div className="relative size-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 3v12" />
                  <path d="M7 8l5-5 5 5" />
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                </svg>
              </div>
            </div>

            <ToolbarIcon>
              <path d="M3 7h18M3 12h18M3 17h18" />
            </ToolbarIcon>
            <ToolbarIcon>
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </ToolbarIcon>
          </div>

          {/* Animated downward arrow pointing at the share button */}
          <div className="flex justify-center pt-1">
            <span className="anim-arrow-bob text-accent" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Step-by-step instructions, keeping the inline icons so
            users can match the glyphs to what they see in Safari. */}
        <ol className="flex flex-col gap-3.5 text-sm">
          <li className="flex items-start gap-3">
            <span className="size-6 shrink-0 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="leading-snug text-muted-foreground">
              {t("iosStep1")}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="size-6 shrink-0 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span className="leading-snug text-muted-foreground inline-flex items-baseline gap-1.5 flex-wrap">
              <span>{t("iosStep2")}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-medium">
                <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="4" y="3" width="16" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Añadir a inicio
              </span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="size-6 shrink-0 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span className="leading-snug text-muted-foreground">
              {t("iosStep3")}
            </span>
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="self-stretch h-11 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("gotIt")}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function ToolbarIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="size-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground/60">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
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
    if (standalone) setInstalled(true);

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
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

      {showHint && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowHint(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-3xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold tracking-tight">
                {t("iosTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setShowHint(false)}
                aria-label={t("close")}
                className="size-8 -mt-1 -mr-1 rounded-full hover:bg-muted flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <ol className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="font-bold text-foreground">1.</span>
                <span>{t("iosStep1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-foreground">2.</span>
                <span>{t("iosStep2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-foreground">3.</span>
                <span>{t("iosStep3")}</span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="self-stretch h-11 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("gotIt")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

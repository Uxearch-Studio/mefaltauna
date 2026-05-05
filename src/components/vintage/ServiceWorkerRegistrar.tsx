"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on first idle slot so the browser counts mefaltauna
 * as an installable PWA. Without a registered service worker that
 * owns a `fetch` listener, Chrome / Edge / Android won't dispatch
 * `beforeinstallprompt`, and the "Instalar" button has nothing to
 * call.
 *
 * The SW itself is intentionally a no-op (see /public/sw.js) — we do
 * not want any caching or fetch interception. Only the registration
 * matters.
 *
 * Render once at the root of the app; the registration is idempotent.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    type IdleWindow = Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void) => number;
      };
    const w = window as IdleWindow;

    function register() {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Failure is non-fatal — the app still works, just without
          // the native install prompt on Android Chrome.
        });
    }

    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(register);
    } else {
      w.setTimeout(register, 1000);
    }
  }, []);

  return null;
}

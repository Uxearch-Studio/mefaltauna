"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js on first mount so the browser counts mefaltauna as
 * an installable PWA. Without a registered service worker that owns a
 * `fetch` handler, Chrome/Edge/Android will never fire
 * `beforeinstallprompt`, and the "Instalar" button has nothing to call.
 *
 * Render once at the root of the app — the registration is idempotent
 * so re-rendering never double-registers.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register on the first idle slot to avoid blocking page paint on
    // slow connections. The browser still queues the install/activate
    // events and fires beforeinstallprompt as soon as it's ready.
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Failure is non-fatal — the app still works, just without
          // the native install prompt.
        });
    };

    type IdleWindow = Window &
      typeof globalThis & {
        requestIdleCallback?: (cb: () => void) => number;
      };
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(register);
    } else {
      w.setTimeout(register, 1000);
    }
  }, []);

  return null;
}

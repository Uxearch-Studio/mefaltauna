"use client";

import { useEffect } from "react";

/**
 * Catches the "stale chunk" class of errors that fire when a Next.js
 * client-side navigation tries to load a JS / RSC chunk whose hash
 * was rotated by a fresh deploy. Without a recovery path the user
 * sees Next's default error UI ("la página no se puede cargar") and
 * has to reload manually.
 *
 * We listen at the window level for both `error` and
 * `unhandledrejection`, sniff for the canonical chunk-load error
 * messages, and force a full-page reload so the browser fetches the
 * latest manifest and chunk filenames. Reloading is the only safe
 * recovery — there's no way to retroactively patch the running
 * client with the new chunk hashes.
 *
 * To prevent reload loops on a genuinely broken deploy, we cap the
 * recovery to one auto-reload per session via sessionStorage. After
 * that we let the error surface so the user can decide.
 */
export function ChunkLoadErrorBoundary() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const RELOAD_KEY = "mfu:chunk-reload-attempt";

    function isChunkError(err: unknown): boolean {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      // Last category — "Load failed" — is iOS Safari's generic
      // network error string. It surfaces when an in-flight fetch
      // (including Next.js's RSC payload fetch) fails or is aborted,
      // which is the most common shape of the navigation crash users
      // hit on the wedged-cache wave we've been chasing.
      return /Loading chunk|ChunkLoadError|Failed to fetch|Importing a module script failed|Load failed|NetworkError|TypeError: cancelled/i.test(
        msg,
      );
    }

    function recover() {
      let attempts = 0;
      try {
        attempts = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
      } catch {}
      if (attempts >= 1) return;
      try {
        sessionStorage.setItem(RELOAD_KEY, String(attempts + 1));
      } catch {}
      window.location.reload();
    }

    function onError(e: ErrorEvent) {
      if (isChunkError(e.error ?? e.message)) recover();
    }
    function onUnhandled(e: PromiseRejectionEvent) {
      if (isChunkError(e.reason)) recover();
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);

    // Successful navigation = clear the cap, so the next genuine
    // stale-chunk error in the future also triggers a single reload.
    function clearCap() {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {}
    }
    // pageshow fires both on initial load and on bfcache restore.
    window.addEventListener("pageshow", clearCap);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
      window.removeEventListener("pageshow", clearCap);
    };
  }, []);

  return null;
}

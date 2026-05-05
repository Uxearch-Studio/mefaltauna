// mefaltauna service worker — installability stub.
//
// Chrome historically refused to fire `beforeinstallprompt` unless
// the site had a service worker with a fetch listener. We register
// this minimal one purely to satisfy that check.
//
// Earlier versions of this file proxied every request through
// `event.respondWith(fetch(event.request))`, which is a passthrough
// in theory but in practice can interfere with Next's RSC payload
// requests during client-side navigation — users were seeing
// "página no se puede cargar" between routes that vanished after a
// reload. This version no longer calls respondWith, so the browser
// handles every request the way it normally would.
//
// We intentionally don't cache anything: offline mode is a separate
// workstream and would risk shipping stale UI silently.

self.addEventListener("install", (event) => {
  // Take effect on the next page load instead of waiting for every
  // tab to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch listener satisfies Chrome's installability checks. We
// deliberately do NOT call event.respondWith — the browser handles
// the request as if no SW existed.
self.addEventListener("fetch", () => {});

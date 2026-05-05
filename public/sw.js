// mefaltauna service worker — minimal installability stub.
//
// Chrome / Edge / Android refuse to dispatch `beforeinstallprompt`
// unless the site has a registered service worker that owns a
// `fetch` listener. This file does the absolute bare minimum to
// satisfy that requirement and nothing else.
//
// Hard rules learned from the previous incident:
// - NEVER call `event.respondWith()`. The browser must handle every
//   request itself; intercepting them was what wedged the app on
//   chunk-rotated deploys.
// - NEVER cache. Caching is a separate workstream and would risk
//   shipping stale UI silently.
// - Always skipWaiting + clients.claim so a new version takes effect
//   on the next page load instead of orphaning open tabs.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch listener — Chrome installability check needs us to
// have one, but we deliberately do NOT intercept any request.
self.addEventListener("fetch", () => {});

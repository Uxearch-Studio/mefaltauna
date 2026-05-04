// mefaltauna service worker — installability stub.
//
// Chrome/Edge/Android refuse to fire `beforeinstallprompt` unless the
// site has a registered service worker that handles `fetch`. This SW
// does the bare minimum to satisfy that requirement:
//   - takes control immediately on install/activate
//   - passes every fetch through to the network
//
// We deliberately don't cache anything yet; offline mode is a
// separate workstream and would risk shipping stale UI silently.

self.addEventListener("install", (event) => {
  // Skip the waiting phase so an updated SW takes effect on the next
  // navigation instead of requiring all tabs to close first.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // No-op handler — Chrome's installability check requires a fetch
  // listener even if it just falls through to the network. We must
  // attach the listener to the event for the criterion to count.
  event.respondWith(fetch(event.request));
});

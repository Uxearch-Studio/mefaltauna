// mefaltauna service worker — self-destruct version.
//
// Earlier deploys shipped a service worker that intercepted every
// fetch via `respondWith(fetch(event.request))`. That ran fine
// initially but, combined with rotated chunk filenames across
// subsequent deploys, left some clients wedged on stale assets and
// unable to navigate without errors. The reset page can fix it for
// users who can reach it, but a PWA installed on iOS keeps its own
// SW + cache scope that the in-Safari reset doesn't touch.
//
// This version of the SW exists only to evict itself and every cache
// it (or its predecessors) created. On install it skips waiting; on
// activate it unregisters its own registration, deletes every cache,
// and asks all controlled clients to navigate to a cache-busting
// URL. The next page load on any device that ever ran the old SW
// will pick up this kill version, run it, and emerge clean.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        // ignore — best effort
      }
      try {
        const clients = await self.clients.matchAll({
          includeUncontrolled: true,
        });
        for (const client of clients) {
          // navigate() reloads the client's URL with a cache-bust so
          // the browser fetches fresh HTML + chunk manifest. If
          // navigate isn't available (e.g. in an iframe), skip.
          if (typeof client.navigate === "function") {
            try {
              const url = new URL(client.url);
              url.searchParams.set("_swkill", String(Date.now()));
              await client.navigate(url.toString());
            } catch (e) {
              // ignore individual client failures
            }
          }
        }
      } catch (e) {
        // ignore — best effort
      }
      try {
        await self.registration.unregister();
      } catch (e) {
        // ignore
      }
    })(),
  );
});

// Empty fetch listener so the previous "respondWith(fetch())"-style
// interception cannot still apply to in-flight requests at the
// moment of swap.
self.addEventListener("fetch", () => {});

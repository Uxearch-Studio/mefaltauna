import { NextResponse } from "next/server";

/**
 * Emergency reset endpoint. Returns a tiny self-contained HTML page
 * (no React, no Next chunks, no client bundle) whose inline script
 * unregisters every service worker, deletes every CacheStorage entry,
 * and clears localStorage/sessionStorage flags that gate UI state,
 * then redirects back to the home page.
 *
 * Why this exists: when we ship breaking changes to the service
 * worker or rotate JS chunk filenames across deploys, an existing
 * client can get wedged on stale assets. Mobile browsers don't
 * expose a one-tap "reload without cache" affordance, so we give
 * the user a URL they can type/paste to recover deterministically.
 *
 * Lives at /reset (no locale prefix) so it works regardless of i18n
 * state or middleware behavior. The route handler runs on the edge,
 * returns HTML directly, and never imports any app code so it can
 * never itself trigger a chunk error.
 */
export async function GET() {
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1a0b3d">
<title>Reiniciando mefaltauna…</title>
<style>
  html,body{margin:0;padding:0;background:#1a0b3d;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;}
  main{text-align:center;padding:24px;max-width:360px;}
  .ring{width:64px;height:64px;border:4px solid rgba(255,199,44,0.25);border-top-color:#ffc72c;border-radius:50%;margin:0 auto 24px;animation:spin 0.9s linear infinite;}
  h1{font-size:18px;font-weight:600;margin:0 0 8px;letter-spacing:-0.01em;}
  p{font-size:13px;line-height:1.5;color:rgba(255,255,255,0.65);margin:0;}
  @keyframes spin{to{transform:rotate(360deg);}}
</style>
</head>
<body>
<main>
  <div class="ring" aria-hidden="true"></div>
  <h1>Reiniciando mefaltauna…</h1>
  <p>Limpiando la caché del navegador. Te llevamos al inicio en un segundo.</p>
</main>
<script>
(function(){
  function done(){
    // Force a fresh navigation to the apex with a cache-bust so the
    // browser fetches the latest HTML from origin instead of any
    // service-worker or http-cache copy.
    var bust = Date.now();
    location.replace('/?_=' + bust);
  }
  var tasks = [];
  // 1. Unregister every service worker so future page loads skip
  //    any installed worker and go straight to the network.
  if ('serviceWorker' in navigator) {
    tasks.push(navigator.serviceWorker.getRegistrations().then(function(rs){
      return Promise.all(rs.map(function(r){ return r.unregister(); }));
    }).catch(function(){}));
  }
  // 2. Wipe every CacheStorage entry the SW (or any other code) put
  //    there. This evicts stale JS chunks, RSC payloads, and assets.
  if ('caches' in window) {
    tasks.push(caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return caches.delete(k); }));
    }).catch(function(){}));
  }
  // 3. Clear UI-state flags so the next visit starts clean.
  try {
    localStorage.removeItem('mfu:installed');
    localStorage.removeItem('mfu:chunk-reload-attempt');
    sessionStorage.removeItem('mfu:chunk-reload-attempt');
  } catch (e) {}
  // 4. Reload after every async task completes (or 1.5s, whichever
  //    comes first — we never block forever even if a task hangs).
  Promise.all(tasks).then(done);
  setTimeout(done, 1500);
})();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Make sure this page itself is never cached.
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      pragma: "no-cache",
    },
  });
}

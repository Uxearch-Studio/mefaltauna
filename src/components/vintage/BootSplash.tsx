/**
 * Inline boot splash. Renders directly in the SSR HTML so the user
 * never sees a white flash between the OS launch screen (manifest
 * background_color) and the React app hydrating — an inline
 * <script> at the bottom fades it out and removes it once the page
 * has had a chance to paint.
 *
 * The splash matches the brand stage violet (--stage-bg = #1a0b3d)
 * which is exactly what the manifest background_color uses, so on
 * iOS / Android PWA cold starts the transition from the OS splash
 * to our splash to the actual app is seamless.
 */
export function BootSplash() {
  return (
    <>
      <div
        id="app-splash"
        aria-hidden
        // CSS class lives in globals.css so it can be styled before
        // any other CSS loads. The inline `style` is the safety net
        // when even globals.css is delayed.
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "#1a0b3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 1,
          transition: "opacity 320ms ease-out",
          pointerEvents: "none",
        }}
      >
        {/* Logo mark with a soft pulse — matches the wordmark glyph in
            Logo.tsx so the brand reads from the very first frame. */}
        <svg
          viewBox="0 0 32 32"
          width="64"
          height="64"
          aria-hidden
          style={{
            color: "#ffc72c",
            filter: "drop-shadow(0 0 24px rgba(255,199,44,0.45))",
            animation: "splash-pulse 1.4s ease-in-out infinite",
          }}
        >
          <g fill="currentColor">
            <rect x="3" y="6" width="7" height="9" rx="1.4" />
            <rect x="12.5" y="6" width="7" height="9" rx="1.4" />
            <rect x="22" y="6" width="7" height="9" rx="1.4" />
            <rect x="3" y="17" width="7" height="9" rx="1.4" />
            <rect x="22" y="17" width="7" height="9" rx="1.4" />
          </g>
          <rect
            x="12.5"
            y="17"
            width="7"
            height="9"
            rx="1.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="2 1.6"
          />
        </svg>
      </div>

      {/* Hide-the-splash script. Runs as soon as the parser hits it,
          which is right after the splash markup, so the splash is
          mounted in the DOM before this fires. We wait for first
          paint via requestAnimationFrame and then a small extra delay
          so the user actually sees the splash for ~250ms — anything
          faster makes it feel like a flash. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function () {
  function dismiss() {
    var el = document.getElementById('app-splash');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 360);
  }
  function arm() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      requestAnimationFrame(function () { setTimeout(dismiss, 200); });
    } else {
      window.addEventListener('DOMContentLoaded', function () {
        requestAnimationFrame(function () { setTimeout(dismiss, 200); });
      }, { once: true });
    }
  }
  arm();
  // Belt-and-suspenders: if anything stalls, force-remove after 4s
  // so we never leave a stuck splash on top of a working page.
  setTimeout(dismiss, 4000);
})();
`,
        }}
      />
    </>
  );
}

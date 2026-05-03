/**
 * Continuous loop of a player silhouette dribbling a ball across the
 * bottom of the hero. Composed of inline SVG so the legs / arms swing
 * independently from the cross-screen translate.
 */
export function RunningPlayer() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-32"
    >
      <div className="absolute inset-x-0 bottom-0 anim-run-across">
        <div className="relative w-fit ml-0 anim-torso-bob">
          <svg
            viewBox="0 0 120 160"
            className="size-32 text-white/85"
            fill="currentColor"
          >
            {/* Head */}
            <circle cx="56" cy="22" r="11" />
            {/* Torso */}
            <path d="M44 36 L68 36 L66 78 L46 78 Z" />
            {/* Right arm (leading) */}
            <g className="anim-arm-r">
              <rect x="62" y="38" width="6" height="28" rx="3" />
            </g>
            {/* Left arm (trailing) */}
            <g className="anim-arm-l">
              <rect x="46" y="38" width="6" height="28" rx="3" />
            </g>
            {/* Right leg (forward) */}
            <g className="anim-leg-r">
              <rect x="56" y="78" width="7" height="40" rx="3" />
            </g>
            {/* Left leg (back) */}
            <g className="anim-leg-l">
              <rect x="48" y="78" width="7" height="40" rx="3" />
            </g>
          </svg>

          {/* Ball just ahead of the foot */}
          <svg
            viewBox="0 0 32 32"
            className="absolute size-7 left-[88px] bottom-2 anim-ball-spin"
            aria-hidden
          >
            <circle cx="16" cy="16" r="14" fill="white" />
            <path
              d="M16 6 L21 11 L19 17 L13 17 L11 11 Z"
              fill="black"
            />
            <path
              d="M16 6 L16 2 M21 11 L26 8 M19 17 L23 21 M13 17 L9 21 M11 11 L6 8"
              stroke="black"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Soft shadow under the player */}
          <span
            aria-hidden
            className="absolute left-[40px] -bottom-1 w-20 h-1.5 rounded-full bg-black/30 blur-sm"
          />
        </div>
      </div>
    </div>
  );
}

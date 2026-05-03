/**
 * Cinematic stadium scene — feels like a stylised broadcast intro:
 * - Deep purple sky with mesh gradient atmosphere
 * - Two big searchlight cones swinging on opposing keyframes
 * - A perspective pitch with crisp white lines stretching to the horizon
 * - Stadium silhouette at the back rim with glowing pylons
 * - Floating "stadium dust" particles slowly rising
 *
 * No video file required — entirely SVG + CSS. Reads as motion the
 * moment the page loads and keeps moving forever.
 */
export function StadiumScene() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {/* Sky gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0d0521 0%, #2a1163 35%, #5b21b6 75%, #1a0b3d 100%)",
        }}
      />

      {/* Searchlight beams */}
      <div className="absolute -top-32 left-[18%] w-1 h-[120vh] anim-searchlight-l">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 199, 44, 0.3) 0%, transparent 70%)",
            filter: "blur(28px)",
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
          }}
        />
      </div>
      <div className="absolute -top-32 right-[18%] w-1 h-[120vh] anim-searchlight-r">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(167, 139, 250, 0.3) 0%, transparent 70%)",
            filter: "blur(28px)",
            clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)",
          }}
        />
      </div>

      {/* Stadium silhouette */}
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 w-full h-1/3 text-black/60"
      >
        <defs>
          <radialGradient id="pylon-glow" cx="50%" cy="100%" r="50%">
            <stop offset="0%"  stopColor="rgba(255,199,44,0.4)" />
            <stop offset="100%" stopColor="rgba(255,199,44,0)" />
          </radialGradient>
        </defs>
        {/* Pylon glows */}
        <circle cx="180" cy="40" r="80" fill="url(#pylon-glow)" />
        <circle cx="600" cy="20" r="100" fill="url(#pylon-glow)" />
        <circle cx="1020" cy="40" r="80" fill="url(#pylon-glow)" />
        {/* Stadium rim curve */}
        <path
          d="M 0,200 L 0,150 Q 100,90 200,80 Q 250,75 280,80 L 280,60 L 320,55 L 360,60 L 360,80 Q 500,70 600,55 Q 700,70 840,80 L 840,60 L 880,55 L 920,60 L 920,80 Q 950,75 1000,80 Q 1100,90 1200,150 L 1200,200 Z"
          fill="currentColor"
        />
        {/* Pylon poles */}
        <rect x="178" y="30" width="4" height="60" fill="currentColor" opacity="0.8" />
        <rect x="598" y="10" width="4" height="80" fill="currentColor" opacity="0.8" />
        <rect x="1018" y="30" width="4" height="60" fill="currentColor" opacity="0.8" />
      </svg>

      {/* Pitch lines — perspective grid at the very bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-[18vh] anim-pitch-perspective"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 90%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 60%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 60%, black 100%)",
        }}
      >
        <svg
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <g
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          >
            {/* Vertical converging lines */}
            <line x1="0"    y1="200" x2="350" y2="0" />
            <line x1="200"  y1="200" x2="430" y2="0" />
            <line x1="400"  y1="200" x2="500" y2="0" />
            <line x1="600"  y1="200" x2="570" y2="0" />
            <line x1="800"  y1="200" x2="650" y2="0" />
            <line x1="1000" y1="200" x2="730" y2="0" />
            {/* Horizontal bands */}
            <line x1="0" y1="40"  x2="1000" y2="40"  opacity="0.4" />
            <line x1="0" y1="90"  x2="1000" y2="90"  opacity="0.6" />
            <line x1="0" y1="150" x2="1000" y2="150" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Rising particles */}
      <Particle left="8%"  delay="0s"   drift="40px"  />
      <Particle left="18%" delay="2.5s" drift="-20px" size="size-1" />
      <Particle left="32%" delay="5s"   drift="60px"  />
      <Particle left="48%" delay="1s"   drift="-30px" size="size-1.5" />
      <Particle left="62%" delay="6.5s" drift="20px"  />
      <Particle left="78%" delay="3.5s" drift="-50px" />
      <Particle left="88%" delay="0.5s" drift="30px"  size="size-1" />
    </div>
  );
}

function Particle({
  left,
  delay,
  drift,
  size = "size-2",
}: {
  left: string;
  delay: string;
  drift: string;
  size?: string;
}) {
  return (
    <span
      aria-hidden
      className={`absolute bottom-0 ${size} rounded-full bg-white/60 anim-particle-rise`}
      style={
        {
          left,
          animationDelay: delay,
          "--drift": drift,
          boxShadow: "0 0 6px rgba(255,255,255,0.5)",
        } as React.CSSProperties
      }
    />
  );
}

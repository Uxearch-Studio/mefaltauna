/**
 * Animated Panini-style sticker pack opening.
 * Pure SVG + CSS — three sticker fronts spring out from behind a torn
 * gold wrapper with confetti. After settling, each sticker bobs idly.
 *
 * Sized via the wrapper className. Self-contained, no JS state.
 */
export function PaniniPack({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="Sobre Panini abriéndose"
    >
      {/* Confetti sparks scattered around */}
      <Spark className="absolute left-[12%] top-[18%] size-2" delay="0.6s" color="#f7c948" />
      <Spark className="absolute right-[10%] top-[8%] size-1.5" delay="0.9s" color="#ff5a5f" />
      <Spark className="absolute left-[20%] bottom-[12%] size-1.5" delay="1.2s" color="#3b82f6" />
      <Spark className="absolute right-[18%] bottom-[20%] size-2" delay="1.4s" color="#f7c948" />
      <Spark className="absolute left-[42%] top-[2%] size-1" delay="1.6s" color="#ffffff" />

      {/* Pack body */}
      <svg
        viewBox="0 0 320 380"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="wrapper-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#f7c948" />
            <stop offset="50%"  stopColor="#d4a64a" />
            <stop offset="100%" stopColor="#a17a30" />
          </linearGradient>
          <linearGradient id="wrapper-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.5)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Pack back (stays in place) */}
        <g>
          <rect
            x="80" y="60" width="160" height="280" rx="6"
            fill="url(#wrapper-gold)"
          />
          <rect
            x="80" y="60" width="160" height="120"
            fill="url(#wrapper-shine)"
          />
          <text
            x="160" y="220"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="22"
            fill="#0a1426"
            letterSpacing="2"
          >
            mefaltauna
          </text>
          <text
            x="160" y="246"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="#0a1426"
            opacity="0.7"
            letterSpacing="3"
          >
            MUNDIAL · 2026
          </text>
          <text
            x="160" y="320"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="#0a1426"
            opacity="0.6"
            letterSpacing="2"
          >
            5 LÁMINAS
          </text>
        </g>

        {/* Torn front (peeled away) */}
        <g className="anim-pack-tear">
          <path
            d="M 80,60 L 240,60 L 240,180 Q 220,160 200,170 Q 180,180 160,170 Q 140,160 120,170 Q 100,180 80,170 Z"
            fill="url(#wrapper-gold)"
            stroke="#a17a30"
            strokeWidth="1"
          />
        </g>
      </svg>

      {/* Stickers flying out */}
      <FloatingSticker
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 anim-fly-1 anim-idle-bob"
        tilt="-12deg"
        team="ARG"
        number="10"
        accent="#5cb3ff"
      />
      <FloatingSticker
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 anim-fly-2 anim-idle-bob"
        tilt="8deg"
        team="COL"
        number="7"
        accent="#fde047"
        foil
      />
      <FloatingSticker
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 anim-fly-3 anim-idle-bob"
        tilt="20deg"
        team="BRA"
        number="9"
        accent="#22c55e"
      />
    </div>
  );
}

function FloatingSticker({
  className = "",
  tilt = "0deg",
  team,
  number,
  accent,
  foil = false,
}: {
  className?: string;
  tilt?: string;
  team: string;
  number: string;
  accent: string;
  foil?: boolean;
}) {
  return (
    <div
      className={className}
      style={
        {
          "--tilt": tilt,
          width: "92px",
          height: "120px",
        } as React.CSSProperties
      }
    >
      <div
        className={`relative w-full h-full rounded-lg overflow-hidden shadow-xl shadow-black/40 ${
          foil ? "foil-edge" : ""
        }`}
      >
        <div
          className={`absolute inset-0 ${foil ? "foil-holo" : ""}`}
          style={!foil ? { background: accent } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
        <div className="relative h-full p-2 flex flex-col items-center justify-between text-white">
          <span className="text-[9px] font-bold tracking-widest opacity-90">
            {team}
          </span>
          <span
            className="font-display text-3xl leading-none tabular-nums"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}
          >
            {number}
          </span>
          <span className="text-[8px] tracking-widest opacity-80">
            MUNDIAL 26
          </span>
        </div>
      </div>
    </div>
  );
}

function Spark({
  className,
  delay,
  color,
}: {
  className?: string;
  delay: string;
  color: string;
}) {
  return (
    <span
      aria-hidden
      className={`anim-spark rounded-full ${className ?? ""}`}
      style={{
        background: color,
        animationDelay: delay,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  );
}

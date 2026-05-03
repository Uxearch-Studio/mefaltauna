/**
 * Looping pack-opening: the gold sticker pack tears open every 5s,
 * a price card slides up out of it, rests, then slides back.
 *
 * Self-contained SVG + CSS keyframes.
 */
export function PriceReveal({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      {/* Pack body */}
      <svg viewBox="0 0 240 320" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="pack-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ffd97a" />
            <stop offset="50%"  stopColor="#ffc72c" />
            <stop offset="100%" stopColor="#a17a30" />
          </linearGradient>
          <linearGradient id="pack-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Pack back (stays in place) */}
        <g>
          <rect x="40" y="40" width="160" height="240" rx="8" fill="url(#pack-gold)" />
          <rect x="40" y="40" width="160" height="100" fill="url(#pack-shine)" />
          <text
            x="120" y="170"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="18"
            fill="#1a0b3d"
            letterSpacing="2"
          >
            mefaltauna
          </text>
          <text
            x="120" y="195"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="#1a0b3d"
            opacity="0.7"
            letterSpacing="3"
          >
            PASE ÚNICO
          </text>
        </g>

        {/* Torn front — peels away on every loop */}
        <g className="anim-pack-tear-loop">
          <path
            d="M 40,40 L 200,40 L 200,160 Q 180,140 160,150 Q 140,160 120,150 Q 100,140 80,150 Q 60,160 40,150 Z"
            fill="url(#pack-gold)"
            stroke="#a17a30"
            strokeWidth="1"
          />
        </g>
      </svg>

      {/* Price card — slides up out of the pack on every loop */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="anim-pack-reveal">
          <div className="rounded-xl bg-white shadow-2xl shadow-black/40 px-5 py-4 border-2 border-[#1a0b3d]/10 ring-1 ring-[#ffc72c]/40">
            <p className="text-[10px] uppercase tracking-widest text-[#1a0b3d]/60 text-center">
              Pase único · COP
            </p>
            <p
              className="font-display text-4xl text-[#1a0b3d] tabular-nums leading-none mt-1.5"
              style={{ letterSpacing: "-0.02em" }}
            >
              $9.900
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { StickerCard } from "./StickerCard";

/**
 * Stronger hero animation: a single large sticker card spotlighted
 * to the side, rotating slowly with a continuous foil shimmer glow.
 * Replaces the prior FloatingDeck which moved to the FinalCta.
 */
export function HeroSpotlight() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* Glow halo behind the card */}
      <div
        className="absolute right-[-20%] md:right-[5%] top-1/2 -translate-y-1/2 size-[420px] md:size-[520px] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--stage-yellow) 0%, transparent 60%)",
        }}
      />

      {/* Big rotating hero card */}
      <div className="absolute right-[-12%] md:right-[3%] top-1/2 -translate-y-1/2 anim-spotlight">
        <div
          className="anim-spotlight-tilt"
          style={{ transformStyle: "preserve-3d" }}
        >
          <StickerCard
            team="COL"
            number="7"
            name="Luis Díaz"
            subtitle="Extremo izquierdo"
            context="Colombia · Mundial 2026"
            size="lg"
          />
        </div>
      </div>

      {/* Sparkle pings */}
      <span aria-hidden className="absolute left-[12%] top-[28%] size-1.5 rounded-full bg-[var(--stage-yellow)] anim-spark" style={{ animationDelay: "0.2s", boxShadow: "0 0 10px var(--stage-yellow)" }} />
      <span aria-hidden className="absolute left-[20%] top-[64%] size-1 rounded-full bg-white anim-spark" style={{ animationDelay: "0.7s", boxShadow: "0 0 8px white" }} />
      <span aria-hidden className="absolute right-[34%] top-[12%] size-1.5 rounded-full bg-[var(--stage-purple-1)] anim-spark" style={{ animationDelay: "1.1s", boxShadow: "0 0 10px var(--stage-purple-1)" }} />
      <span aria-hidden className="absolute right-[12%] bottom-[18%] size-2 rounded-full bg-[var(--stage-yellow)] anim-spark" style={{ animationDelay: "1.5s", boxShadow: "0 0 14px var(--stage-yellow)" }} />
    </div>
  );
}

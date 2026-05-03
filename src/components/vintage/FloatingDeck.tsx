/**
 * Floating sticker cards in the hero — 3 cards at different depths
 * with subtle bob/tilt animations. Replaces the running player
 * silhouette with something cleaner / more Apple-product-page.
 */
export function FloatingDeck({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Big card — bottom right, foreground */}
      <FloatCard
        team="COL"
        number="7"
        gradient="linear-gradient(135deg, #ffc72c 0%, #f59e0b 100%)"
        className="absolute right-[-8%] md:right-[6%] bottom-[8%] w-32 h-44 md:w-40 md:h-56 anim-float-1"
        textColor="#1a0b3d"
      />
      {/* Medium card — top right, mid-depth */}
      <FloatCard
        team="ARG"
        number="10"
        gradient="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
        className="absolute right-[18%] top-[12%] w-20 h-28 md:w-28 md:h-40 anim-float-2 opacity-80"
        textColor="#fafaf7"
      />
      {/* Small card — left, background */}
      <FloatCard
        team="BRA"
        number="9"
        gradient="linear-gradient(135deg, #22c55e 0%, #14532d 100%)"
        className="absolute left-[6%] top-[28%] w-16 h-22 md:w-24 md:h-32 anim-float-3 opacity-70"
        textColor="#fafaf7"
      />
    </div>
  );
}

function FloatCard({
  team,
  number,
  gradient,
  className,
  textColor,
}: {
  team: string;
  number: string;
  gradient: string;
  className: string;
  textColor: string;
}) {
  return (
    <div className={className}>
      <div
        className="relative w-full h-full rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        style={{ background: gradient, color: textColor }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/20" />
        <div className="relative h-full p-2.5 flex flex-col items-center justify-between">
          <span className="text-[8px] md:text-[10px] font-bold tracking-widest opacity-90">
            {team}
          </span>
          <span
            className="font-display text-3xl md:text-5xl leading-none tabular-nums"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.2)" }}
          >
            {number}
          </span>
          <span className="text-[7px] md:text-[8px] tracking-widest opacity-80">
            MUNDIAL 26
          </span>
        </div>
      </div>
    </div>
  );
}

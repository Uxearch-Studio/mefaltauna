import { StickerCard } from "./StickerCard";

/**
 * Three Panini-style sticker cards floating in the hero. Cards use
 * the same visual language as StickerPreview — purple+yellow gradient
 * with badges in purple/yellow — at smaller sizes and with bob/tilt
 * keyframes that run continuously.
 */
export function FloatingDeck({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Foreground card — bottom right */}
      <div className="absolute right-[-6%] md:right-[8%] bottom-[6%] anim-float-1">
        <StickerCard
          team="COL"
          number="7"
          size="md"
          name="Luis Díaz"
          context="COL · 2026"
        />
      </div>

      {/* Mid card — top right */}
      <div className="absolute right-[24%] top-[8%] anim-float-2 opacity-90">
        <StickerCard team="ARG" number="10" size="sm" />
      </div>

      {/* Background card — left */}
      <div className="absolute left-[6%] top-[24%] anim-float-3 opacity-70">
        <StickerCard team="BRA" number="9" size="sm" />
      </div>
    </div>
  );
}

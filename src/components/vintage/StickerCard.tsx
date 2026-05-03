/**
 * Reusable Panini-style sticker card.
 * Used by StickerPreview (large) and FloatingDeck (small variants).
 *
 * Layout:
 *   ┌──────────────────────┐
 *   │ [TEAM]      [NUMBER] │  ← purple badges with yellow text
 *   │                       │
 *   │   player silhouette   │  ← gradient backdrop
 *   │                       │
 *   ├──────────────────────┤
 *   │ context               │
 *   │ NAME                  │
 *   │ subtitle              │
 *   └──────────────────────┘
 */

type Size = "sm" | "md" | "lg";

type Props = {
  team: string;
  number: string;
  name?: string;
  subtitle?: string;
  context?: string;
  tapped?: boolean;
  size?: Size;
  className?: string;
};

export function StickerCard({
  team,
  number,
  name,
  subtitle,
  context,
  tapped = false,
  size = "lg",
  className = "",
}: Props) {
  const dims =
    size === "lg"
      ? "w-64 md:w-80"
      : size === "md"
        ? "w-32 md:w-40"
        : "w-20 md:w-24";

  const badgeSize =
    size === "lg" ? "size-12" : size === "md" ? "size-7 md:size-9" : "size-6";

  const numberSize =
    size === "lg"
      ? "text-2xl"
      : size === "md"
        ? "text-base md:text-lg"
        : "text-sm";

  const teamLabelSize =
    size === "lg" ? "text-xs" : size === "md" ? "text-[9px]" : "text-[8px]";

  return (
    <article
      className={`relative ${dims} rounded-2xl overflow-hidden shine-sweep border border-border bg-background shadow-2xl shadow-accent/20 ${
        tapped ? "is-tapped" : ""
      } ${className}`}
    >
      {/* Top — gradient with badges */}
      <div
        className="aspect-[3/4] relative"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--highlight) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />

        {/* Team badge — purple bg, yellow text */}
        <span
          className={`absolute ${
            size === "lg" ? "top-3 left-3" : "top-1.5 left-1.5"
          } ${badgeSize} rounded-lg flex items-center justify-center font-bold ${teamLabelSize}`}
          style={{
            background: "var(--accent)",
            color: "var(--highlight)",
          }}
        >
          {team}
        </span>

        {/* Number badge — purple bg, yellow text */}
        <span
          className={`absolute ${
            size === "lg" ? "top-3 right-3" : "top-1.5 right-1.5"
          } ${badgeSize} rounded-lg flex items-center justify-center font-bold tabular-nums ${numberSize}`}
          style={{
            background: "var(--accent)",
            color: "var(--highlight)",
          }}
        >
          {number}
        </span>

        <PlayerSilhouette />
      </div>

      {/* Bottom — info strip */}
      {(name || context) && (
        <div className="border-t border-border p-3 md:p-4 flex flex-col gap-0.5 text-left bg-background">
          {context && (
            <p
              className={`uppercase tracking-wider text-muted-foreground ${
                size === "lg" ? "text-[10px]" : "text-[8px]"
              }`}
            >
              {context}
            </p>
          )}
          {name && (
            <h3
              className={`font-semibold tracking-tight text-foreground ${
                size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs"
              }`}
            >
              {name}
            </h3>
          )}
          {subtitle && (
            <p
              className={`text-muted-foreground ${
                size === "lg" ? "text-xs" : "text-[10px]"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function PlayerSilhouette() {
  return (
    <svg
      viewBox="0 0 120 160"
      className="absolute inset-0 size-full text-black/30"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="currentColor">
        <circle cx="60" cy="42" r="20" />
        <path d="M30 88 Q60 64 90 88 L96 140 L24 140 Z" />
      </g>
    </svg>
  );
}

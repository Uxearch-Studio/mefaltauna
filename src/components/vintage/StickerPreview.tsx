import { useTranslations } from "next-intl";

export function StickerPreview() {
  const t = useTranslations("preview");

  return (
    <section id="explore" className="border-t-2 border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("kicker")}
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-[0.9]">
            {t("title")}
          </h2>
          <p className="text-base text-foreground/70 leading-relaxed max-w-md">
            {t("body")}
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="h-11 px-4 font-mono text-xs uppercase tracking-widest bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {t("ctaTrade")}
            </button>
            <button
              type="button"
              className="h-11 px-4 font-mono text-xs uppercase tracking-widest bg-transparent text-foreground border-2 border-border hover:bg-foreground hover:text-background transition-colors"
            >
              {t("ctaBuy")}
            </button>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <StickerCard />
        </div>
      </div>
    </section>
  );
}

/**
 * Mock sticker for the landing — Luis Díaz, COL #7.
 * Will be replaced by a real catalog component in Phase 3.
 */
function StickerCard() {
  return (
    <div className="relative">
      <article className="w-64 md:w-80 bg-background border-2 border-border border-sticker">
        <div className="aspect-[3/4] bg-muted relative overflow-hidden">
          {/* Halftone-style silhouette */}
          <PlayerSilhouette />
          {/* Federation badge */}
          <span className="absolute top-3 left-3 size-12 border-2 border-border bg-background flex items-center justify-center font-display text-sm">
            COL
          </span>
          {/* Squad number */}
          <span className="absolute top-3 right-3 size-12 border-2 border-border bg-accent text-accent-foreground flex items-center justify-center font-display text-2xl">
            7
          </span>
        </div>
        <div className="border-t-2 border-border p-4 flex flex-col gap-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Colombia · Mundial 2026
          </p>
          <h3 className="font-display text-xl leading-tight">Luis Díaz</h3>
          <p className="font-mono text-xs text-muted-foreground">
            Extremo izquierdo
          </p>
        </div>
      </article>
      {/* Floating decoration: a second card peeking behind */}
      <div
        aria-hidden
        className="absolute -z-10 inset-0 translate-x-3 translate-y-3 bg-muted border-2 border-border"
      />
    </div>
  );
}

function PlayerSilhouette() {
  return (
    <svg
      viewBox="0 0 120 160"
      className="absolute inset-0 size-full text-foreground"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id="halftone"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="0.7" fill="currentColor" />
        </pattern>
      </defs>
      {/* Body silhouette */}
      <g fill="url(#halftone)">
        <circle cx="60" cy="42" r="20" />
        <path d="M30 88 Q60 64 90 88 L96 140 L24 140 Z" />
      </g>
      {/* Outline accent */}
      <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
        <circle cx="60" cy="42" r="20" />
        <path d="M30 88 Q60 64 90 88 L96 140 L24 140 Z" />
      </g>
    </svg>
  );
}

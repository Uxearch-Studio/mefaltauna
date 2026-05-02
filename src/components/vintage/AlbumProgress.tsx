"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

const MILESTONES = [10, 25, 50, 75, 100] as const;

type Props = {
  owned: number;
  total: number;
};

export function AlbumProgress({ owned, total }: Props) {
  const t = useTranslations("album.progress");
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;

  // XP-ish points: 10 per unique sticker + 5 bonus per milestone reached.
  const xp =
    owned * 10 + MILESTONES.filter((m) => pct >= m).length * 50;

  const nextMilestone = MILESTONES.find((m) => m > pct);
  const stickersToNext = nextMilestone
    ? Math.max(1, Math.ceil((nextMilestone / 100) * total) - owned)
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-5xl md:text-6xl leading-none tabular-nums">
            {owned}
          </span>
          <span className="font-pixel text-xs uppercase text-muted-foreground">
            / {total} · {pct}%
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-foreground text-background border-2 border-border">
          <span className="font-pixel text-[10px] uppercase">XP</span>
          <span className="font-pixel text-sm tabular-nums crt-glow text-accent">
            {xp.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      <div
        className="relative h-6 border-2 border-border bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
        {MILESTONES.slice(0, -1).map((m) => (
          <span
            key={m}
            aria-hidden
            className={cn(
              "absolute top-0 bottom-0 w-px",
              pct >= m ? "bg-accent-foreground/40" : "bg-border/40",
            )}
            style={{ left: `${m}%` }}
          />
        ))}
      </div>

      {nextMilestone && stickersToNext && (
        <p className="font-pixel text-[10px] uppercase text-muted-foreground">
          {t("nextMilestone", { pct: nextMilestone, count: stickersToNext })}
        </p>
      )}
      {!nextMilestone && (
        <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
          {t("complete")}
        </p>
      )}
    </div>
  );
}

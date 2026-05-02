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
  const xp = owned * 10 + MILESTONES.filter((m) => pct >= m).length * 50;

  const nextMilestone = MILESTONES.find((m) => m > pct);
  const stickersToNext = nextMilestone
    ? Math.max(1, Math.ceil((nextMilestone / 100) * total) - owned)
    : null;

  return (
    <div className="surface-card p-5 flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {owned}
          </span>
          <span className="text-sm text-muted-foreground">
            / {total} · {pct}%
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 h-7 rounded-full bg-accent/15 text-accent">
          <span className="text-[10px] uppercase tracking-wider font-semibold">XP</span>
          <span className="text-sm font-semibold tabular-nums">
            {xp.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      <div
        className="relative h-2 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
        {MILESTONES.slice(0, -1).map((m) => (
          <span
            key={m}
            aria-hidden
            className={cn(
              "absolute top-0 bottom-0 w-px",
              pct >= m ? "bg-background/50" : "bg-border",
            )}
            style={{ left: `${m}%` }}
          />
        ))}
      </div>

      {nextMilestone && stickersToNext && (
        <p className="text-xs text-muted-foreground">
          {t("nextMilestone", { pct: nextMilestone, count: stickersToNext })}
        </p>
      )}
      {!nextMilestone && (
        <p className="text-xs font-medium text-accent">{t("complete")}</p>
      )}
    </div>
  );
}

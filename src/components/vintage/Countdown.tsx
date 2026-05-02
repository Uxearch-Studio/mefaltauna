"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/**
 * Mundial 2026 — opening match: 11 June 2026, Estadio Azteca, México.
 * Kickoff approx. 16:00 UTC-6 → 22:00 UTC.
 */
const TARGET = new Date("2026-06-11T22:00:00Z").getTime();

type Parts = { d: number; h: number; m: number; s: number; over: boolean };

function diff(now: number): Parts {
  const ms = TARGET - now;
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true };
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    over: false,
  };
}

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

export function Countdown() {
  const t = useTranslations("countdown");
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(diff(Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-pixel text-[10px] md:text-xs uppercase tracking-widest text-accent crt-glow">
        {parts?.over ? t("live") : t("kickoff")}
      </p>

      <div className="flex items-stretch gap-2 md:gap-3">
        <Cell value={parts ? pad(parts.d, 3) : "···"} label={t("days")} />
        <Sep />
        <Cell value={parts ? pad(parts.h) : "··"} label={t("hours")} />
        <Sep />
        <Cell value={parts ? pad(parts.m) : "··"} label={t("minutes")} />
        <Sep />
        <Cell value={parts ? pad(parts.s) : "··"} label={t("seconds")} />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {t("location")}
      </p>
    </div>
  );
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        "min-w-[4rem] md:min-w-[5.5rem] px-2 md:px-3 py-3 md:py-4",
        "bg-foreground text-background border-2 border-border border-sticker",
      )}
    >
      <span
        className="font-pixel text-2xl md:text-4xl leading-none tabular-nums crt-glow text-accent"
        suppressHydrationWarning
      >
        {value}
      </span>
      <span className="font-pixel text-[8px] md:text-[10px] uppercase tracking-widest text-background/70">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="self-center font-pixel text-2xl md:text-4xl text-accent leading-none animate-pulse"
    >
      :
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
    <div className="flex flex-col items-center gap-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
        {parts?.over ? t("live") : t("kickoff")}
      </p>

      <div className="grid grid-cols-4 gap-3 md:gap-4">
        <Cell value={parts ? String(parts.d) : "··"} label={t("days")} />
        <Cell value={parts ? pad(parts.h) : "··"} label={t("hours")} />
        <Cell value={parts ? pad(parts.m) : "··"} label={t("minutes")} />
        <Cell value={parts ? pad(parts.s) : "··"} label={t("seconds")} />
      </div>

      <p className="text-xs text-muted-foreground">{t("location")}</p>
    </div>
  );
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="surface-card p-4 md:p-5 flex flex-col items-center gap-2 min-w-[4.5rem] md:min-w-[6rem]">
      <span
        className="text-3xl md:text-5xl font-bold tabular-nums leading-none tracking-tight"
        suppressHydrationWarning
      >
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

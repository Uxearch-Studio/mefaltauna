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

/**
 * Broadcast-style scoreboard countdown — bold tabular nums, no leading
 * zero on the day number, kicker copy in marker font.
 */
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
      <p className="font-marker text-base md:text-lg text-[#f7c948]">
        {parts?.over ? t("live") : t("kickoff")}
      </p>

      <div className="flex items-stretch gap-2 md:gap-3">
        <Cell value={parts ? String(parts.d) : "··"} label={t("days")} />
        <Sep />
        <Cell value={parts ? pad(parts.h) : "··"} label={t("hours")} />
        <Sep />
        <Cell value={parts ? pad(parts.m) : "··"} label={t("minutes")} />
        <Sep />
        <Cell value={parts ? pad(parts.s) : "··"} label={t("seconds")} />
      </div>

      <p className="text-xs text-white/60 uppercase tracking-widest">
        {t("location")}
      </p>
    </div>
  );
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[3.5rem] md:min-w-[5rem] px-2 py-3 rounded-xl bg-black/40 border border-white/10 backdrop-blur">
      <span
        className="font-display text-3xl md:text-5xl leading-none tabular-nums text-white"
        suppressHydrationWarning
      >
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-white/60">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="self-center text-2xl md:text-4xl font-bold text-[#f7c948] leading-none animate-pulse"
    >
      :
    </span>
  );
}

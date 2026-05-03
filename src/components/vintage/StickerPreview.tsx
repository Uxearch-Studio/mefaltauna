"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function StickerPreview() {
  const t = useTranslations("preview");

  return (
    <section id="explore" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5">
          <p className="font-marker text-lg text-accent">{t("kicker")}</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md">
            {t("body")}
          </p>
          <p className="text-xs text-muted-foreground/70 italic">
            {t("hint")}
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <StickerCard />
        </div>
      </div>
    </section>
  );
}

function StickerCard() {
  const [tapped, setTapped] = useState(false);

  function trigger() {
    setTapped(true);
    setTimeout(() => setTapped(false), 800);
  }

  return (
    <button
      type="button"
      onClick={trigger}
      className="relative active:scale-[0.98] transition-transform anim-drop-bounce"
      aria-label="Vista de lámina"
    >
      {/* Foil edge that pulses */}
      <div className="foil-edge rounded-2xl">
        <article
          className={`relative w-64 md:w-80 surface-card overflow-hidden shine-sweep border-2 border-transparent ${
            tapped ? "is-tapped" : ""
          }`}
        >
          <div className="aspect-[3/4] relative foil-holo">
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30" />
            <span className="absolute top-3 left-3 size-12 rounded-lg bg-background/95 backdrop-blur flex items-center justify-center text-xs font-bold">
              COL
            </span>
            <span className="absolute top-3 right-3 size-12 rounded-lg bg-foreground text-background flex items-center justify-center text-2xl font-bold tabular-nums">
              7
            </span>
            <PlayerSilhouette />
          </div>
          <div className="border-t border-border p-4 flex flex-col gap-1 text-left bg-background">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Colombia · Mundial 2026
            </p>
            <h3 className="text-lg font-semibold tracking-tight">Luis Díaz</h3>
            <p className="text-xs text-muted-foreground">Extremo izquierdo</p>
          </div>
        </article>
      </div>

      <div
        aria-hidden
        className="absolute -z-10 inset-0 translate-x-2 translate-y-2 rounded-2xl bg-foreground/20"
      />
    </button>
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

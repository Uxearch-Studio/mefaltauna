"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StickerCard } from "./StickerCard";

export function StickerPreview() {
  const t = useTranslations("preview");
  const [tapped, setTapped] = useState(false);

  function trigger() {
    setTapped(true);
    setTimeout(() => setTapped(false), 800);
  }

  return (
    <section id="explore" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("kicker")}
          </p>
          <h2
            className="font-display whitespace-nowrap leading-none"
            style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
          >
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md">
            {t("body")}
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <button
            type="button"
            onClick={trigger}
            className="relative active:scale-[0.98] transition-transform"
            aria-label="Vista de lámina"
          >
            <StickerCard
              team="COL"
              number="7"
              name="Luis Díaz"
              subtitle="Extremo izquierdo"
              context="Colombia · Mundial 2026"
              tapped={tapped}
              size="lg"
            />
            <div
              aria-hidden
              className="absolute -z-10 inset-0 translate-x-2 translate-y-2 rounded-2xl bg-foreground/10"
            />
          </button>
        </div>
      </div>
    </section>
  );
}

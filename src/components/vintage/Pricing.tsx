import { useTranslations } from "next-intl";
import { PriceReveal } from "./PriceReveal";

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Info first — text + CTA only. Benefits live INSIDE the gold card. */}
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
            {t("subtitle")}
          </p>

          <p className="text-sm font-semibold mt-2 text-[var(--stage-yellow)]">
            {t("openHint")}
          </p>

          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
        </div>

        {/* Pack — width adapts to viewport; height grows with content
            so benefits never truncate on small screens. */}
        <div className="flex justify-center md:justify-end">
          <PriceReveal className="w-full max-w-sm md:max-w-md min-h-[34rem] md:min-h-[38rem]" />
        </div>
      </div>
    </section>
  );
}

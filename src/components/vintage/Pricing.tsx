import { useTranslations } from "next-intl";
import { PriceReveal } from "./PriceReveal";

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-5 md:order-1 order-2">
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

          <ul className="flex flex-col gap-3 text-sm mt-2">
            <Feature>{t("benefits.full")}</Feature>
            <Feature>{t("benefits.chat")}</Feature>
            <Feature>{t("benefits.unlimited")}</Feature>
            <Feature>{t("benefits.noCommission")}</Feature>
          </ul>

          <button
            type="button"
            className="self-start mt-4 h-12 px-6 rounded-full bg-accent text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-accent/20"
          >
            {t("cta")}
          </button>

          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
        </div>

        <div className="flex justify-center md:justify-end md:order-2 order-1">
          <PriceReveal className="w-60 h-80 md:w-72 md:h-96" />
        </div>
      </div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "var(--highlight)",
          color: "var(--highlight-foreground)",
        }}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 8 L7 12 L13 4" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

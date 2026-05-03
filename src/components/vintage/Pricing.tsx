import { useTranslations } from "next-intl";

const PRICE = 9900;
const COP = new Intl.NumberFormat("es-CO");

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
            {t("kicker")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[0.95] mb-3">
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <article className="surface-card p-8 md:p-10 ring-2 ring-accent flex flex-col gap-6 max-w-md mx-auto">
          <header className="flex flex-col items-center text-center gap-2">
            <span className="px-3 py-1 rounded-full bg-highlight text-highlight-foreground text-[10px] font-semibold uppercase tracking-wide">
              {t("singlePass")}
            </span>
            <h3 className="text-2xl font-semibold tracking-tight">
              {t("planName")}
            </h3>
            <p className="text-sm text-muted-foreground">{t("planTagline")}</p>
          </header>

          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-5xl md:text-6xl font-bold tabular-nums tracking-tight">
              ${COP.format(PRICE)}
            </span>
            <span className="text-sm text-muted-foreground">COP</span>
          </div>

          <ul className="flex flex-col gap-2.5 text-sm">
            <Feature>{t("benefits.full")}</Feature>
            <Feature>{t("benefits.chat")}</Feature>
            <Feature>{t("benefits.unlimited")}</Feature>
            <Feature>{t("benefits.noCommission")}</Feature>
          </ul>

          <button
            type="button"
            className="h-12 px-5 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            {t("cta")}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            {t("disclaimer")}
          </p>
        </article>
      </div>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg
        viewBox="0 0 16 16"
        className="size-4 mt-0.5 shrink-0 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 8 L7 12 L13 4" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

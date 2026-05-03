import { useTranslations } from "next-intl";

const PRICE = 9900;
const COP = new Intl.NumberFormat("es-CO");

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            {t("kicker")}
          </p>
          <h2
            className="font-display whitespace-nowrap leading-none mb-4 mx-auto"
            style={{ fontSize: "clamp(2.25rem, 7vw, 4.5rem)" }}
          >
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <article className="relative rounded-2xl bg-background border border-border p-8 md:p-10 flex flex-col gap-6 max-w-md mx-auto shadow-2xl shadow-accent/10">
          {/* Highlight glow corner */}
          <div
            aria-hidden
            className="absolute -top-px left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--highlight), transparent)",
            }}
          />

          <header className="flex flex-col items-center text-center gap-2">
            <span className="px-3 py-1 rounded-full bg-highlight text-highlight-foreground text-[10px] font-bold uppercase tracking-widest">
              {t("singlePass")}
            </span>
            <h3 className="text-2xl font-bold tracking-tight">
              {t("planName")}
            </h3>
            <p className="text-sm text-muted-foreground">{t("planTagline")}</p>
          </header>

          <div className="flex items-baseline gap-2 justify-center">
            <span className="font-display text-6xl md:text-7xl tabular-nums">
              ${COP.format(PRICE)}
            </span>
            <span className="text-sm text-muted-foreground">COP</span>
          </div>

          <ul className="flex flex-col gap-3 text-sm">
            <Feature>{t("benefits.full")}</Feature>
            <Feature>{t("benefits.chat")}</Feature>
            <Feature>{t("benefits.unlimited")}</Feature>
            <Feature>{t("benefits.noCommission")}</Feature>
          </ul>

          <button
            type="button"
            className="h-12 px-5 rounded-full bg-accent text-accent-foreground font-bold hover:opacity-90 transition-opacity"
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
    <li className="flex items-start gap-2.5">
      <span
        className="mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "var(--highlight)", color: "var(--highlight-foreground)" }}
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

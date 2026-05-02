import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

const PLANS = [
  { id: "banca", price: 3000, slots: 5, featured: false },
  { id: "titular", price: 10000, slots: 20, featured: true },
  { id: "mvp", price: 50000, slots: -1, featured: false },
] as const;

const COP = new Intl.NumberFormat("es-CO");

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section id="pricing" className="border-b border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
            {t("kicker")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[0.95] mb-3">
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative surface-card p-7 flex flex-col gap-5",
                plan.featured && "ring-2 ring-accent",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-highlight text-highlight-foreground text-[10px] font-semibold uppercase tracking-wide">
                  {t("popular")}
                </span>
              )}

              <header className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold tracking-tight">
                  {t(`plans.${plan.id}.name`)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(`plans.${plan.id}.tagline`)}
                </p>
              </header>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums tracking-tight">
                  ${COP.format(plan.price)}
                </span>
                <span className="text-xs text-muted-foreground">COP</span>
              </div>

              <ul className="flex flex-col gap-2.5 text-sm">
                <Feature>
                  {plan.slots === -1
                    ? t("plans.mvp.slots")
                    : t("slots", { count: plan.slots })}
                </Feature>
                <Feature>{t("oneShot")}</Feature>
                <Feature>{t("noCommission")}</Feature>
                <Feature>{t("chat")}</Feature>
              </ul>

              <button
                type="button"
                className={cn(
                  "mt-auto h-11 px-4 rounded-full text-sm font-medium transition-opacity",
                  plan.featured
                    ? "bg-highlight text-highlight-foreground hover:opacity-90"
                    : "bg-foreground text-background hover:opacity-90",
                )}
              >
                {t("cta")}
              </button>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">{t("disclaimer")}</p>
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

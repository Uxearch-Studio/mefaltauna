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
    <section id="pricing" className="border-t-2 border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-2xl mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {t("kicker")}
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-[0.9] mb-4">
            {t("title")}
          </h2>
          <p className="text-base text-foreground/70 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative bg-background p-8 flex flex-col gap-6 border-2 border-border",
                plan.featured && "border-sticker md:-translate-y-2",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-6 px-2 py-0.5 bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-widest border-2 border-border">
                  {t("popular")}
                </span>
              )}

              <header className="flex flex-col gap-1">
                <h3 className="font-display text-3xl tracking-tight">
                  {t(`plans.${plan.id}.name`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`plans.${plan.id}.tagline`)}
                </p>
              </header>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl">
                  ${COP.format(plan.price)}
                </span>
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  COP
                </span>
              </div>

              <ul className="flex flex-col gap-2 text-sm">
                <li className="flex gap-2">
                  <Check />
                  <span>
                    {plan.slots === -1
                      ? t("plans.mvp.slots")
                      : t("slots", { count: plan.slots })}
                  </span>
                </li>
                <li className="flex gap-2">
                  <Check />
                  <span>{t("oneShot")}</span>
                </li>
                <li className="flex gap-2">
                  <Check />
                  <span>{t("noCommission")}</span>
                </li>
                <li className="flex gap-2">
                  <Check />
                  <span>{t("chat")}</span>
                </li>
              </ul>

              <button
                type="button"
                className={cn(
                  "mt-auto h-11 px-4 font-mono text-xs uppercase tracking-widest border-2 border-border transition-colors",
                  plan.featured
                    ? "bg-accent text-accent-foreground hover:bg-foreground hover:text-background"
                    : "bg-foreground text-background hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {t("cta")}
              </button>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs font-mono uppercase tracking-widest text-muted-foreground/70">
          {t("disclaimer")}
        </p>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4 mt-0.5 shrink-0 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path d="M3 8 L7 12 L13 4" strokeLinecap="square" />
    </svg>
  );
}

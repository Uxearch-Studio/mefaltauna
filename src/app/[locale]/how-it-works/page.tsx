import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { PixelBall, PixelTrophy, PixelStadium } from "@/components/vintage/PixelArt";

const STEPS = [
  { id: "mark", icon: PixelBall },
  { id: "match", icon: PixelStadium },
  { id: "trade", icon: PixelTrophy },
] as const;

const FAQ_KEYS = ["payment", "shipping", "safety", "panini"] as const;

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("how");

  return (
    <>
      <Header />
      <main>
        <section className="border-b-2 border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center gap-6">
            <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
              {t("kicker")}
            </p>
            <h1 className="font-display text-5xl md:text-8xl leading-[0.9] max-w-4xl">
              {t("title")}
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl leading-relaxed">
              {t("intro")}
            </p>
          </div>
        </section>

        <section className="bg-muted/40 border-b-2 border-border">
          <div className="mx-auto max-w-6xl px-6 py-20 grid gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.id}
                  className="grid md:grid-cols-[auto_1fr] gap-8 items-start bg-background border-2 border-border p-8"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="font-pixel text-xs text-accent crt-glow">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon className="size-24 text-foreground" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h2 className="font-display text-3xl md:text-5xl leading-tight">
                      {t(`${step.id}.title`)}
                    </h2>
                    <p className="text-base text-foreground/70 leading-relaxed">
                      {t(`${step.id}.body`)}
                    </p>
                    <p className="text-sm text-foreground/60 leading-relaxed">
                      {t(`${step.id}.detail`)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-b-2 border-border">
          <div className="mx-auto max-w-3xl px-6 py-20 flex flex-col gap-8">
            <div className="text-center">
              <p className="font-pixel text-[10px] uppercase text-accent crt-glow mb-3">
                {t("faqKicker")}
              </p>
              <h2 className="font-display text-4xl md:text-6xl leading-[0.9]">
                {t("faqTitle")}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQ_KEYS.map((key) => (
                <details
                  key={key}
                  className="group border-2 border-border bg-background p-5"
                >
                  <summary className="cursor-pointer flex items-center justify-between gap-4 font-display text-lg list-none">
                    {t(`faq.${key}.q`)}
                    <span
                      aria-hidden
                      className="font-pixel text-accent transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                    {t(`faq.${key}.a`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center gap-6">
            <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
              {t("ctaKicker")}
            </p>
            <h2 className="font-display text-4xl md:text-6xl leading-[0.9] max-w-3xl">
              {t("ctaTitle")}
            </h2>
            <button
              type="button"
              className="mt-4 h-12 px-6 font-mono text-sm uppercase tracking-widest bg-accent text-accent-foreground border-2 border-background hover:bg-background hover:text-foreground transition-colors"
            >
              {t("cta")}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

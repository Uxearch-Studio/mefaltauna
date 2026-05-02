import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  MarkAlbumIcon,
  MatchPeopleIcon,
  HandshakeIcon,
} from "@/components/vintage/Icons";

const STEPS = [
  { id: "mark", icon: MarkAlbumIcon },
  { id: "match", icon: MatchPeopleIcon },
  { id: "trade", icon: HandshakeIcon },
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
    <main>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20 flex flex-col items-center text-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {t("kicker")}
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] max-w-3xl">
            {t("title")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            {t("intro")}
          </p>
        </div>
      </section>

      <section className="bg-muted/40 border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.id}
                  className="surface-card p-7 flex flex-col items-center text-center gap-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="size-16 text-foreground" />
                  <h2 className="text-xl font-semibold tracking-tight">
                    {t(`${step.id}.title`)}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`${step.id}.body`)}
                  </p>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    {t(`${step.id}.detail`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 flex flex-col gap-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              {t("faqKicker")}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
              {t("faqTitle")}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {FAQ_KEYS.map((key) => (
              <details key={key} className="group surface-card p-5">
                <summary className="cursor-pointer flex items-center justify-between gap-4 list-none">
                  <span className="text-base font-medium">
                    {t(`faq.${key}.q`)}
                  </span>
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {t(`faq.${key}.a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {t("ctaKicker")}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[0.95] max-w-3xl">
            {t("ctaTitle")}
          </h2>
          <Link
            href="/sign-in"
            className="mt-4 h-12 px-6 inline-flex items-center justify-center rounded-full bg-highlight text-highlight-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("cta")}
          </Link>
        </div>
      </section>
    </main>
  );
}

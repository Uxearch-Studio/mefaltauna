import { setRequestLocale, getTranslations } from "next-intl/server";
import { Footer } from "@/components/vintage/Footer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home.hero");

  return (
    <>
      <main className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl flex flex-col gap-8 text-center">
          {/* Kicker — sticker-style chip */}
          <div className="self-center inline-flex items-center gap-2 px-3 py-1 bg-accent text-accent-foreground text-xs font-mono uppercase tracking-widest border-2 border-border">
            <span className="size-1.5 rounded-full bg-accent-foreground" />
            {t("kicker")}
          </div>

          {/* Headline — chunky sport-poster type */}
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl leading-[0.9]">
            {t("title")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-xl mx-auto">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button className="font-mono uppercase tracking-wider text-sm px-6 py-3 bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors border-sticker">
              {t("ctaPrimary")}
            </button>
            <button className="font-mono uppercase tracking-wider text-sm px-6 py-3 bg-transparent text-foreground border-2 border-border hover:bg-foreground hover:text-background transition-colors">
              {t("ctaSecondary")}
            </button>
          </div>

          {/* Status pill */}
          <div className="text-xs font-mono text-muted-foreground mt-12">
            v0 · fase 0 — bootstrap
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

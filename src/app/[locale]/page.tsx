import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { HowItWorks } from "@/components/vintage/HowItWorks";
import { Pricing } from "@/components/vintage/Pricing";
import { StickerPreview } from "@/components/vintage/StickerPreview";
import { FinalCta } from "@/components/vintage/FinalCta";

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
      <Header />
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 pt-24 pb-32 flex flex-col items-center text-center gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-accent-foreground text-[10px] font-mono uppercase tracking-widest border-2 border-border">
              <span className="size-1.5 rounded-full bg-accent-foreground" />
              {t("kicker")}
            </div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] leading-[0.85] max-w-5xl">
              {t("title")}
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button className="font-mono uppercase tracking-widest text-sm h-12 px-6 bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors border-sticker">
                {t("ctaPrimary")}
              </button>
              <a
                href="#how"
                className="font-mono uppercase tracking-widest text-sm h-12 px-6 bg-transparent text-foreground border-2 border-border hover:bg-foreground hover:text-background transition-colors inline-flex items-center justify-center"
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </div>
        </section>

        <HowItWorks />
        <Pricing />
        <StickerPreview />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

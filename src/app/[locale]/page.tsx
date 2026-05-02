import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { Pricing } from "@/components/vintage/Pricing";
import { StickerPreview } from "@/components/vintage/StickerPreview";
import { FinalCta } from "@/components/vintage/FinalCta";
import { Countdown } from "@/components/vintage/Countdown";
import { PixelBall, PixelPitch } from "@/components/vintage/PixelArt";
import { Link } from "@/i18n/navigation";

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
        {/* Hero — title-screen vibes */}
        <section className="relative overflow-hidden border-b-2 border-border scanlines">
          <PixelPitch
            aria-hidden
            className="absolute inset-0 w-full h-full text-foreground/[0.04] -z-10"
          />

          <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 flex flex-col items-center text-center gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-accent-foreground border-2 border-border">
              <PixelBall className="size-3" />
              <span className="font-pixel text-[10px] uppercase">
                {t("kicker")}
              </span>
            </div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-[9rem] leading-[0.85] max-w-5xl">
              {t("title")}
            </h1>

            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button className="font-pixel text-[10px] uppercase h-12 px-6 bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors border-sticker">
                {t("ctaPrimary")}
              </button>
              <Link
                href="/matches"
                className="font-pixel text-[10px] uppercase h-12 px-6 bg-transparent text-foreground border-2 border-border hover:bg-foreground hover:text-background transition-colors inline-flex items-center justify-center"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>

        {/* Countdown — protagonist */}
        <section className="border-b-2 border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <Countdown />
          </div>
        </section>

        <StickerPreview />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Pricing } from "@/components/vintage/Pricing";
import { StickerPreview } from "@/components/vintage/StickerPreview";
import { FinalCta } from "@/components/vintage/FinalCta";
import { Countdown } from "@/components/vintage/Countdown";
import { LiveTicker } from "@/components/vintage/LiveTicker";
import { PaniniPack } from "@/components/vintage/PaniniPack";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home.hero");

  const user = await getCurrentUser();
  if (user) redirect(`/${locale}/app/feed`);

  return (
    <main>
      {/* HERO — pack drop on a midnight stage with broadcast ticker */}
      <section className="relative overflow-hidden border-b border-border stage-pack paper-grain">
        <LiveTicker />

        <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
          {/* Left: copy */}
          <div className="flex flex-col gap-6 md:order-1 order-2">
            <p className="font-marker text-xl md:text-2xl text-[#f7c948] -rotate-2 self-start">
              {t("kicker")}
            </p>

            <h1
              className="font-display text-6xl md:text-7xl lg:text-8xl text-white leading-[0.9]"
              style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.3)" }}
            >
              {t("title")}
            </h1>

            <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-md">
              {t("subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/sign-in"
                className="h-13 px-6 inline-flex items-center justify-center rounded-full bg-[#f7c948] text-[#0a1426] font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#f7c948]/20"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href="/matches"
                className="h-13 px-6 inline-flex items-center justify-center rounded-full bg-transparent text-white border border-white/30 font-medium hover:bg-white/10 transition-colors"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          {/* Right: animated pack */}
          <div className="md:order-2 order-1 flex justify-center">
            <PaniniPack className="w-72 h-[340px] md:w-80 md:h-[380px]" />
          </div>
        </div>

        {/* Countdown — broadcast scoreboard */}
        <div className="relative border-t border-white/10 bg-black/30">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <Countdown />
          </div>
        </div>
      </section>

      <StickerPreview />
      <Pricing />
      <FinalCta />
    </main>
  );
}

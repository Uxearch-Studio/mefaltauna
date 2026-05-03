import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Pricing } from "@/components/vintage/Pricing";
import { StickerPreview } from "@/components/vintage/StickerPreview";
import { FinalCta } from "@/components/vintage/FinalCta";
import { Countdown } from "@/components/vintage/Countdown";
import { MeshGradient } from "@/components/vintage/MeshGradient";
import { FloatingDeck } from "@/components/vintage/FloatingDeck";
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
      {/* HERO — purple stage with mesh gradient + grain + floating cards */}
      <section className="relative overflow-hidden stage-purple grain min-h-[78vh] flex items-center">
        <MeshGradient />
        <FloatingDeck />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 flex flex-col items-center text-center gap-6 w-full z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-xs font-semibold uppercase tracking-widest">
            <span className="size-1.5 rounded-full bg-[var(--stage-yellow)]" />
            {t("kicker")}
          </span>

          <h1
            className="font-display whitespace-nowrap leading-none"
            style={{
              fontSize: "clamp(2.25rem, 9vw, 6rem)",
              textShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {t("title")}
          </h1>

          <p className="text-base md:text-lg text-white/75 max-w-md leading-relaxed">
            {t("subtitle")}
          </p>

          <div className="flex flex-row gap-3 mt-2">
            <Link
              href="/sign-in"
              className="h-12 px-6 inline-flex items-center justify-center rounded-full bg-[var(--stage-yellow)] text-[var(--stage-bg)] text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[var(--stage-yellow)]/20 whitespace-nowrap"
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/matches"
              className="h-12 px-6 inline-flex items-center justify-center rounded-full bg-white/10 text-white border border-white/20 backdrop-blur text-sm font-medium hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      {/* Countdown — yellow stage */}
      <section
        className="relative border-y border-border overflow-hidden grain"
        style={{
          background: "var(--highlight)",
          color: "var(--highlight-foreground)",
        }}
      >
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20 z-10">
          <Countdown variant="onYellow" />
        </div>
      </section>

      <StickerPreview />
      <Pricing />
      <FinalCta />
    </main>
  );
}

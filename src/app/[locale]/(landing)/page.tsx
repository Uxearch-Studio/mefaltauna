import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Pricing } from "@/components/vintage/Pricing";
import { StickerPreview } from "@/components/vintage/StickerPreview";
import { FinalCta } from "@/components/vintage/FinalCta";
import { Countdown } from "@/components/vintage/Countdown";
import { PitchLines } from "@/components/vintage/PitchLines";
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

  // Logged-in users land in the app instead of the marketing home.
  const user = await getCurrentUser();
  if (user) redirect(`/${locale}/app/feed`);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <PitchLines
          aria-hidden
          className="absolute inset-0 w-full h-full -z-10"
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-32 flex flex-col items-center text-center gap-7">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wide">
            <span className="size-1.5 rounded-full bg-accent" />
            {t("kicker")}
          </span>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] max-w-4xl">
            {t("title")}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/sign-in"
              className="h-12 px-6 inline-flex items-center justify-center rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="/matches"
              className="h-12 px-6 inline-flex items-center justify-center rounded-full bg-transparent text-foreground border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Countdown />
        </div>
      </section>

      <StickerPreview />
      <Pricing />
      <FinalCta />
    </main>
  );
}

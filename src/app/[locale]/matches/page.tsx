import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { MatchFilters } from "@/components/vintage/MatchFilters";
import { PixelStadium } from "@/components/vintage/PixelArt";
import { MATCHES } from "@/lib/matches";

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("matches");

  return (
    <>
      <Header />
      <main>
        <section className="border-b-2 border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="flex flex-col gap-4">
              <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
                {t("kicker")}
              </p>
              <h1 className="font-display text-5xl md:text-7xl leading-[0.9]">
                {t("title")}
              </h1>
              <p className="text-base text-foreground/70 max-w-md leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
            <PixelStadium className="size-32 md:size-48 text-foreground" />
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 p-3 border-2 border-dashed border-accent bg-accent/5 flex items-start gap-3">
            <span className="font-pixel text-[10px] text-accent uppercase">
              {t("noticeTitle")}
            </span>
            <p className="font-mono text-xs text-foreground/70 leading-relaxed">
              {t("notice")}
            </p>
          </div>

          <MatchFilters matches={MATCHES} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}

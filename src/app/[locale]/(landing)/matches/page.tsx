import { setRequestLocale, getTranslations } from "next-intl/server";
import { MatchFilters } from "@/components/vintage/MatchFilters";
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
    <main>
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {t("kicker")}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[0.95] max-w-2xl">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 surface-card p-4 flex items-start gap-3 border border-accent/40 bg-accent/5">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent shrink-0 mt-0.5">
            {t("noticeTitle")}
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("notice")}
          </p>
        </div>

        <MatchFilters matches={MATCHES} locale={locale} />
      </div>
    </main>
  );
}

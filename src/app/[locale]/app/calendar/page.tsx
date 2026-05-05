import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { MatchFilters } from "@/components/vintage/MatchFilters";
import { requireUser } from "@/lib/auth";
import { MATCHES } from "@/lib/matches";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("matches");

  await requireUser({ locale, next: `/${locale}/app/calendar` });

  return (
    <>
      <AppTopBar title={t("appTitle")} />
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <MatchFilters matches={MATCHES} locale={locale} compact />
      </div>
    </>
  );
}

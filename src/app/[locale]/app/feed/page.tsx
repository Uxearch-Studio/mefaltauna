import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { LiveFeed } from "@/components/vintage/LiveFeed";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchActiveListings, fetchCatalog } from "@/lib/db";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feed");

  const user = await requireUser({ locale, next: `/${locale}/app/feed` });
  const supabase = await createSupabaseServerClient();
  const [listings, catalog] = await Promise.all([
    supabase ? fetchActiveListings(supabase, 50) : Promise.resolve([]),
    supabase ? fetchCatalog(supabase) : Promise.resolve([]),
  ]);

  const lightCatalog = catalog.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    team_code: s.team_code,
    type: s.type,
    number: s.number,
  }));

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <LiveFeed
          initial={listings}
          catalog={lightCatalog}
          locale={locale}
          currentUserId={user.id}
        />
      </div>
    </>
  );
}

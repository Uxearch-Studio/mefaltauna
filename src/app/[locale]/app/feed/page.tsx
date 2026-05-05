import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { LiveFeed } from "@/components/vintage/LiveFeed";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchActiveListings } from "@/lib/db";

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
  const listings = supabase
    ? await fetchActiveListings(supabase, 50)
    : [];

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        {/* catalog intentionally not passed: LiveFeed derives the
            team filter dropdown from the listings we already have, so
            the RSC payload stays tight. The full 1008-row catalog
            would otherwise ship on every navigation. */}
        <LiveFeed
          initial={listings}
          catalog={[]}
          locale={locale}
          currentUserId={user.id}
        />
      </div>
    </>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { AlbumProgress } from "@/components/vintage/AlbumProgress";
import { AlbumPaywall } from "@/components/vintage/AlbumPaywall";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCatalog, fetchInventory } from "@/lib/db";
import { fetchIsMember } from "@/lib/membership";
import { AlbumGrid } from "./AlbumGrid";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("album");

  const user = await requireUser({ locale, next: `/${locale}/app/album` });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  // The digital album is part of the paid pass. Non-members see the
  // marketing pitch and a CTA to /app/membership instead of the grid.
  const isMember = await fetchIsMember(supabase, user.id);
  if (!isMember) {
    return (
      <>
        <AppTopBar title={t("title")} />
        <div className="mx-auto max-w-md px-4 pt-6 pb-12">
          <AlbumPaywall />
        </div>
      </>
    );
  }

  const [catalog, inventory] = await Promise.all([
    fetchCatalog(supabase),
    fetchInventory(supabase, user.id),
  ]);

  const inventoryMap: Record<number, number> = {};
  for (const row of inventory) inventoryMap[row.sticker_id] = row.count;

  const owned = inventory.filter((r) => r.count >= 1).length;
  const total = catalog.length;

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <AlbumProgress owned={owned} total={total} />
        <AlbumGrid
          catalog={catalog}
          initialInventory={inventoryMap}
          locale={locale}
        />
      </div>
    </>
  );
}

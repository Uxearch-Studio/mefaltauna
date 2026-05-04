import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { AlbumProgress } from "@/components/vintage/AlbumProgress";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCatalog, fetchInventory } from "@/lib/db";
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

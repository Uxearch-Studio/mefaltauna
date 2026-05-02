import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
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

  const user = await requireUser({ locale, next: `/${locale}/album` });
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-20">
          <p className="font-mono text-sm">Supabase no configurado.</p>
        </main>
        <Footer />
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
      <Header />
      <main>
        <section className="border-b-2 border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="font-pixel text-[10px] uppercase text-accent crt-glow">
                {t("kicker")}
              </p>
              <h1 className="font-display text-4xl md:text-6xl leading-[0.9]">
                {t("title")}
              </h1>
              <p className="text-sm text-foreground/70 max-w-xl leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
            <AlbumProgress owned={owned} total={total} />
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-6 py-12">
            <AlbumGrid
              catalog={catalog}
              initialInventory={inventoryMap}
              locale={locale}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/vintage/Header";
import { Footer } from "@/components/vintage/Footer";
import { LiveFeed } from "@/components/vintage/LiveFeed";
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

  const supabase = await createSupabaseServerClient();
  const [listings, catalog] = await Promise.all([
    supabase ? fetchActiveListings(supabase, 30) : Promise.resolve([]),
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
      <Header />
      <main>
        <section className="border-b-2 border-border bg-muted/40">
          <div className="mx-auto max-w-3xl px-6 py-12 flex flex-col gap-3">
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
        </section>

        <section>
          <div className="mx-auto max-w-3xl px-6 py-12">
            <LiveFeed initial={listings} catalog={lightCatalog} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

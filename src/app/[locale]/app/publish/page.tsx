import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCatalog, fetchInventory, fetchOwnContact } from "@/lib/db";
import { PublishFlow } from "./PublishFlow";
import { ProfileCompletionForm } from "./ProfileCompletionForm";

export default async function PublishPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("publish");

  const user = await requireUser({ locale, next: `/${locale}/app/publish` });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const contact = await fetchOwnContact(supabase, user.id);

  // Block publishing until the user has completed their contact info.
  if (!contact) {
    return (
      <>
        <AppTopBar title={t("title")} />
        <div className="mx-auto max-w-md px-4 py-6 flex flex-col gap-4">
          <ProfileCompletionForm locale={locale} />
        </div>
      </>
    );
  }

  const [catalog, inventory] = await Promise.all([
    fetchCatalog(supabase),
    fetchInventory(supabase, user.id),
  ]);

  const dupIds = new Set(inventory.filter((r) => r.count >= 2).map((r) => r.sticker_id));
  const duplicates = catalog.filter((s) => dupIds.has(s.id));
  const teamCodes = [...new Set(catalog.map((s) => s.team_code).filter(Boolean) as string[])].sort();

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <PublishFlow
          duplicates={duplicates}
          catalog={catalog}
          teamCodes={teamCodes}
          locale={locale}
        />
      </div>
    </>
  );
}

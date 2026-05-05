import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { LocaleSwitcher } from "@/components/vintage/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/vintage/ThemeSwitcher";
import { requireUser, emailToPhone } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOwnContact } from "@/lib/db";
import { fetchIsMember } from "@/lib/membership";
import type { FifaProfileStats } from "@/components/vintage/FifaProfileCard";
import { ProfileEditor } from "./ProfileEditor";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  const user = await requireUser({ locale, next: `/${locale}/app/profile` });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [
    profileRes,
    contact,
    inventoryRes,
    catalogRes,
    listingsRes,
    soldRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url, reputation, city")
      .eq("id", user.id)
      .maybeSingle(),
    fetchOwnContact(supabase, user.id),
    supabase
      .from("inventory")
      .select("count")
      .eq("user_id", user.id),
    supabase
      .from("sticker_catalog")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "sold"),
  ]);

  const profile = profileRes.data as
    | {
        username: string | null;
        avatar_url: string | null;
        reputation: number | null;
        city: string | null;
      }
    | null;

  const inventoryRows = (inventoryRes.data ?? []) as Array<{ count: number }>;
  const ownedCount = inventoryRows.filter((r) => r.count >= 1).length;
  const duplicatesCount = inventoryRows.filter((r) => r.count >= 2).length;

  const stats: FifaProfileStats = {
    ownedCount,
    totalCount: catalogRes.count ?? 0,
    listingsCount: listingsRes.count ?? 0,
    tradesCount: soldRes.count ?? 0,
    reputation: profile?.reputation ?? 0,
    duplicatesCount,
  };

  const isMember = await fetchIsMember(supabase, user.id);

  const phoneFromEmail = emailToPhone(user.email);
  const initial = {
    username: profile?.username ?? null,
    avatar_url: profile?.avatar_url ?? null,
    first_name: contact?.first_name ?? "",
    last_name: contact?.last_name ?? "",
    national_id: contact?.national_id ?? "",
    whatsapp: contact?.whatsapp ?? phoneFromEmail ?? "",
    city: contact?.city ?? profile?.city ?? "",
    email: phoneFromEmail ? null : (user.email ?? null),
  };

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-md px-4 py-6 flex flex-col gap-5">
        <ProfileEditor
          locale={locale}
          initial={initial}
          stats={stats}
          isMember={isMember}
        />

        <section className="surface-card divide-y divide-border">
          <Row label={t("language")}>
            <LocaleSwitcher />
          </Row>
          <Row label={t("appearance")}>
            <ThemeSwitcher />
          </Row>
        </section>

        <form method="post" action={`/${locale}/sign-out`}>
          <button
            type="submit"
            className="w-full h-12 rounded-full text-sm font-medium text-red-600 hover:bg-red-600/10 transition-colors"
          >
            {t("signOut")}
          </button>
        </form>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

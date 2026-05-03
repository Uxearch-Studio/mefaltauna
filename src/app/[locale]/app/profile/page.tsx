import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { LocaleSwitcher } from "@/components/vintage/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/vintage/ThemeSwitcher";
import { requireUser, emailToPhone } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOwnContact } from "@/lib/db";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, reputation")
    .eq("id", user.id)
    .maybeSingle();
  const contact = await fetchOwnContact(supabase, user.id);

  // Derive a friendly email/whatsapp display for the current account.
  const phoneFromEmail = emailToPhone(user.email);

  const initial = {
    username: (profile?.username as string | null) ?? null,
    avatar_url: (profile?.avatar_url as string | null) ?? null,
    first_name: contact?.first_name ?? "",
    last_name: contact?.last_name ?? "",
    national_id: contact?.national_id ?? "",
    whatsapp: contact?.whatsapp ?? phoneFromEmail ?? "",
    city: contact?.city ?? "",
    email: phoneFromEmail ? null : (user.email ?? null),
  };

  // Reputation surfaced as a star score.
  const reputation = (profile?.reputation as number | null) ?? 0;

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-md px-4 py-6 flex flex-col gap-6">
        {reputation > 0 && (
          <div className="surface-card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("reputation")}
              </p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {reputation}
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-highlight/15 text-highlight font-semibold uppercase tracking-wide">
              {t("trustedSeller")}
            </span>
          </div>
        )}

        <ProfileEditor locale={locale} initial={initial} />

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
            className="w-full h-12 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
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

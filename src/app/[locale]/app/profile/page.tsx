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

  const reputation = (profile?.reputation as number | null) ?? 0;
  const displayName =
    [initial.first_name, initial.last_name].filter(Boolean).join(" ") ||
    initial.username ||
    t("noUsername");
  const initialChar = displayName.charAt(0).toUpperCase();

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-md px-4 py-6 flex flex-col gap-5">
        {/* Hero card — avatar + name + reputation */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-background to-highlight/10 p-6 flex items-center gap-4">
          {initial.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.avatar_url}
              alt=""
              className="size-16 rounded-full object-cover ring-2 ring-background shadow-md"
            />
          ) : (
            <div className="size-16 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold ring-2 ring-background shadow-md">
              {initialChar}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <p className="text-lg font-semibold tracking-tight truncate">
              {displayName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-highlight/20 text-highlight text-[10px] font-semibold uppercase tracking-wide">
                ★ {reputation}
              </span>
              {reputation > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {t("trustedSeller")}
                </span>
              )}
            </div>
          </div>
        </section>

        <ProfileEditor locale={locale} initial={initial} />

        {/* Settings */}
        <section className="surface-card divide-y divide-border">
          <Row label={t("language")}>
            <LocaleSwitcher />
          </Row>
          <Row label={t("appearance")}>
            <ThemeSwitcher />
          </Row>
        </section>

        {/* Sign out — destructive */}
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

import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { LocaleSwitcher } from "@/components/vintage/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/vintage/ThemeSwitcher";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  const user = await requireUser({ locale, next: `/${locale}/app/profile` });

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-6">
        <section className="surface-card p-5 flex items-center gap-4">
          <div className="size-14 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold">
            {(user.username ?? user.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-base font-semibold truncate">
              {user.username ?? t("noUsername")}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </section>

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

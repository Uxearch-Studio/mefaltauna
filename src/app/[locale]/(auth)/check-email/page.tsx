import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CheckEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("checkEmail");

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md surface-card p-8 flex flex-col items-center gap-5 text-center">
        <div className="size-12 rounded-full bg-accent/15 text-accent flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t("kicker")}
        </p>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-[0.95]">
          {t("title")}
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("body")}
        </p>

        {email && (
          <p className="text-sm break-all px-3 py-2 rounded-lg bg-muted w-full">
            {email}
          </p>
        )}

        <p className="text-xs text-muted-foreground">{t("hint")}</p>

        <Link
          href="/sign-in"
          className="text-xs text-foreground hover:text-accent transition-colors"
        >
          {t("back")}
        </Link>
      </div>
    </section>
  );
}

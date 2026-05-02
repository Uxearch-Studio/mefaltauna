import { setRequestLocale, getTranslations } from "next-intl/server";
import { SignInForm } from "./SignInForm";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("signIn");

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md surface-card p-8 flex flex-col gap-7">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            {t("kicker")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[0.95]">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <SignInForm locale={locale} next={next} initialError={error} />

        <p className="text-xs text-muted-foreground text-center">
          {t("disclaimer")}
        </p>
      </div>
    </section>
  );
}

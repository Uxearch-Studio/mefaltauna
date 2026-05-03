import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RecoverPinForm } from "./RecoverPinForm";

export default async function RecoverPinPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("recoverPin");

  return (
    <main className="min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-sm px-6 py-12 flex-1 flex flex-col justify-center gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-display leading-tight text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </header>

        <RecoverPinForm locale={locale} />

        <Link
          href="/sign-in"
          className="self-center text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          {t("backToSignIn")}
        </Link>
      </div>
    </main>
  );
}

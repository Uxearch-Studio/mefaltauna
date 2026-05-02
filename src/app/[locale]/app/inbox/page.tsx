import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { InboxIcon } from "@/components/vintage/Icons";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inbox");

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-12 flex flex-col items-center gap-4 text-center">
        <div className="size-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <InboxIcon className="size-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{t("emptyTitle")}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{t("emptyBody")}</p>
      </div>
    </>
  );
}

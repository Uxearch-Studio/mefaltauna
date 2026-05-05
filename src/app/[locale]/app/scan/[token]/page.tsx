import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { confirmTradeAction } from "@/app/[locale]/app/inbox/trade-actions";

/**
 * QR landing route. The seller's QR encodes
 *   https://<host>/<locale>/app/scan/<token>
 * so that external scanner apps (Google Lens, the system camera,
 * third-party QR readers) show a tappable link that drops the buyer
 * straight here. We require auth, run confirm_trade with the token,
 * and bounce to the conversation with `?rate=1` so the rating modal
 * opens immediately. Errors render a friendly bounce-back card.
 */
export default async function ScanPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("trade");

  await requireUser({
    locale,
    next: `/${locale}/app/scan/${token}`,
  });

  const res = await confirmTradeAction(token);
  if (res.ok && res.trade) {
    redirect(`/${locale}/app/inbox/${res.trade.conversationId}?rate=1`);
  }

  const errorKey = res.error ?? "db_error";

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center px-6 py-10 text-center gap-4">
      <div className="size-16 rounded-full bg-red-500/15 text-red-600 flex items-center justify-center text-3xl">
        ⚠
      </div>
      <h1 className="font-display text-2xl leading-tight">
        {t("scanFailedTitle")}
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {t(`errors.${errorKey}`)}
      </p>
      <Link
        href="/app/inbox"
        className="mt-4 inline-flex items-center justify-center h-11 px-6 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {t("scanFailedBackToInbox")}
      </Link>
    </div>
  );
}

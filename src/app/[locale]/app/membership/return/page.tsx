import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchIsMember } from "@/lib/membership";

/**
 * Wompi redirects here after the user finishes Web Checkout. The
 * actual status update comes from the webhook, which usually lands
 * before the redirect — but if it hasn't, we show a "verifying" UI
 * and let the user wait/refresh. The return URL contains query
 * params (transactionId, env, status) we don't strictly need because
 * the source of truth is the webhook.
 */
export default async function MembershipReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    id?: string;
    env?: string;
    status?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("membership.return");

  const user = await requireUser({
    locale,
    next: `/${locale}/app/membership/return`,
  });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const isMember = await fetchIsMember(supabase, user.id);

  // Pull the most recent payment row so we can show the user what
  // actually happened, even if the webhook is still in-flight.
  const { data: payment } = await supabase
    .from("payments")
    .select("status, amount_cop, wompi_reference, wompi_transaction_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const status = (payment?.status ?? sp.status ?? "PENDING").toUpperCase();
  const approved = isMember || status === "APPROVED";
  const declined = status === "DECLINED" || status === "ERROR" || status === "VOIDED";

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-md px-4 py-10 flex flex-col gap-6 items-center text-center">
        {approved ? (
          <>
            <div className="size-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.4)]">
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h1 className="font-display text-3xl leading-tight">{t("approvedTitle")}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("approvedBody")}
            </p>
            <Link
              href="/app/feed"
              className="h-12 px-6 rounded-full bg-foreground text-background text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {t("openFeed")}
            </Link>
          </>
        ) : declined ? (
          <>
            <div className="size-20 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </div>
            <h1 className="font-display text-3xl leading-tight">{t("declinedTitle")}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("declinedBody")}
            </p>
            <Link
              href="/app/membership"
              className="h-12 px-6 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {t("retry")}
            </Link>
          </>
        ) : (
          <>
            <div className="size-20 rounded-full bg-[var(--stage-yellow)]/15 text-[var(--stage-yellow)] flex items-center justify-center">
              <span className="size-10 rounded-full border-4 border-[var(--stage-yellow)] border-t-transparent animate-spin" />
            </div>
            <h1 className="font-display text-3xl leading-tight">{t("pendingTitle")}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("pendingBody")}
            </p>
            <Link
              href="/app/membership/return"
              className="h-12 px-6 rounded-full border border-border text-sm font-medium flex items-center justify-center hover:bg-muted transition-colors"
            >
              {t("refresh")}
            </Link>
          </>
        )}

        {payment?.wompi_transaction_id && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
            {t("transactionLabel")}: {payment.wompi_transaction_id}
          </p>
        )}
      </div>
    </>
  );
}

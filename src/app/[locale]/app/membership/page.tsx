import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchIsMember } from "@/lib/membership";
import { getWompiConfig } from "@/lib/wompi";
import { CheckoutForm } from "./CheckoutForm";

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("membership");

  const user = await requireUser({
    locale,
    next: `/${locale}/app/membership`,
  });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const isMember = await fetchIsMember(supabase, user.id);
  if (isMember) {
    // Already paid — kick them to the feed.
    redirect(`/${locale}/app/feed`);
  }

  const wompiReady = Boolean(getWompiConfig());

  const benefits: string[] = [
    t("benefitChat"),
    t("benefitPublish"),
    t("benefitNoCommission"),
    t("benefitFeed"),
    t("benefitProgress"),
    t("benefitFind"),
  ];

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-md px-4 py-6 flex flex-col gap-6">
        {/* Premium card preview */}
        <article className="relative overflow-hidden rounded-3xl bg-[#0e0524] text-white shadow-2xl shadow-black/30">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(140% 90% at 50% -10%, rgba(255,215,122,0.30) 0%, rgba(255,199,44,0.15) 25%, transparent 55%), linear-gradient(160deg, rgba(255,199,44,0.05) 0%, transparent 40%, rgba(255,199,44,0.10) 90%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-2 rounded-[26px] pointer-events-none"
            style={{
              border: "1px solid rgba(255,215,122,0.55)",
              boxShadow:
                "inset 0 0 0 2px rgba(255,199,44,0.10), 0 0 24px rgba(255,199,44,0.15)",
            }}
          />

          <div className="relative px-6 pt-6 pb-7 flex flex-col gap-5">
            <div className="flex items-baseline gap-3">
              <span
                className="font-display lowercase leading-none text-[var(--stage-yellow)]"
                style={{
                  fontSize: "clamp(1.5rem, 6vw, 2rem)",
                  textShadow: "2px 2px 0 rgba(0,0,0,0.45)",
                }}
              >
                mefaltauna
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/85">
              {t("kicker")}
            </p>
            <p className="text-sm text-white/70 leading-snug">
              {t("subtitle")}
            </p>

            <ul className="flex flex-col gap-2 mt-1">
              {benefits.map((label, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 size-5 rounded-full bg-emerald-400 text-[#0a2a18] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.45)]"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8 L7 12 L13 4" />
                    </svg>
                  </span>
                  <span className="text-sm leading-snug text-white/90">
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-baseline gap-2 pt-2">
              <span
                className="font-display tabular-nums leading-none text-[var(--stage-yellow)]"
                style={{
                  fontSize: "clamp(2rem, 9vw, 3rem)",
                  textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                }}
              >
                $9.900
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                {t("oneTimePay")}
              </span>
            </div>

            <CheckoutForm locale={locale} disabled={!wompiReady} />
          </div>
        </article>

        <p className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed">
          {t("disclaimer")}
        </p>
      </div>
    </>
  );
}

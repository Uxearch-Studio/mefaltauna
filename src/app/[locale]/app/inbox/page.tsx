import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { InboxIcon } from "@/components/vintage/Icons";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchUserConversations } from "@/lib/db";
import { fetchIsMember } from "@/lib/membership";
import { InboxRow } from "./InboxRow";

const TIME = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
function relTime(iso: string) {
  const diffSec = Math.round((Date.parse(iso) - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return TIME.format(diffSec, "second");
  if (abs < 3600) return TIME.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return TIME.format(Math.round(diffSec / 3600), "hour");
  return TIME.format(Math.round(diffSec / 86400), "day");
}

export default async function InboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inbox");

  const user = await requireUser({ locale, next: `/${locale}/app/inbox` });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const isMember = await fetchIsMember(supabase, user.id);
  if (!isMember) {
    return (
      <>
        <AppTopBar title={t("title")} />
        <div className="mx-auto max-w-md px-4 py-12 flex flex-col items-center text-center gap-5">
          <div className="size-16 rounded-full bg-[var(--stage-yellow)]/15 text-[var(--stage-yellow)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("paywallTitle")}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {t("paywallBody")}
          </p>
          <Link
            href="/app/membership"
            className="h-12 px-6 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-sm font-bold uppercase tracking-[0.2em] inline-flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_8px_20px_rgba(255,199,44,0.35)]"
          >
            {t("paywallCta")}
          </Link>
        </div>
      </>
    );
  }

  const conversations = await fetchUserConversations(supabase, user.id);

  return (
    <>
      <AppTopBar title={t("title")} />
      <div className="mx-auto max-w-3xl px-4 py-6">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-4 py-16">
            <div className="size-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <InboxIcon className="size-6" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              {t("emptyTitle")}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("emptyBody")}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {conversations.map((c) => {
              const label =
                c.other_display_name ??
                c.other_username ??
                t("unknownUser");
              return (
                <InboxRow
                  key={c.id}
                  id={c.id}
                  label={label}
                  initial={label.charAt(0).toUpperCase()}
                  avatarUrl={c.other_avatar_url}
                  lastMessageBody={c.last_message_body}
                  lastMessageAt={c.last_message_at}
                  stickerCode={c.listing_sticker_code}
                  unreadCount={c.unread_count}
                  relativeTime={relTime(c.last_message_at)}
                />
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

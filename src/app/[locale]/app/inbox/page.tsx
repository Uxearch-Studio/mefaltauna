import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { InboxIcon } from "@/components/vintage/Icons";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchUserConversations } from "@/lib/db";
import { Link } from "@/i18n/navigation";

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
              const initial = label.charAt(0).toUpperCase();
              const unread = c.unread_count > 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/app/inbox/${c.id}`}
                    className={`flex items-center gap-3 surface-card p-4 hover:bg-muted/40 transition-colors ${
                      unread ? "ring-2 ring-accent/40" : ""
                    }`}
                  >
                    {c.other_avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.other_avatar_url}
                        alt=""
                        className="size-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-12 rounded-full bg-foreground text-background flex items-center justify-center text-base font-semibold shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={`truncate ${
                            unread ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {label}
                        </p>
                        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                          {relTime(c.last_message_at)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          unread
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {c.last_message_body ?? t("noMessagesYet")}
                      </p>
                      {c.listing_sticker_code && (
                        <p className="text-[10px] uppercase tracking-wide text-accent mt-0.5">
                          {t("aboutSticker", { code: c.listing_sticker_code })}
                        </p>
                      )}
                    </div>
                    {unread && (
                      <span className="size-6 shrink-0 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center tabular-nums">
                        {c.unread_count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

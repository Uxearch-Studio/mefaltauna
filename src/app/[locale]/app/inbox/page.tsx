import { setRequestLocale, getTranslations } from "next-intl/server";
import { AppTopBar } from "@/components/vintage/AppTopBar";
import { InboxIcon } from "@/components/vintage/Icons";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchUserConversations } from "@/lib/db";
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

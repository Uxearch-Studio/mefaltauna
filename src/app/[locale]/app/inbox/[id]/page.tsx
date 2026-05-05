import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchConversation,
  fetchSellerActiveListings,
  fetchTradeItems,
} from "@/lib/db";
import { ChatRoom } from "./ChatRoom";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("inbox");

  const user = await requireUser({ locale, next: `/${locale}/app/inbox/${id}` });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const conv = await fetchConversation(supabase, id, user.id);
  if (!conv) notFound();

  // Multi-listing trade flow: the seller picks which of their active
  // listings to bundle into a single trade. We always fetch the
  // seller's whole active inventory so the picker is fully populated,
  // and the items currently bundled into any pending/completed trade
  // so the chat can render "este trato cubre estas N láminas".
  const [sellerActiveListings, tradeItems] = await Promise.all([
    conv.sellerId
      ? fetchSellerActiveListings(supabase, conv.sellerId)
      : Promise.resolve([]),
    conv.activeTrade
      ? fetchTradeItems(supabase, conv.activeTrade.id)
      : Promise.resolve([]),
  ]);

  // Username (the "Nombre público" input) is the canonical public
  // name. display_name (auto-generated from first_name + last
  // initial) is just a fallback for users who haven't picked a
  // username yet.
  const otherLabel =
    conv.otherUser?.username ??
    conv.otherUser?.display_name ??
    t("unknownUser");
  const initial = otherLabel.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center gap-3">
          <Link
            href="/app/inbox"
            className="size-9 -ml-2 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label={t("back")}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          {conv.otherUser?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={conv.otherUser.avatar_url}
              alt=""
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="size-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium truncate">{otherLabel}</p>
            {conv.listingStickerCode && (
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">
                {t("aboutSticker", { code: conv.listingStickerCode })}
              </p>
            )}
          </div>
        </div>
      </header>

      <ChatRoom
        conversationId={conv.conversation.id}
        currentUserId={user.id}
        otherUserId={conv.otherUser?.id ?? null}
        otherUsername={otherLabel}
        initialMessages={conv.messages}
        sellerId={conv.sellerId}
        listingId={conv.conversation.listing_id}
        listingPreview={conv.listingPreview}
        initialTrade={
          conv.activeTrade
            ? {
                id: conv.activeTrade.id,
                status: conv.activeTrade.status,
                qrToken: conv.activeTrade.qr_token,
                ratedByMe: conv.activeTrade.rated_by_me,
              }
            : null
        }
        sellerActiveListings={sellerActiveListings}
        tradeItems={tradeItems}
        initialLastReadAtOther={conv.lastReadAtOther}
      />
    </>
  );
}

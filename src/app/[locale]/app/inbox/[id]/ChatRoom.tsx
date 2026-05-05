"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { sendMessageAction, markConversationReadAction } from "../actions";
import { TradeControls } from "@/components/vintage/TradeControls";
import type {
  ConversationListingPreview,
  Message,
  TradeListingItem,
} from "@/lib/db";

const COP = new Intl.NumberFormat("es-CO");

type Props = {
  conversationId: string;
  currentUserId: string;
  otherUserId: string | null;
  otherUsername: string | null;
  initialMessages: Message[];
  sellerId: string | null;
  listingId: string | null;
  listingPreview: ConversationListingPreview | null;
  initialTrade: {
    id: string;
    status: "pending" | "completed";
    qrToken: string | null;
    ratedByMe: boolean;
  } | null;
  /** All of the seller's currently active listings — feeds the
   *  multi-select picker the seller uses when activating a trade. */
  sellerActiveListings: TradeListingItem[];
  /** Listings already bundled into the active trade, when one exists.
   *  Empty otherwise. */
  tradeItems: TradeListingItem[];
  initialLastReadAtOther: string | null;
};

export function ChatRoom({
  conversationId,
  currentUserId,
  otherUserId,
  otherUsername,
  initialMessages,
  sellerId,
  listingId,
  listingPreview,
  initialTrade,
  sellerActiveListings,
  tradeItems,
  initialLastReadAtOther,
}: Props) {
  const t = useTranslations("inbox");
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [lastReadAtOther, setLastReadAtOther] = useState<string | null>(
    initialLastReadAtOther,
  );
  const [otherOnline, setOtherOnline] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  // Mark read on mount — client-side fire-and-forget so the server
  // render doesn't have to invoke the action (which crashed in 16).
  // After the server-side revalidate fires, refresh the router so the
  // bottom-nav badge and the inbox list pick up the new last_read_at
  // without waiting for a manual page reload.
  useEffect(() => {
    markConversationReadAction(conversationId)
      .then(() => router.refresh())
      .catch(() => {});
  }, [conversationId, router]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const incoming: Message = {
            id: row.id as string,
            conversation_id: row.conversation_id as string,
            sender_id: row.sender_id as string,
            body: row.body as string,
            created_at: row.created_at as string,
          };
          setMessages((prev) => {
            // Already in the list by real id — server insert + realtime
            // both arrived. Nothing to do.
            if (prev.some((m) => m.id === incoming.id)) return prev;

            // Realtime echo of a message WE just sent: replace the
            // optimistic temp entry instead of appending a duplicate.
            // Match on sender + body and only swap the most recent
            // pending temp so we don't cross-collide on identical text.
            if (incoming.sender_id === currentUserId) {
              for (let i = prev.length - 1; i >= 0; i--) {
                const m = prev[i];
                if (
                  m.id.startsWith("temp-") &&
                  m.sender_id === currentUserId &&
                  m.body === incoming.body
                ) {
                  const next = prev.slice();
                  next[i] = incoming;
                  return next;
                }
              }
            }
            return [...prev, incoming];
          });

          // The user is actively viewing this thread — re-mark as read
          // the moment a message from the other party lands so the
          // unread chip / bottom-nav badge don't tick back up to 1.
          if (incoming.sender_id !== currentUserId) {
            markConversationReadAction(conversationId)
              .then(() => router.refresh())
              .catch(() => {});
          }
        },
      )
      .subscribe();

    // Listen for UPDATE on the conversation row so we can react when
    // the other party marks our messages as read (their last_read_at
    // bumps). This is what powers the ✓✓ "leído" indicator on the
    // sender's side without needing to poll.
    const metaChannel = supabase
      .channel(`conv-meta:${conversationId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const isA = row.user_a === currentUserId;
          const newLastRead = (
            isA ? row.last_read_at_b : row.last_read_at_a
          ) as string | null;
          if (newLastRead) setLastReadAtOther(newLastRead);
        },
      )
      .subscribe();

    // Presence channel — each side tracks itself, both watch sync
    // events to know whether the other party is currently in the
    // chat. Powers the "En línea" / "Ausente" indicator below the
    // chat header.
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
    if (otherUserId) {
      presenceChannel = supabase.channel(`presence:conv:${conversationId}`, {
        config: { presence: { key: currentUserId } },
      });
      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel!.presenceState();
          setOtherOnline(Object.keys(state).includes(otherUserId));
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel!.track({ user_id: currentUserId });
          }
        });
    }

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(metaChannel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, currentUserId, otherUserId, router]);

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = body.trim();
    if (!value || pending) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: value,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    inputRef.current?.focus();
    setError(null);

    startTransition(async () => {
      const res = await sendMessageAction(conversationId, value);
      if (res.error) {
        // Roll back the optimistic insert — the message was never
        // accepted by the server.
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        if (res.error === "pii_phone" || res.error === "pii_email") {
          // Render the bilingual "Aviso N de 3" + the kicker that
          // explains why the message was blocked.
          setError(
            t("piiRejected", {
              kind: t(
                res.error === "pii_phone"
                  ? "piiKindPhone"
                  : "piiKindEmail",
              ),
              n: res.strikes ?? 1,
            }),
          );
          setBody("");
          if (res.blocked) setBlocked(true);
        } else if (res.error === "blocked") {
          setError(t("blockedNotice"));
          setBlocked(true);
          setBody("");
        } else {
          setError(t(`sendErrors.${res.error}`));
          setBody(value);
        }
      }
    });
  }

  return (
    // 100dvh (not vh) so iOS Safari with toolbar visible doesn't
    // overshoot and let the composer cover the BottomNav.
    <div className="flex flex-col h-[calc(100dvh-3.5rem-7rem)]">
      {/* Online indicator — slides in just under the page header so
          the user knows whether the other party is in the chat right
          now. Quiet design: a small dot + label. */}
      {otherUserId && (
        <div className="px-4 py-1.5 text-[11px] flex items-center gap-1.5 border-b border-border bg-background/85">
          <span
            className={`size-1.5 rounded-full ${
              otherOnline ? "bg-emerald-500 animate-live-pulse" : "bg-muted-foreground/40"
            }`}
            aria-hidden
          />
          <span className="text-muted-foreground">
            {otherOnline ? t("online") : t("offline")}
          </span>
        </div>
      )}

      {/* Listing card — shows the sticker the chat is about, when
          the conversation was started from a listing. Always visible
          so both sides remember the deal in motion. */}
      {listingPreview && (
        <ListingCardHeader preview={listingPreview} />
      )}

      <TradeControls
        conversationId={conversationId}
        sellerId={sellerId}
        currentUserId={currentUserId}
        listingId={listingId}
        initialTrade={initialTrade}
        sellerActiveListings={sellerActiveListings}
        tradeItems={tradeItems}
      />

      {/* Safety disclaimer — visible on every chat so users can't say
          they didn't know contact info isn't allowed. */}
      <div
        role="note"
        className="px-4 py-2.5 text-[11px] leading-snug bg-accent/10 text-accent border-b border-accent/20"
      >
        <strong className="font-semibold">⚠ {t("disclaimerTitle")}</strong>
        {" — "}
        {t("disclaimerBody")}
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">
            {t("startConversation")}
          </p>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === currentUserId;
            const prev = messages[i - 1];
            const sameAuthorBlock =
              prev && prev.sender_id === m.sender_id &&
              Date.parse(m.created_at) - Date.parse(prev.created_at) < 60_000;
            const showSenderLabel = !mine && !sameAuthorBlock;
            // Read receipt: my message is "read" when the other
            // party's last_read_at on the conversation is later
            // than the message's created_at.
            const isRead =
              mine &&
              !m.id.startsWith("temp-") &&
              lastReadAtOther !== null &&
              Date.parse(lastReadAtOther) >= Date.parse(m.created_at);
            // Last *of mine* in the list — only the most recent
            // outgoing message renders the receipt, mirroring the
            // WhatsApp/iMessage convention of a single mark per
            // batch instead of a sea of checkmarks.
            const isLastMine =
              mine && messages.slice(i + 1).every((nm) => nm.sender_id !== currentUserId);

            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  mine ? "items-end" : "items-start"
                } ${sameAuthorBlock ? "mt-0.5" : "mt-3"}`}
              >
                {showSenderLabel && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground ml-3 mb-1">
                    {otherUsername ?? t("unknownUser")}
                  </span>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    mine
                      ? "bg-foreground text-background rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.body}
                </div>
                {mine && isLastMine && (
                  <ReadReceipt
                    pending={m.id.startsWith("temp-")}
                    read={isRead}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mx-3 mb-2 px-3 py-2 text-xs font-medium leading-snug bg-red-600/10 text-red-600 border border-red-600/30 rounded-xl"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSend}
        className="border-t border-border bg-background p-3 flex gap-2 items-center"
      >
        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={blocked ? t("blockedPlaceholder") : t("inputPlaceholder")}
          maxLength={2000}
          disabled={pending || blocked}
          className="flex-1 h-11 px-4 rounded-full border border-border bg-background text-base focus:outline-none focus:border-accent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={pending || blocked || !body.trim()}
          aria-label={t("send")}
          className="size-11 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function ReadReceipt({ pending, read }: { pending: boolean; read: boolean }) {
  // Three states: clock (still in flight) → single ✓ (delivered) →
  // double ✓ in accent (read by the other party).
  if (pending) {
    return (
      <span
        className="text-[10px] text-muted-foreground/70 mr-2 mt-0.5 inline-flex items-center gap-0.5"
        aria-label="enviando"
      >
        <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4v4l2.5 1.5" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className={`mr-2 mt-0.5 inline-flex items-center ${
        read ? "text-emerald-500" : "text-muted-foreground/70"
      }`}
      aria-label={read ? "leído" : "enviado"}
    >
      <svg viewBox="0 0 18 12" className="h-3 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6.5l3 3 6-7" />
        {read && <path d="M7 6.5l3 3 6-7" />}
      </svg>
    </span>
  );
}

function ListingCardHeader({
  preview,
}: {
  preview: ConversationListingPreview;
}) {
  return (
    <article className="border-b border-border bg-muted/30 px-3 py-2.5 flex items-center gap-3">
      {preview.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.photo_url}
          alt=""
          className="size-12 rounded-lg object-cover bg-muted shrink-0"
        />
      ) : (
        <div className="size-12 rounded-lg bg-accent/15 text-accent flex flex-col items-center justify-center shrink-0">
          <span className="text-[9px] font-semibold uppercase tracking-wider">
            {preview.team_code ?? preview.code.slice(0, 3)}
          </span>
          <span className="text-base font-bold tabular-nums leading-none mt-0.5">
            {preview.number ?? "★"}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
          {preview.team_code ?? "Lámina"} #{preview.number ?? "—"}
        </p>
        <p className="text-sm font-medium truncate">{preview.name}</p>
      </div>
      {preview.price_cop !== null && (
        <span className="text-sm font-bold tabular-nums shrink-0">
          ${COP.format(preview.price_cop)}
        </span>
      )}
    </article>
  );
}

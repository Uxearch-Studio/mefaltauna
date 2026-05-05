"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { archiveConversationAction } from "./actions";

type Props = {
  id: string;
  label: string;
  initial: string;
  avatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string;
  stickerCode: string | null;
  unreadCount: number;
  /** Pre-formatted relative time, computed by the server. */
  relativeTime: string;
};

export function InboxRow({
  id,
  label,
  initial,
  avatarUrl,
  lastMessageBody,
  lastMessageAt,
  stickerCode,
  unreadCount,
  relativeTime,
}: Props) {
  const t = useTranslations("inbox");
  const router = useRouter();
  const [removed, setRemoved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const unread = unreadCount > 0;

  if (removed) return null;

  function archive() {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel the confirm state after a few seconds so the
      // chrome doesn't sit there permanently if the user moves on.
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await archiveConversationAction(id);
      if (res?.ok) {
        setRemoved(true);
        // Pull a fresh server tree so the bottom-nav unread badge
        // and any other consumers reflect the archive immediately.
        router.refresh();
      } else {
        // Surface the failure instead of silently dropping the row —
        // user reports of "I deleted but it came back" trace to this
        // path. Now they see what happened.
        setError(t("archiveFailed"));
        setConfirming(false);
      }
    });
  }

  return (
    <li className="relative">
      <Link
        href={`/app/inbox/${id}`}
        className={`flex items-center gap-3 surface-card p-4 pr-12 hover:bg-muted/40 transition-colors ${
          unread ? "ring-2 ring-accent/40" : ""
        }`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
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
            <span
              className="text-xs text-muted-foreground tabular-nums shrink-0"
              title={lastMessageAt}
            >
              {relativeTime}
            </span>
          </div>
          <p
            className={`text-sm truncate ${
              unread
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {lastMessageBody ?? t("noMessagesYet")}
          </p>
          {stickerCode && (
            <p className="text-[10px] uppercase tracking-wide text-accent mt-0.5">
              {t("aboutSticker", { code: stickerCode })}
            </p>
          )}
        </div>
        {unread && (
          <span className="size-6 shrink-0 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center tabular-nums">
            {unreadCount}
          </span>
        )}
      </Link>

      {/* Archive trigger — separate button stacked on the row, doesn't
          intercept the parent Link unless the user taps it directly. */}
      <button
        type="button"
        onClick={archive}
        disabled={pending}
        aria-label={confirming ? t("archiveConfirm") : t("archive")}
        title={confirming ? t("archiveConfirm") : t("archive")}
        className={`absolute top-1/2 -translate-y-1/2 right-3 size-8 rounded-full flex items-center justify-center transition-all ${
          confirming
            ? "bg-red-600 text-white scale-110"
            : "bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
        } ${pending ? "opacity-50" : ""}`}
      >
        {confirming ? (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 6h18M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
          </svg>
        )}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-1 mx-1 px-3 py-1.5 text-[11px] font-medium leading-snug bg-red-600/10 text-red-600 border border-red-600/30 rounded-lg"
        >
          {error}
        </p>
      )}
    </li>
  );
}

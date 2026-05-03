"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { sendMessageAction, markConversationReadAction } from "../actions";
import type { Message } from "@/lib/db";

type Props = {
  conversationId: string;
  currentUserId: string;
  otherUsername: string | null;
  initialMessages: Message[];
};

export function ChatRoom({
  conversationId,
  currentUserId,
  otherUsername,
  initialMessages,
}: Props) {
  const t = useTranslations("inbox");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  // Mark read on mount — client-side fire-and-forget so the server
  // render doesn't have to invoke the action (which crashed in 16).
  useEffect(() => {
    markConversationReadAction(conversationId).catch(() => {});
  }, [conversationId]);

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
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

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
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError(t(`sendErrors.${res.error}`));
        setBody(value);
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-7rem)]">
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
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-border bg-background p-3 flex gap-2 items-center"
      >
        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("inputPlaceholder")}
          maxLength={2000}
          disabled={pending}
          className="flex-1 h-11 px-4 rounded-full border border-border bg-background text-base focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
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

      {error && (
        <p className="text-xs text-accent text-center pb-2">{error}</p>
      )}
    </div>
  );
}

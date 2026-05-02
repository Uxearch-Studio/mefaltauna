"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FeedItem, Sticker } from "@/lib/db";

type Props = {
  initial: FeedItem[];
  catalog: Pick<Sticker, "id" | "code" | "name" | "team_code" | "type" | "number">[];
};

type StickerByIdMap = Record<number, Props["catalog"][number]>;

const TIME = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function relTime(iso: string) {
  const diffSec = Math.round((Date.parse(iso) - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return TIME.format(diffSec, "second");
  if (abs < 3600) return TIME.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return TIME.format(Math.round(diffSec / 3600), "hour");
  return TIME.format(Math.round(diffSec / 86400), "day");
}

export function LiveFeed({ initial, catalog }: Props) {
  const t = useTranslations("feed");
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [connected, setConnected] = useState(false);

  const stickerById: StickerByIdMap = Object.fromEntries(
    catalog.map((s) => [s.id, s]),
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("listings-feed")
      .on(
        // typed via the broker callback below; Supabase's overload set
        // doesn't expose the union nicely here, so cast the event arg.
        "postgres_changes" as never,
        { event: "INSERT", schema: "public", table: "listings" },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new;
          const stickerId = row.sticker_id as number;
          const sticker = stickerById[stickerId];
          if (!sticker) return;

          const item: FeedItem = {
            id: row.id as string,
            user_id: row.user_id as string,
            sticker_id: stickerId,
            type: row.type as FeedItem["type"],
            price_cop: (row.price_cop as number | null) ?? null,
            status: "active",
            created_at: row.created_at as string,
            sticker: {
              code: sticker.code,
              name: sticker.name,
              team_code: sticker.team_code,
              type: sticker.type,
              number: sticker.number,
            },
            username: null, // filled when next refresh fetches it
          };
          setItems((prev) => [item, ...prev].slice(0, 50));
        },
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stickerById]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span
          className={`size-2 rounded-full ${
            connected ? "bg-accent animate-live-pulse" : "bg-muted-foreground"
          }`}
          aria-hidden
        />
        <span className="font-pixel text-[10px] uppercase tracking-widest text-muted-foreground">
          {connected ? t("live") : t("connecting")}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground py-12 text-center border-2 border-dashed border-border">
          {t("empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="animate-feed-in border-2 border-border bg-background p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 shrink-0 flex items-center justify-center bg-accent/10 border-2 border-accent">
                  <span className="font-pixel text-[10px] text-accent crt-glow">
                    {item.sticker.team_code ?? item.sticker.code.slice(0, 3)}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-mono text-sm truncate">
                    <span className="text-foreground">
                      {item.username ?? t("someone")}
                    </span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="text-muted-foreground">
                      {t(`actions.${item.type}`)}
                    </span>
                  </p>
                  <p className="font-pixel text-[10px] uppercase text-muted-foreground truncate">
                    {item.sticker.code} · {item.sticker.name}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {relTime(item.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

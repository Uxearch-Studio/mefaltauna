"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FeedItem, Sticker } from "@/lib/db";

type Props = {
  initial: FeedItem[];
  catalog: Pick<Sticker, "id" | "code" | "name" | "team_code" | "type" | "number">[];
  locale: string;
};

const TIME_ES = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const TIME_EN = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relTime(iso: string, locale: string) {
  const fmt = locale === "en" ? TIME_EN : TIME_ES;
  const diffSec = Math.round((Date.parse(iso) - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return fmt.format(diffSec, "second");
  if (abs < 3600) return fmt.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return fmt.format(Math.round(diffSec / 3600), "hour");
  return fmt.format(Math.round(diffSec / 86400), "day");
}

const COP = new Intl.NumberFormat("es-CO");

export function LiveFeed({ initial, catalog, locale }: Props) {
  const t = useTranslations("feed");
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [connected, setConnected] = useState(false);

  const stickerById = Object.fromEntries(catalog.map((s) => [s.id, s]));

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel("listings-feed")
      .on(
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
            username: null,
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
            connected ? "bg-accent animate-live-pulse" : "bg-muted-foreground/40"
          }`}
          aria-hidden
        />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {connected ? t("live") : t("connecting")}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <Link
            href="/app/publish"
            className="inline-flex mt-4 h-9 px-4 items-center rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("publishFirst")}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="animate-feed-in surface-card p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-12 shrink-0 flex items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <span className="text-xs font-semibold">
                    {item.sticker.team_code ?? item.sticker.code.slice(0, 3)}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">
                      {item.username ?? t("someone")}
                    </span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="text-muted-foreground">
                      {t(`actions.${item.type}`)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.sticker.code} · {item.sticker.name}
                    {item.price_cop !== null && (
                      <span className="text-foreground font-medium">
                        {" "}· ${COP.format(item.price_cop)} COP
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {relTime(item.created_at, locale)}
                </span>
                <button
                  type="button"
                  className="hidden sm:inline-flex h-8 px-3 rounded-full bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
                  title={t("contact")}
                >
                  {t("contact")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

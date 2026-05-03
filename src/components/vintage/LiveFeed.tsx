"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { openConversationAction } from "@/app/[locale]/app/inbox/actions";
import { cn } from "@/lib/cn";
import type { FeedItem, Sticker } from "@/lib/db";

type Props = {
  initial: FeedItem[];
  catalog: Pick<Sticker, "id" | "code" | "name" | "team_code" | "type" | "number">[];
  locale: string;
  currentUserId: string;
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

type FilterType = "all" | "trade" | "sale";
type ScopeTab = "market" | "mine";

export function LiveFeed({ initial, catalog, locale, currentUserId }: Props) {
  const t = useTranslations("feed");
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [connected, setConnected] = useState(false);

  const [scope, setScope] = useState<ScopeTab>("market");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterNumber, setFilterNumber] = useState<string>("");
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const stickerById = useMemo(
    () => Object.fromEntries(catalog.map((s) => [s.id, s])),
    [catalog],
  );

  const teamCodes = useMemo(() => {
    const set = new Set<string>();
    for (const s of catalog) if (s.team_code) set.add(s.team_code);
    return [...set].sort();
  }, [catalog]);

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
            photo_url: (row.photo_url as string | null) ?? null,
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

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (scope === "mine" && item.user_id !== currentUserId) return false;
      if (scope === "market" && item.user_id === currentUserId) return false;
      if (filterType !== "all") {
        if (filterType === "trade" && item.type === "sale") return false;
        if (filterType === "sale" && item.type === "trade") return false;
      }
      if (filterTeam !== "all" && item.sticker.team_code !== filterTeam) {
        return false;
      }
      if (filterNumber.trim()) {
        const n = Number(filterNumber);
        if (Number.isFinite(n) && item.sticker.number !== n) return false;
      }
      if (filterMaxPrice.trim()) {
        const max = Number(filterMaxPrice.replace(/\D/g, ""));
        if (
          Number.isFinite(max) &&
          (item.price_cop === null || item.price_cop > max)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, scope, currentUserId, filterType, filterTeam, filterNumber, filterMaxPrice]);

  const mineCount = items.filter((i) => i.user_id === currentUserId).length;
  const marketCount = items.length - mineCount;

  function clearFilters() {
    setFilterType("all");
    setFilterTeam("all");
    setFilterNumber("");
    setFilterMaxPrice("");
  }

  const hasFilters =
    filterType !== "all" ||
    filterTeam !== "all" ||
    filterNumber.trim() !== "" ||
    filterMaxPrice.trim() !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Live indicator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              connected
                ? "bg-accent animate-live-pulse"
                : "bg-muted-foreground/40",
            )}
            aria-hidden
          />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {connected ? t("live") : t("connecting")}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {t("countShown", { count: filtered.length, total: items.length })}
        </span>
      </div>

      {/* Scope tabs — Market / Mis publicadas */}
      <div className="flex border-b border-border">
        <ScopeTab
          active={scope === "market"}
          onClick={() => setScope("market")}
          count={marketCount}
          label={t("scope.market")}
        />
        <ScopeTab
          active={scope === "mine"}
          onClick={() => setScope("mine")}
          count={mineCount}
          label={t("scope.mine")}
        />
      </div>

      {/* Filters — single horizontal row, scrolls on narrow viewports */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="h-10 px-3 text-xs rounded-full border border-border bg-background focus:outline-none focus:border-accent shrink-0"
        >
          {(["all", "trade", "sale"] as const).map((opt) => (
            <option key={opt} value={opt}>
              {t(`filterType.${opt}`)}
            </option>
          ))}
        </select>

        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="h-10 px-3 text-xs rounded-full border border-border bg-background focus:outline-none focus:border-accent shrink-0"
        >
          <option value="all">{t("filterAllTeams")}</option>
          {teamCodes.map((tc) => (
            <option key={tc} value={tc}>
              {tc}
            </option>
          ))}
        </select>

        <input
          type="text"
          inputMode="numeric"
          placeholder={t("filterNumber")}
          value={filterNumber}
          onChange={(e) =>
            setFilterNumber(e.target.value.replace(/\D/g, "").slice(0, 3))
          }
          className="h-10 w-20 px-3 text-xs rounded-full border border-border bg-background focus:outline-none focus:border-accent shrink-0"
        />

        <input
          type="text"
          inputMode="numeric"
          placeholder={t("filterMaxPrice")}
          value={filterMaxPrice}
          onChange={(e) =>
            setFilterMaxPrice(e.target.value.replace(/\D/g, ""))
          }
          className="h-10 w-28 px-3 text-xs rounded-full border border-border bg-background focus:outline-none focus:border-accent shrink-0"
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            aria-label={t("clearFilters")}
            className="h-10 px-3 text-xs text-muted-foreground hover:text-accent transition-colors shrink-0"
          >
            ×
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? t("noResults")
              : scope === "mine"
                ? t("emptyMine")
                : t("empty")}
          </p>
          {scope === "mine" && (
            <Link
              href="/app/publish"
              className="inline-flex mt-4 h-10 px-4 items-center rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("publishFirst")}
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              locale={locale}
              currentUserId={currentUserId}
              onPhotoClick={() =>
                item.photo_url && setLightbox(item.photo_url)
              }
            />
          ))}
        </ul>
      )}

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

function ScopeTab({
  active,
  onClick,
  count,
  label,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-4 py-3 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
      aria-pressed={active}
    >
      <span className="flex items-center gap-2">
        {label}
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
            active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      </span>
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
      )}
    </button>
  );
}

function FeedCard({
  item,
  locale,
  currentUserId,
  onPhotoClick,
}: {
  item: FeedItem;
  locale: string;
  currentUserId: string;
  onPhotoClick: () => void;
}) {
  const t = useTranslations("feed");
  const [pending, startTransition] = useTransition();
  const isOwn = item.user_id === currentUserId;

  function contact() {
    if (isOwn) return;
    startTransition(async () => {
      await openConversationAction(item.id, locale);
    });
  }

  // Show only the first name token from the username/display_name.
  const senderLabel = item.username
    ? item.username.split(/[\s_·]/)[0]
    : t("someone");

  return (
    <li className="animate-feed-in surface-card overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 p-3 items-center">
        {/* Thumb / sticker badge */}
        {item.photo_url ? (
          <button
            type="button"
            onClick={onPhotoClick}
            className="size-14 shrink-0 rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
            aria-label={t("expandPhoto")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.photo_url}
              alt=""
              className="size-full object-cover"
            />
          </button>
        ) : (
          <div className="size-14 shrink-0 rounded-lg bg-accent/15 text-accent flex flex-col items-center justify-center">
            <span className="text-[9px] font-semibold uppercase tracking-wider">
              {item.sticker.team_code ?? item.sticker.code.slice(0, 3)}
            </span>
            <span className="text-base font-bold tabular-nums leading-none mt-0.5">
              {item.sticker.number ?? "★"}
            </span>
          </div>
        )}

        {/* Middle column — sender + sticker + price */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold truncate">{senderLabel}</p>
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
              {relTime(item.created_at, locale)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {item.sticker.team_code ?? "·"} #{item.sticker.number ?? "—"} · {item.sticker.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide",
                item.type === "sale"
                  ? "bg-highlight/20 text-highlight"
                  : item.type === "trade"
                    ? "bg-accent/15 text-accent"
                    : "bg-foreground text-background",
              )}
            >
              {t(`actions.${item.type}`)}
            </span>
            {item.price_cop !== null && (
              <span className="text-sm font-bold tabular-nums">
                ${COP.format(item.price_cop)}
              </span>
            )}
          </div>
        </div>

        {/* Right column — icon-only contact */}
        {!isOwn ? (
          <button
            type="button"
            onClick={contact}
            disabled={pending}
            aria-label={t("contact")}
            title={t("contact")}
            className="size-10 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        ) : (
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground shrink-0 text-right">
            {t("yourListing")}
          </span>
        )}
      </div>
    </li>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 size-10 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white transition-colors"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      </button>
    </div>
  );
}

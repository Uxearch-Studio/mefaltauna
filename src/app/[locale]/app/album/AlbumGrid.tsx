"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { Sticker } from "@/lib/db";
import { adjustStickerAction } from "./actions";

type FilterId = "all" | "owned" | "missing" | "duplicates";
const FILTERS: FilterId[] = ["all", "owned", "missing", "duplicates"];

type Props = {
  catalog: Sticker[];
  initialInventory: Record<number, number>;
  locale: string;
};

type Pop = { id: number; key: number; text: string };

export function AlbumGrid({ catalog, initialInventory, locale }: Props) {
  const t = useTranslations("album");
  const [inventory, setInventory] = useState(initialInventory);
  const [filter, setFilter] = useState<FilterId>("all");
  const [pops, setPops] = useState<Pop[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => groupByPage(catalog), [catalog]);

  const filtered = useMemo(() => {
    if (filter === "all") return grouped;
    return grouped
      .map((g) => ({
        ...g,
        stickers: g.stickers.filter((s) => {
          const c = inventory[s.id] ?? 0;
          if (filter === "owned") return c >= 1;
          if (filter === "missing") return c === 0;
          if (filter === "duplicates") return c >= 2;
          return true;
        }),
      }))
      .filter((g) => g.stickers.length > 0);
  }, [grouped, inventory, filter]);

  function bumpPop(stickerId: number, delta: number, count: number) {
    const text =
      delta < 0 ? "−1" : count === 1 ? "+1" : `+1`;
    const pop: Pop = { id: stickerId, key: Date.now(), text };
    setPops((prev) => [...prev, pop]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.key !== pop.key));
    }, 700);
  }

  function adjust(s: Sticker, delta: number) {
    const current = inventory[s.id] ?? 0;
    const next = Math.max(0, current + delta);
    if (next === current) return;

    setInventory((prev) => ({ ...prev, [s.id]: next }));
    bumpPop(s.id, delta, next);

    startTransition(async () => {
      const res = await adjustStickerAction(s.id, delta, locale);
      if (!res.ok) {
        setInventory((prev) => ({ ...prev, [s.id]: current }));
      } else {
        setInventory((prev) => ({ ...prev, [s.id]: res.count }));
      }
    });
  }

  function togglePage(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalOwned = Object.values(inventory).filter((c) => c >= 1).length;
  const totalDup = Object.values(inventory).filter((c) => c >= 2).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 px-4 rounded-full text-xs font-medium border border-border transition-colors",
              filter === f
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {t(`filters.${f}`)}
            {f === "owned" && totalOwned > 0 && (
              <span className="ml-2 opacity-70">{totalOwned}</span>
            )}
            {f === "duplicates" && totalDup > 0 && (
              <span className="ml-2 opacity-70">{totalDup}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((page) => (
          <PageBlock
            key={page.key}
            page={page}
            inventory={inventory}
            pops={pops}
            collapsed={collapsed.has(page.key)}
            onToggle={() => togglePage(page.key)}
            onIncrement={(s) => adjust(s, +1)}
            onDecrement={(s) => adjust(s, -1)}
          />
        ))}
      </div>
    </div>
  );
}

type PageGroup = {
  key: string;
  title: string;
  subtitle: string;
  stickers: Sticker[];
};

function groupByPage(catalog: Sticker[]): PageGroup[] {
  const map = new Map<string, PageGroup>();
  for (const s of catalog) {
    const key =
      s.team_code ??
      (s.type === "group" ? "GROUPS" : s.type === "stadium" ? "STADIUMS" : "OTHER");
    if (!map.has(key)) {
      map.set(key, {
        key,
        title: pageTitle(key, s),
        subtitle: pageSubtitle(key),
        stickers: [],
      });
    }
    map.get(key)!.stickers.push(s);
  }
  return [...map.values()].sort((a, b) => order(a.key) - order(b.key));
}

function order(key: string) {
  if (key === "GROUPS") return 0;
  if (key === "STADIUMS") return 1000;
  if (key === "OTHER") return 1001;
  return 100;
}

function pageTitle(key: string, sample: Sticker) {
  if (key === "GROUPS") return "Grupos";
  if (key === "STADIUMS") return "Estadios";
  if (key === "OTHER") return "Otros";
  return sample.team_code ?? key;
}

function pageSubtitle(key: string) {
  if (key === "GROUPS") return "12 grupos";
  if (key === "STADIUMS") return "12 sedes";
  if (key === "OTHER") return "";
  return "1 escudo · 12 láminas";
}

function PageBlock({
  page,
  inventory,
  pops,
  collapsed,
  onToggle,
  onIncrement,
  onDecrement,
}: {
  page: PageGroup;
  inventory: Record<number, number>;
  pops: Pop[];
  collapsed: boolean;
  onToggle: () => void;
  onIncrement: (s: Sticker) => void;
  onDecrement: (s: Sticker) => void;
}) {
  const owned = page.stickers.filter((s) => (inventory[s.id] ?? 0) >= 1).length;
  const total = page.stickers.length;
  const complete = owned === total;

  return (
    <section className="flex flex-col gap-3 surface-card p-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between gap-4 w-full text-left hover:opacity-80 transition-opacity"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            viewBox="0 0 24 24"
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              collapsed ? "" : "rotate-90",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
          <h2 className="text-base font-semibold tracking-tight truncate">
            {page.title}
          </h2>
          {page.subtitle && (
            <p className="text-xs text-muted-foreground hidden sm:block">
              {page.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {complete && (
            <span className="text-xs font-medium text-highlight">★</span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {owned}/{total}
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 pt-1">
          {page.stickers.map((s) => (
            <StickerTile
              key={s.id}
              sticker={s}
              count={inventory[s.id] ?? 0}
              pops={pops.filter((p) => p.id === s.id)}
              onIncrement={() => onIncrement(s)}
              onDecrement={() => onDecrement(s)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function StickerTile({
  sticker,
  count,
  pops,
  onIncrement,
  onDecrement,
}: {
  sticker: Sticker;
  count: number;
  pops: Pop[];
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const owned = count >= 1;
  const dup = count >= 2;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onIncrement}
        aria-label={sticker.code}
        className={cn(
          "w-full aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-1 p-1 transition-all active:scale-95",
          owned
            ? "bg-accent/15 ring-1 ring-accent/40 text-foreground"
            : "bg-muted/60 text-muted-foreground/60 hover:bg-muted",
        )}
      >
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            owned ? "text-accent" : "opacity-60",
          )}
        >
          {sticker.team_code ?? glyphTeam(sticker)}
        </span>
        <span
          className={cn(
            "text-2xl font-bold tabular-nums leading-none",
            owned ? "text-foreground" : "opacity-50",
          )}
        >
          {sticker.number ?? glyphNumber(sticker)}
        </span>
      </button>

      {/* Duplicate count badge — top right */}
      {dup && (
        <span className="absolute top-1 right-1 min-w-5 h-5 px-1 flex items-center justify-center bg-highlight text-highlight-foreground rounded-full text-[10px] font-bold tabular-nums pointer-events-none">
          ×{count}
        </span>
      )}

      {/* Decrement button — visible when count > 0 */}
      {owned && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDecrement();
          }}
          aria-label={`Quitar una ${sticker.code}`}
          className="absolute -bottom-1 -right-1 size-6 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-md"
        >
          −
        </button>
      )}

      {pops.map((p) => (
        <span
          key={p.key}
          aria-hidden
          className="absolute inset-x-0 -top-1 mx-auto w-fit text-sm font-bold text-highlight pointer-events-none animate-pop"
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

function glyphTeam(s: Sticker): string {
  if (s.type === "group") return "GR";
  if (s.type === "stadium") return "ST";
  return s.code.split("-")[0];
}

function glyphNumber(s: Sticker): string {
  if (s.type === "group") return s.code.split("-").pop() ?? "G";
  if (s.type === "badge") return "★";
  if (s.type === "stadium") return "▲";
  if (s.type === "legend") return "♛";
  if (s.type === "special") return "✦";
  return "·";
}

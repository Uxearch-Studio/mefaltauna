"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { Sticker } from "@/lib/db";
import { cycleStickerAction, quickListAction } from "./actions";

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

  function bumpPop(stickerId: number, count: number) {
    const text =
      count === 0 ? "−" : count === 1 ? "+1" : count === 2 ? "+1 ✦" : `${count}×`;
    const pop: Pop = { id: stickerId, key: Date.now(), text };
    setPops((prev) => [...prev, pop]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.key !== pop.key));
    }, 900);
  }

  function onTap(s: Sticker) {
    const current = inventory[s.id] ?? 0;
    const optimistic = current >= 3 ? 0 : current + 1;
    setInventory((prev) => ({ ...prev, [s.id]: optimistic }));
    bumpPop(s.id, optimistic);

    startTransition(async () => {
      const res = await cycleStickerAction(s.id, locale);
      if (!res.ok) {
        setInventory((prev) => ({ ...prev, [s.id]: current }));
      } else {
        setInventory((prev) => ({ ...prev, [s.id]: res.count }));
      }
    });
  }

  function onQuickList(s: Sticker) {
    startTransition(async () => {
      await quickListAction(s.id, locale);
    });
  }

  const totalOwned = Object.values(inventory).filter((c) => c >= 1).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 px-3 font-pixel text-[10px] uppercase border-2 border-border transition-colors",
              filter === f
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-foreground/10",
            )}
          >
            {t(`filters.${f}`)}
            {f === "owned" && totalOwned > 0 && (
              <span className="ml-2 text-accent">{totalOwned}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-10">
        {filtered.map((page) => (
          <PageBlock
            key={page.key}
            page={page}
            inventory={inventory}
            pops={pops}
            onTap={onTap}
            onQuickList={onQuickList}
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
  // Order: groups, then teams (alphabetical), then stadiums
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
  if (key === "GROUPS") return "12 grupos · 12 láminas";
  if (key === "STADIUMS") return "12 sedes · 12 láminas";
  if (key === "OTHER") return "";
  return "1 escudo · 12 láminas";
}

function PageBlock({
  page,
  inventory,
  pops,
  onTap,
  onQuickList,
}: {
  page: PageGroup;
  inventory: Record<number, number>;
  pops: Pop[];
  onTap: (s: Sticker) => void;
  onQuickList: (s: Sticker) => void;
}) {
  const owned = page.stickers.filter((s) => (inventory[s.id] ?? 0) >= 1).length;
  const total = page.stickers.length;
  const complete = owned === total;

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between gap-4 border-b-2 border-border pb-2">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-2xl md:text-3xl leading-none">
            {page.title}
          </h2>
          {page.subtitle && (
            <p className="font-pixel text-[10px] uppercase text-muted-foreground">
              {page.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {complete && (
            <span className="font-pixel text-[10px] uppercase text-accent crt-glow">
              ✓ Completa
            </span>
          )}
          <span className="font-pixel text-xs tabular-nums">
            {owned}/{total}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
        {page.stickers.map((s) => (
          <StickerTile
            key={s.id}
            sticker={s}
            count={inventory[s.id] ?? 0}
            pops={pops.filter((p) => p.id === s.id)}
            onTap={() => onTap(s)}
            onQuickList={() => onQuickList(s)}
          />
        ))}
      </div>
    </section>
  );
}

function StickerTile({
  sticker,
  count,
  pops,
  onTap,
  onQuickList,
}: {
  sticker: Sticker;
  count: number;
  pops: Pop[];
  onTap: () => void;
  onQuickList: () => void;
}) {
  const owned = count >= 1;
  const dup = count >= 2;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onTap}
        aria-label={sticker.code}
        className={cn(
          "group w-full aspect-[3/4] flex flex-col items-center justify-center gap-1 p-1 transition-all",
          "border-2 active:translate-y-px",
          owned
            ? "border-accent bg-accent/10 text-foreground"
            : "border-dashed border-border bg-muted/40 text-muted-foreground/40",
        )}
      >
        <span
          className={cn(
            "font-pixel text-[10px] leading-none",
            owned ? "text-accent crt-glow" : "opacity-50",
          )}
        >
          {sticker.team_code ?? sticker.code.split("-")[0]}
        </span>
        <span
          className={cn(
            "font-display text-2xl leading-none tabular-nums",
            owned ? "text-foreground" : "opacity-30",
          )}
        >
          {sticker.number ?? glyphFor(sticker.type)}
        </span>
        {dup && (
          <span className="absolute top-1 right-1 size-5 flex items-center justify-center bg-accent text-accent-foreground font-pixel text-[10px] border border-border">
            {count}×
          </span>
        )}
      </button>

      {dup && (
        <button
          type="button"
          onClick={onQuickList}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 h-5 font-pixel text-[8px] uppercase bg-foreground text-background border-2 border-border opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground transition-opacity whitespace-nowrap"
          title="Ofrecer para intercambio"
        >
          Ofrecer
        </button>
      )}

      {pops.map((p) => (
        <span
          key={p.key}
          aria-hidden
          className="absolute inset-x-0 -top-2 mx-auto w-fit font-pixel text-xs text-accent crt-glow pointer-events-none animate-pop"
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

function glyphFor(type: Sticker["type"]) {
  if (type === "badge") return "★";
  if (type === "group") return "G";
  if (type === "stadium") return "▲";
  if (type === "legend") return "♛";
  if (type === "special") return "✦";
  return "·";
}

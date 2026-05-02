"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { Sticker } from "@/lib/db";
import { cycleStickerAction } from "./actions";

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
    const text = count === 0 ? "−" : count === 1 ? "+1" : `${count}×`;
    const pop: Pop = { id: stickerId, key: Date.now(), text };
    setPops((prev) => [...prev, pop]);
    setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.key !== pop.key));
    }, 700);
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

      <div className="flex flex-col gap-8">
        {filtered.map((page) => (
          <PageBlock
            key={page.key}
            page={page}
            inventory={inventory}
            pops={pops}
            onTap={onTap}
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
  onTap,
}: {
  page: PageGroup;
  inventory: Record<number, number>;
  pops: Pop[];
  onTap: (s: Sticker) => void;
}) {
  const owned = page.stickers.filter((s) => (inventory[s.id] ?? 0) >= 1).length;
  const total = page.stickers.length;
  const complete = owned === total;

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between gap-4 px-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold tracking-tight">{page.title}</h2>
          {page.subtitle && (
            <p className="text-xs text-muted-foreground">{page.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {complete && (
            <span className="text-xs font-medium text-highlight">★ Completa</span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
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
}: {
  sticker: Sticker;
  count: number;
  pops: Pop[];
  onTap: () => void;
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
          {sticker.team_code ?? sticker.code.split("-")[0]}
        </span>
        <span
          className={cn(
            "text-2xl font-bold tabular-nums leading-none",
            owned ? "text-foreground" : "opacity-50",
          )}
        >
          {sticker.number ?? glyphFor(sticker.type)}
        </span>
        {dup && (
          <span className="absolute top-1 right-1 size-5 flex items-center justify-center bg-highlight text-highlight-foreground rounded-full text-[10px] font-bold">
            {count}
          </span>
        )}
      </button>

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

function glyphFor(type: Sticker["type"]) {
  if (type === "badge") return "★";
  if (type === "group") return "G";
  if (type === "stadium") return "▲";
  if (type === "legend") return "♛";
  if (type === "special") return "✦";
  return "·";
}

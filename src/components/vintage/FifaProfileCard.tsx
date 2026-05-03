"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type FifaProfileStats = {
  /** How many distinct stickers the user owns. */
  ownedCount: number;
  /** Total stickers in the catalog (album size). */
  totalCount: number;
  /** Listings created (any status). */
  listingsCount: number;
  /** Listings closed as `sold` — proxy for completed trades. */
  tradesCount: number;
  /** Reputation score from `profiles.reputation`. */
  reputation: number;
  /** Distinct stickers with count >= 2. */
  duplicatesCount: number;
};

type Props = {
  displayName: string;
  username: string | null;
  city: string;
  avatarUrl: string | null;
  initialChar: string;
  stats: FifaProfileStats;
  onEdit: () => void;
};

/**
 * FIFA Ultimate Team-style profile hero.
 * Renders the user as a collectible card with derived stats, level
 * progression, and unlockable achievements. All numbers are derived
 * from existing data (inventory, listings, reputation) — no extra
 * tables needed for the gamification layer.
 */
export function FifaProfileCard({
  displayName,
  username,
  city,
  avatarUrl,
  initialChar,
  stats,
  onEdit,
}: Props) {
  const t = useTranslations("profile.fut");

  const collectionPct =
    stats.totalCount > 0
      ? Math.round((stats.ownedCount / stats.totalCount) * 100)
      : 0;

  // Activity score caps each axis so a single huge number can't carry
  // the whole rating. Rating sits naturally in 50..99 like FUT cards.
  const activity = Math.min(
    99,
    Math.floor(
      stats.ownedCount * 0.6 +
        stats.listingsCount * 3 +
        stats.tradesCount * 6 +
        stats.reputation * 10,
    ),
  );
  const rating = Math.min(99, 50 + Math.floor(activity / 2));

  // Position label scales with how the user actually plays:
  // pure collector vs. active trader vs. balanced "icon".
  const position =
    stats.ownedCount >= 100 && stats.tradesCount >= 5
      ? t("position.icon")
      : stats.tradesCount >= 5 || stats.listingsCount >= 5
        ? t("position.trader")
        : stats.ownedCount >= 10
          ? t("position.collector")
          : t("position.rookie");

  // Linear XP formula. Easy to tune later if we add real events.
  const xp =
    stats.ownedCount * 10 +
    stats.listingsCount * 25 +
    stats.tradesCount * 50 +
    stats.reputation * 100;
  const PER_LEVEL = 500;
  const level = Math.floor(xp / PER_LEVEL) + 1;
  const xpInLevel = xp % PER_LEVEL;
  const xpRemaining = PER_LEVEL - xpInLevel;

  const statRows: Array<{ short: string; long: string; value: number }> = [
    {
      short: t("statCol"),
      long: t("statColLong"),
      value: collectionPct,
    },
    {
      short: t("statPub"),
      long: t("statPubLong"),
      value: stats.listingsCount,
    },
    {
      short: t("statTra"),
      long: t("statTraLong"),
      value: stats.tradesCount,
    },
    {
      short: t("statRep"),
      long: t("statRepLong"),
      value: stats.reputation,
    },
    {
      short: t("statDup"),
      long: t("statDupLong"),
      value: stats.duplicatesCount,
    },
    {
      short: t("statAct"),
      long: t("statActLong"),
      value: activity,
    },
  ];

  return (
    <article className="relative overflow-hidden rounded-3xl bg-[#0e0524] text-white shadow-2xl shadow-black/30">
      {/* Holographic gold sheen */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(140% 90% at 50% -10%, rgba(255,215,122,0.30) 0%, rgba(255,199,44,0.15) 25%, transparent 55%), linear-gradient(160deg, rgba(255,199,44,0.05) 0%, transparent 40%, rgba(255,199,44,0.10) 90%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none shine-sweep"
        style={{ mixBlendMode: "screen", opacity: 0.35 }}
      />

      {/* Gold foil frame + corner carets */}
      <div
        aria-hidden
        className="absolute inset-2 rounded-[22px] pointer-events-none"
        style={{
          border: "1px solid rgba(255,215,122,0.55)",
          boxShadow:
            "inset 0 0 0 2px rgba(255,199,44,0.10), 0 0 24px rgba(255,199,44,0.15)",
        }}
      />
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <span
          key={c}
          aria-hidden
          className={`absolute size-3 border-[var(--stage-yellow)] pointer-events-none ${
            c === "tl"
              ? "top-3 left-3 border-t-2 border-l-2"
              : c === "tr"
                ? "top-3 right-3 border-t-2 border-r-2"
                : c === "bl"
                  ? "bottom-3 left-3 border-b-2 border-l-2"
                  : "bottom-3 right-3 border-b-2 border-r-2"
          }`}
        />
      ))}

      <div className="relative p-6 flex flex-col gap-6">
        {/* Top: rating + photo */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-start pt-2">
            <span
              className="font-display tabular-nums leading-none text-[var(--stage-yellow)]"
              style={{
                fontSize: "clamp(2.5rem, 11vw, 3.75rem)",
                textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
              }}
            >
              {rating}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/85 mt-1.5">
              {position}
            </span>
            <span className="text-lg leading-none mt-1.5">🇨🇴</span>
          </div>

          <div className="ml-auto relative shrink-0">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #ffd97a 0%, #ffc72c 50%, #b67e0f 100%)",
              }}
            />
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="relative size-24 md:size-28 rounded-full object-cover ring-2 ring-[#0e0524]"
              />
            ) : (
              <div className="relative size-24 md:size-28 rounded-full ring-2 ring-[#0e0524] bg-[#1a0b3d] flex items-center justify-center text-3xl font-bold text-[var(--stage-yellow)]">
                {initialChar}
              </div>
            )}
          </div>
        </div>

        {/* Name + handle */}
        <div className="flex flex-col">
          <h2
            className="font-display leading-none text-[var(--stage-yellow)] truncate"
            style={{
              fontSize: "clamp(1.5rem, 6vw, 2rem)",
              textShadow: "2px 2px 0 rgba(0,0,0,0.45)",
            }}
          >
            {displayName}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/65">
            {username && <span>@{username}</span>}
            {username && city && <span>·</span>}
            {city && <span>{city}</span>}
          </div>
          <div
            aria-hidden
            className="mt-3 h-[1.5px] w-16"
            style={{
              background:
                "linear-gradient(90deg, var(--stage-yellow) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Level + XP bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-bold uppercase tracking-[0.2em] text-[var(--stage-yellow)]">
              {t("level")} {level}
            </span>
            <span className="text-white/55 tabular-nums">
              {xpInLevel} / {PER_LEVEL} {t("xp")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--stage-yellow)] transition-[width] duration-500"
              style={{
                width: `${Math.min(100, (xpInLevel / PER_LEVEL) * 100)}%`,
                boxShadow: "0 0 14px rgba(255,199,44,0.55)",
              }}
            />
          </div>
          <span className="text-[10px] text-white/45">
            {t("xpToNext", { remaining: xpRemaining, next: level + 1 })}
          </span>
        </div>

        {/* Stats grid 2×3 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {statRows.map((s) => (
            <div
              key={s.short}
              className="flex items-baseline gap-2 border-b border-white/10 pb-1.5"
            >
              <span className="font-display tabular-nums text-2xl text-[var(--stage-yellow)] leading-none w-10 text-right">
                {s.value}
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/85">
                  {s.short}
                </span>
                <span className="text-[9px] text-white/45 mt-0.5">
                  {s.long}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Album progress bar */}
        <AlbumProgress
          owned={stats.ownedCount}
          total={stats.totalCount}
          pct={collectionPct}
        />

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/app/album"
            className="h-10 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {t("viewAlbum")}
          </Link>
          <Link
            href="/app/feed"
            className="h-10 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            {t("viewListings")}
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="h-10 rounded-full bg-white/10 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-white/15 transition-colors"
          >
            ✎
          </button>
        </div>
      </div>
    </article>
  );
}

function AlbumProgress({
  owned,
  total,
  pct,
}: {
  owned: number;
  total: number;
  pct: number;
}) {
  const t = useTranslations("profile.fut");
  const complete = total > 0 && owned >= total;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/85">
          {t("albumProgress")}
        </span>
        <span className="text-xs text-white/55 tabular-nums">
          {owned} <span className="text-white/40">{t("ofTotal", { total })}</span>
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            complete ? "bg-emerald-400" : "bg-[var(--stage-yellow)]"
          }`}
          style={{
            width: `${Math.min(100, pct)}%`,
            boxShadow: complete
              ? "0 0 14px rgba(52,211,153,0.5)"
              : "0 0 14px rgba(255,199,44,0.55)",
          }}
        />
      </div>
      <span className="text-[10px] tabular-nums text-white/45">
        {complete ? t("complete") : `${pct}%`}
      </span>
    </div>
  );
}

export type AchievementId =
  | "first_sticker"
  | "ten_stickers"
  | "fifty_stickers"
  | "first_listing"
  | "five_listings"
  | "trusted"
  | "collector"
  | "completist";

export function Achievements({
  stats,
}: {
  stats: FifaProfileStats;
}) {
  const t = useTranslations("profile.fut");
  const [expanded, setExpanded] = useState<AchievementId | null>(null);

  const achievements: Array<{
    id: AchievementId;
    unlocked: boolean;
    icon: string;
  }> = [
    { id: "first_sticker", unlocked: stats.ownedCount >= 1, icon: "★" },
    { id: "ten_stickers", unlocked: stats.ownedCount >= 10, icon: "✦" },
    { id: "fifty_stickers", unlocked: stats.ownedCount >= 50, icon: "✪" },
    { id: "first_listing", unlocked: stats.listingsCount >= 1, icon: "↑" },
    { id: "five_listings", unlocked: stats.listingsCount >= 5, icon: "⇈" },
    { id: "trusted", unlocked: stats.reputation >= 5, icon: "♛" },
    {
      id: "collector",
      unlocked: stats.ownedCount >= 100,
      icon: "♜",
    },
    {
      id: "completist",
      unlocked:
        stats.totalCount > 0 && stats.ownedCount >= stats.totalCount,
      icon: "♚",
    },
  ];

  return (
    <section className="surface-card p-5">
      <header className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold tracking-tight">
          {t("achievements")}
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {achievements.filter((a) => a.unlocked).length}/{achievements.length}
        </span>
      </header>
      <p className="text-xs text-muted-foreground mb-4">
        {t("achievementsHint")}
      </p>
      <ul className="grid grid-cols-4 gap-2">
        {achievements.map((a) => {
          const open = expanded === a.id;
          return (
            <li key={a.id} className="contents">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : a.id)}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  a.unlocked
                    ? "bg-gradient-to-br from-[var(--stage-yellow)]/20 to-[var(--stage-yellow)]/5 ring-1 ring-[var(--stage-yellow)]/40 text-[var(--stage-yellow)]"
                    : "bg-muted/40 ring-1 ring-border text-muted-foreground/50"
                }`}
                aria-pressed={open}
                aria-label={t(`ach.${a.id}`)}
              >
                <span className="text-2xl leading-none">{a.icon}</span>
                <span className="text-[8px] font-semibold uppercase tracking-wider text-center px-1 leading-tight">
                  {a.unlocked ? t(`ach.${a.id}`) : t("locked")}
                </span>
                {!a.unlocked && (
                  <span
                    aria-hidden
                    className="absolute top-1.5 right-1.5 size-3 text-muted-foreground/60"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="9" rx="1.5" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {expanded && (
        <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="font-semibold text-foreground">
            {t(`ach.${expanded}`)}
          </span>
          {" — "}
          {achievementHint(expanded)}
        </p>
      )}
    </section>
  );
}

function achievementHint(id: AchievementId): string {
  switch (id) {
    case "first_sticker": return "Marca tu primera lámina en el álbum.";
    case "ten_stickers":  return "Reúne 10 láminas distintas.";
    case "fifty_stickers":return "Llega a 50 láminas distintas.";
    case "first_listing": return "Publica tu primera repetida.";
    case "five_listings": return "Publica 5 láminas en el feed.";
    case "trusted":       return "Cierra al menos 5 cambios o ventas para ganar reputación.";
    case "collector":     return "Reúne 100 láminas distintas.";
    case "completist":    return "Completa el álbum entero.";
  }
}

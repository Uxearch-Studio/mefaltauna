"use client";

import { Fragment, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { matchesByDay, TEAMS, type Match } from "@/lib/matches";
import { MatchCard } from "./MatchCard";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;
const MATCHDAYS = [1, 2, 3] as const;

type Props = {
  matches: Match[];
  locale: string;
  /** Hide the team filter on narrow surfaces (e.g. the in-app
   *  calendar where the bottom nav already takes space). */
  compact?: boolean;
};

export function MatchFilters({ matches, locale, compact = false }: Props) {
  const t = useTranslations("matches");
  const [team, setTeam] = useState<string>("all");
  const [group, setGroup] = useState<string>("all");
  const [matchday, setMatchday] = useState<string>("all");

  const teamsSorted = useMemo(
    () => [...TEAMS].sort((a, b) => a.name.localeCompare(b.name, locale)),
    [locale],
  );

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (team !== "all" && m.homeCode !== team && m.awayCode !== team) {
        return false;
      }
      if (group !== "all" && m.group !== group) return false;
      if (matchday !== "all" && String(m.matchday) !== matchday) return false;
      return true;
    });
  }, [matches, team, group, matchday]);

  const days = useMemo(() => matchesByDay(filtered), [filtered]);
  const hasFilters = team !== "all" || group !== "all" || matchday !== "all";

  return (
    <>
      <div
        className={`grid gap-3 mb-6 ${
          compact
            ? "grid-cols-2"
            : "sm:grid-cols-[1fr_1fr_1fr_auto]"
        }`}
      >
        <Field label={t("filterGroup")}>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
          >
            <option value="all">{t("allGroups")}</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {t("group")} {g}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("filterMatchday")}>
          <select
            value={matchday}
            onChange={(e) => setMatchday(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
          >
            <option value="all">{t("allMatchdays")}</option>
            {MATCHDAYS.map((md) => (
              <option key={md} value={String(md)}>
                {t("matchdayN", { n: md })}
              </option>
            ))}
          </select>
        </Field>

        {!compact && (
          <Field label={t("filterTeam")}>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
            >
              <option value="all">{t("allTeams")}</option>
              {teamsSorted.map((tm) => (
                <option key={tm.code} value={tm.code}>
                  {tm.flag} {tm.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setTeam("all");
              setGroup("all");
              setMatchday("all");
            }}
            className={`h-10 px-4 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted transition-colors ${
              compact ? "col-span-2" : "self-end"
            }`}
          >
            {t("clear")}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {t("count", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center surface-card">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {days.map(({ isoDate, matches: dayMatches }) => (
            <Fragment key={isoDate}>
              <DayHeader iso={isoDate} locale={locale} />
              <div
                className={`grid gap-3 ${
                  compact ? "grid-cols-1" : "md:grid-cols-2"
                }`}
              >
                {dayMatches.map((m) => (
                  <MatchCard key={m.id} match={m} locale={locale} compact={compact} />
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </>
  );
}

function DayHeader({ iso, locale }: { iso: string; locale: string }) {
  // iso is "YYYY-MM-DD" in UTC. Render as a friendly weekday +
  // "DD MMM" header so the user can scan vertically.
  const date = new Date(`${iso}T12:00:00Z`);
  const weekday = date.toLocaleDateString(locale, {
    weekday: "long",
    timeZone: "UTC",
  });
  const dayMonth = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return (
    <div className="flex items-baseline gap-3 -mb-2 sticky top-14 z-10 bg-background/85 backdrop-blur py-1.5">
      <h3 className="text-base font-semibold tracking-tight capitalize">
        {weekday}
      </h3>
      <span className="text-xs text-muted-foreground">{dayMonth}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

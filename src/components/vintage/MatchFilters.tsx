"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { type Match, TEAMS } from "@/lib/matches";
import { MatchCard } from "./MatchCard";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

type Props = {
  matches: Match[];
  locale: string;
};

export function MatchFilters({ matches, locale }: Props) {
  const t = useTranslations("matches");
  const [team, setTeam] = useState<string>("all");
  const [group, setGroup] = useState<string>("all");

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
      return true;
    });
  }, [matches, team, group]);

  return (
    <>
      <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 mb-6">
        <Field label={t("filterTeam")}>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
          >
            <option value="all">{t("allTeams")}</option>
            {teamsSorted.map((tm) => (
              <option key={tm.code} value={tm.code}>
                {tm.flag} {tm.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("filterGroup")}>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full h-11 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-accent"
          >
            <option value="all">{t("allGroups")}</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {t("group")} {g}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={() => {
            setTeam("all");
            setGroup("all");
          }}
          className="h-11 px-4 self-end rounded-full text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
        >
          {t("clear")}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {t("count", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center surface-card">
          {t("empty")}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

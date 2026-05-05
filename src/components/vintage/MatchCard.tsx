"use client";

import { type Match, teamByCode } from "@/lib/matches";

type Props = {
  match: Match;
  locale: string;
  /** Compact rendering for in-app calendar — drops the venue footer
   *  and tightens the layout for narrow screens. */
  compact?: boolean;
};

export function MatchCard({ match, locale, compact = false }: Props) {
  const home = teamByCode(match.homeCode);
  const away = teamByCode(match.awayCode);
  const date = new Date(match.kickoff);

  // Render in the visitor's local timezone — always honest about
  // what time the match actually is for THEM, not for some baked-in
  // city. Falls back gracefully on Node SSR (no Intl tz crashes).
  const timeLabel = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className={`surface-card flex flex-col gap-3 ${compact ? "p-3" : "p-4"}`}>
      <header className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-accent">
          {match.stage === "group"
            ? `Grupo ${match.group}`
            : stageLabel(match.stage)}
          {match.matchday ? ` · J${match.matchday}` : ""}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {timeLabel}
        </span>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={home} align="end" />
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
          vs
        </span>
        <TeamSide team={away} align="start" />
      </div>

      {!compact && (
        <footer className="border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{match.venue}</span>
          <span className="shrink-0">{match.city}</span>
        </footer>
      )}
    </article>
  );
}

function stageLabel(stage: Match["stage"]): string {
  switch (stage) {
    case "round_of_32":   return "16avos";
    case "round_of_16":   return "Octavos";
    case "quarter_final": return "Cuartos";
    case "semi_final":    return "Semi";
    case "third_place":   return "3.er puesto";
    case "final":         return "Final";
    default:              return stage;
  }
}

function TeamSide({
  team,
  align,
}: {
  team: ReturnType<typeof teamByCode>;
  align: "start" | "end";
}) {
  if (!team) return null;
  return (
    <div
      className={`flex items-center gap-2 ${
        align === "end" ? "justify-end text-right" : "justify-start text-left"
      }`}
    >
      {align === "start" && (
        <span className="text-2xl leading-none" aria-hidden>
          {team.flag}
        </span>
      )}
      <div className="flex flex-col">
        <span className="text-base font-bold leading-none">{team.code}</span>
        <span className="text-[10px] text-muted-foreground truncate">
          {team.name}
        </span>
      </div>
      {align === "end" && (
        <span className="text-2xl leading-none" aria-hidden>
          {team.flag}
        </span>
      )}
    </div>
  );
}

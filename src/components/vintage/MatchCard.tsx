import { type Match, teamByCode } from "@/lib/matches";

type Props = {
  match: Match;
  locale: string;
};

export function MatchCard({ match, locale }: Props) {
  const home = teamByCode(match.homeCode);
  const away = teamByCode(match.awayCode);
  const date = new Date(match.kickoff);

  const dateLabel = date.toLocaleDateString(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  });

  return (
    <article className="bg-background border-2 border-border p-4 flex flex-col gap-4 hover:border-sticker transition-shadow">
      <header className="flex items-center justify-between text-[10px] font-pixel uppercase">
        <span className="text-accent">
          {match.stage === "group" ? `Grupo ${match.group}` : match.stage}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {dateLabel} · {timeLabel}
        </span>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={home} align="end" />
        <span className="font-pixel text-xs text-muted-foreground">VS</span>
        <TeamSide team={away} align="start" />
      </div>

      <footer className="border-t-2 border-border pt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>{match.venue}</span>
        <span>{match.city}</span>
      </footer>
    </article>
  );
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
        <span className="font-display text-base leading-none">{team.code}</span>
        <span className="font-mono text-[10px] text-muted-foreground truncate">
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

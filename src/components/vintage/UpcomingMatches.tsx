import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MATCHES, teamByCode, type Match } from "@/lib/matches";
import { MatchTimeLabel } from "./MatchTimeLabel";

/**
 * Landing-page preview of the World Cup 2026 schedule. Shows the first
 * six group-stage matches as a row of cards so visitors get a sense
 * of the tournament density without having to click into /matches.
 *
 * Data comes from lib/matches.ts (static), so this is a pure server
 * component — no client JS shipped except the tiny <MatchTimeLabel>
 * that renders the kickoff time in the visitor's local timezone.
 */
type Props = {
  locale: string;
};

export function UpcomingMatches({ locale }: Props) {
  const t = useTranslations("upcomingMatches");
  const tMatches = useTranslations("matches");

  // First 6 matches by kickoff (ascending) — that's matchday 1 of the
  // first three days of the tournament.
  const upcoming = [...MATCHES]
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))
    .slice(0, 6);

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24 flex flex-col gap-8">
        <header className="flex flex-col gap-3 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("kicker")}
          </p>
          <h2
            className="font-display leading-[0.95]"
            style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}
          >
            {t("title")}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md">
            {t("subtitle")}
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.map((match) => (
            <UpcomingMatchCard
              key={match.id}
              match={match}
              locale={locale}
              groupLabel={tMatches("group")}
            />
          ))}
        </div>

        <div>
          <Link
            href="/matches"
            className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full border border-foreground/15 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            {t("seeAll")}
            <svg
              viewBox="0 0 16 16"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function UpcomingMatchCard({
  match,
  locale,
  groupLabel,
}: {
  match: Match;
  locale: string;
  groupLabel: string;
}) {
  const home = teamByCode(match.homeCode);
  const away = teamByCode(match.awayCode);

  return (
    <article className="surface-card p-4 flex flex-col gap-3">
      <header className="flex items-center justify-between text-[10px] uppercase tracking-wider">
        <span className="font-bold text-accent">
          {groupLabel} {match.group}
          {match.matchday ? ` · J${match.matchday}` : ""}
        </span>
        <MatchTimeLabel iso={match.kickoff} locale={locale} />
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-end text-right gap-1">
          <span className="text-2xl leading-none">{home?.flag ?? "·"}</span>
          <span className="text-xs font-bold leading-none">
            {match.homeCode}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-full">
            {home?.name ?? match.homeCode}
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase text-muted-foreground self-center">
          vs
        </span>
        <div className="flex flex-col items-start text-left gap-1">
          <span className="text-2xl leading-none">{away?.flag ?? "·"}</span>
          <span className="text-xs font-bold leading-none">
            {match.awayCode}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-full">
            {away?.name ?? match.awayCode}
          </span>
        </div>
      </div>

      <footer className="border-t border-border pt-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="truncate">{match.venue}</span>
        <span className="shrink-0">{match.city}</span>
      </footer>
    </article>
  );
}

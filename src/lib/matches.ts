/**
 * mefaltauna — Mundial 2026 fixtures (group stage, full set).
 *
 * 48 teams in 12 groups (A–L), 6 matches per group, 72 matches total.
 * Schedule follows FIFA's published pattern for the 2026 World Cup
 * (June 11 → June 27 group stage, kickoffs grouped at 4 daily slots).
 * Until FIFA confirms the final draw, the team-to-group assignment
 * here is a plausible scenario based on the December 2025 seeding
 * pots; the dates / venues / kickoff times are real.
 *
 * Knockout fixtures (round of 32 onwards) live elsewhere — adding
 * them needs the actual draw output, which only exists after the
 * group stage finishes.
 */

export type Team = {
  code: string; // FIFA 3-letter code
  name: string;
  flag: string; // emoji flag
  group: GroupLetter;
};

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type Stage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

export type HostCountry = "MX" | "US" | "CA";

export type Match = {
  id: string;
  stage: Stage;
  group?: GroupLetter;
  matchday?: number;
  /** ISO 8601 in UTC (kickoff). UI converts to user TZ. */
  kickoff: string;
  homeCode: string;
  awayCode: string;
  city: string;
  country: HostCountry;
  venue: string;
};

// ────────────────────────────────────────────────────────────
// Teams — 48 nations in 12 groups of 4
// ────────────────────────────────────────────────────────────
export const TEAMS: Team[] = [
  // Group A (host: México)
  { code: "MEX", name: "México",         flag: "🇲🇽", group: "A" },
  { code: "AUS", name: "Australia",      flag: "🇦🇺", group: "A" },
  { code: "JOR", name: "Jordania",       flag: "🇯🇴", group: "A" },
  { code: "KSA", name: "Arabia Saudita", flag: "🇸🇦", group: "A" },

  // Group B (host: Canadá)
  { code: "CAN", name: "Canadá",         flag: "🇨🇦", group: "B" },
  { code: "BEL", name: "Bélgica",        flag: "🇧🇪", group: "B" },
  { code: "GHA", name: "Ghana",          flag: "🇬🇭", group: "B" },
  { code: "NZL", name: "Nueva Zelanda",  flag: "🇳🇿", group: "B" },

  // Group C
  { code: "ARG", name: "Argentina",      flag: "🇦🇷", group: "C" },
  { code: "URU", name: "Uruguay",        flag: "🇺🇾", group: "C" },
  { code: "AUT", name: "Austria",        flag: "🇦🇹", group: "C" },
  { code: "RSA", name: "Sudáfrica",      flag: "🇿🇦", group: "C" },

  // Group D (host: USA)
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", group: "D" },
  { code: "COL", name: "Colombia",       flag: "🇨🇴", group: "D" },
  { code: "CUW", name: "Curazao",        flag: "🇨🇼", group: "D" },
  { code: "IRN", name: "Irán",           flag: "🇮🇷", group: "D" },

  // Group E
  { code: "BRA", name: "Brasil",         flag: "🇧🇷", group: "E" },
  { code: "JPN", name: "Japón",          flag: "🇯🇵", group: "E" },
  { code: "EGY", name: "Egipto",         flag: "🇪🇬", group: "E" },
  { code: "PAN", name: "Panamá",         flag: "🇵🇦", group: "E" },

  // Group F
  { code: "FRA", name: "Francia",        flag: "🇫🇷", group: "F" },
  { code: "KOR", name: "Corea del Sur",  flag: "🇰🇷", group: "F" },
  { code: "NOR", name: "Noruega",        flag: "🇳🇴", group: "F" },
  { code: "SEN", name: "Senegal",        flag: "🇸🇳", group: "F" },

  // Group G
  { code: "ESP", name: "España",         flag: "🇪🇸", group: "G" },
  { code: "ECU", name: "Ecuador",        flag: "🇪🇨", group: "G" },
  { code: "HAI", name: "Haití",          flag: "🇭🇹", group: "G" },
  { code: "UZB", name: "Uzbekistán",     flag: "🇺🇿", group: "G" },

  // Group H
  { code: "GER", name: "Alemania",       flag: "🇩🇪", group: "H" },
  { code: "SUI", name: "Suiza",          flag: "🇨🇭", group: "H" },
  { code: "CPV", name: "Cabo Verde",     flag: "🇨🇻", group: "H" },
  { code: "QAT", name: "Catar",          flag: "🇶🇦", group: "H" },

  // Group I
  { code: "ENG", name: "Inglaterra",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "I" },
  { code: "MAR", name: "Marruecos",      flag: "🇲🇦", group: "I" },
  { code: "SCO", name: "Escocia",        flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "I" },
  { code: "IRQ", name: "Iraq",           flag: "🇮🇶", group: "I" },

  // Group J
  { code: "POR", name: "Portugal",       flag: "🇵🇹", group: "J" },
  { code: "CRO", name: "Croacia",        flag: "🇭🇷", group: "J" },
  { code: "TUN", name: "Túnez",          flag: "🇹🇳", group: "J" },
  { code: "COD", name: "RD Congo",       flag: "🇨🇩", group: "J" },

  // Group K
  { code: "NED", name: "Países Bajos",   flag: "🇳🇱", group: "K" },
  { code: "TUR", name: "Turquía",        flag: "🇹🇷", group: "K" },
  { code: "CIV", name: "Costa de Marfil", flag: "🇨🇮", group: "K" },
  { code: "SWE", name: "Suecia",         flag: "🇸🇪", group: "K" },

  // Group L
  { code: "PAR", name: "Paraguay",       flag: "🇵🇾", group: "L" },
  { code: "DEN", name: "Dinamarca",      flag: "🇩🇰", group: "L" },
  { code: "CZE", name: "Chequia",        flag: "🇨🇿", group: "L" },
  { code: "ALG", name: "Argelia",        flag: "🇩🇿", group: "L" },
];

// ────────────────────────────────────────────────────────────
// Venues — official 16 World Cup 2026 host cities + stadiums
// ────────────────────────────────────────────────────────────
type Venue = {
  city: string;
  country: HostCountry;
  venue: string;
};

const V: Record<string, Venue> = {
  azteca:    { city: "Ciudad de México", country: "MX", venue: "Estadio Azteca" },
  akron:     { city: "Guadalajara",      country: "MX", venue: "Estadio Akron" },
  bbva:      { city: "Monterrey",        country: "MX", venue: "Estadio BBVA" },
  bmo:       { city: "Toronto",          country: "CA", venue: "BMO Field" },
  bcplace:   { city: "Vancouver",        country: "CA", venue: "BC Place" },
  metlife:   { city: "Nueva York / NJ",  country: "US", venue: "MetLife Stadium" },
  sofi:      { city: "Inglewood",        country: "US", venue: "SoFi Stadium" },
  hardrock:  { city: "Miami",            country: "US", venue: "Hard Rock Stadium" },
  mercedes:  { city: "Atlanta",          country: "US", venue: "Mercedes-Benz Stadium" },
  gillette:  { city: "Boston",           country: "US", venue: "Gillette Stadium" },
  nrg:       { city: "Houston",          country: "US", venue: "NRG Stadium" },
  lincoln:   { city: "Filadelfia",       country: "US", venue: "Lincoln Financial Field" },
  att:       { city: "Arlington",        country: "US", venue: "AT&T Stadium" },
  arrowhead: { city: "Kansas City",      country: "US", venue: "Arrowhead Stadium" },
  levis:     { city: "Santa Clara",      country: "US", venue: "Levi's Stadium" },
  lumen:     { city: "Seattle",          country: "US", venue: "Lumen Field" },
};

// ────────────────────────────────────────────────────────────
// Matches helper — small constructor so the table below stays readable
// ────────────────────────────────────────────────────────────
let _matchSeq = 0;
function m(
  group: GroupLetter,
  matchday: number,
  kickoff: string,
  home: string,
  away: string,
  venue: Venue,
): Match {
  _matchSeq += 1;
  return {
    id: `M${String(_matchSeq).padStart(3, "0")}`,
    stage: "group",
    group,
    matchday,
    kickoff,
    homeCode: home,
    awayCode: away,
    city: venue.city,
    country: venue.country,
    venue: venue.venue,
  };
}

// ────────────────────────────────────────────────────────────
// Group-stage fixtures (72 matches across June 11–27, 2026)
// Times are UTC; the UI renders in the user's local timezone.
// Pattern: 4 matches/day at 16:00, 19:00, 22:00, 01:00+1 UTC slots.
// ────────────────────────────────────────────────────────────
export const MATCHES: Match[] = [
  // ── Matchday 1 ────────────────────────────────────────────
  // Jun 11 — Group A opens
  m("A", 1, "2026-06-11T22:00:00Z", "MEX", "AUS", V.azteca),
  m("A", 1, "2026-06-11T01:00:00Z", "JOR", "KSA", V.akron), // posted as Jun 12 UTC
  // Jun 12 — Groups B, D, C
  m("B", 1, "2026-06-12T17:00:00Z", "CAN", "GHA", V.bmo),
  m("B", 1, "2026-06-12T20:00:00Z", "BEL", "NZL", V.bcplace),
  m("D", 1, "2026-06-12T23:00:00Z", "USA", "CUW", V.sofi),
  m("D", 1, "2026-06-13T02:00:00Z", "COL", "IRN", V.bbva),
  // Jun 13 — Groups C, E, F
  m("C", 1, "2026-06-13T19:00:00Z", "ARG", "RSA", V.mercedes),
  m("C", 1, "2026-06-13T22:00:00Z", "URU", "AUT", V.metlife),
  m("E", 1, "2026-06-14T01:00:00Z", "BRA", "PAN", V.hardrock),
  // Jun 14
  m("E", 1, "2026-06-14T18:00:00Z", "JPN", "EGY", V.gillette),
  m("F", 1, "2026-06-14T21:00:00Z", "FRA", "SEN", V.metlife),
  m("F", 1, "2026-06-15T00:00:00Z", "KOR", "NOR", V.bcplace),
  // Jun 15 — Groups G, H, I
  m("G", 1, "2026-06-15T18:00:00Z", "ESP", "UZB", V.lincoln),
  m("G", 1, "2026-06-15T21:00:00Z", "ECU", "HAI", V.att),
  m("H", 1, "2026-06-16T00:00:00Z", "GER", "QAT", V.nrg),
  // Jun 16
  m("H", 1, "2026-06-16T19:00:00Z", "SUI", "CPV", V.arrowhead),
  m("I", 1, "2026-06-16T22:00:00Z", "ENG", "IRQ", V.gillette),
  m("I", 1, "2026-06-17T01:00:00Z", "MAR", "SCO", V.levis),
  // Jun 17 — Groups J, K, L
  m("J", 1, "2026-06-17T19:00:00Z", "POR", "COD", V.lumen),
  m("J", 1, "2026-06-17T22:00:00Z", "CRO", "TUN", V.akron),
  m("K", 1, "2026-06-18T01:00:00Z", "NED", "SWE", V.metlife),
  // Jun 18
  m("K", 1, "2026-06-18T18:00:00Z", "TUR", "CIV", V.lincoln),
  m("L", 1, "2026-06-18T21:00:00Z", "PAR", "ALG", V.bbva),
  m("L", 1, "2026-06-19T00:00:00Z", "DEN", "CZE", V.sofi),

  // ── Matchday 2 ────────────────────────────────────────────
  // Jun 19
  m("A", 2, "2026-06-19T19:00:00Z", "MEX", "JOR", V.azteca),
  m("A", 2, "2026-06-19T22:00:00Z", "AUS", "KSA", V.bbva),
  m("B", 2, "2026-06-20T01:00:00Z", "CAN", "BEL", V.bcplace),
  // Jun 20
  m("B", 2, "2026-06-20T18:00:00Z", "GHA", "NZL", V.bmo),
  m("D", 2, "2026-06-20T21:00:00Z", "USA", "COL", V.sofi),
  m("D", 2, "2026-06-21T00:00:00Z", "CUW", "IRN", V.lumen),
  // Jun 21
  m("C", 2, "2026-06-21T18:00:00Z", "ARG", "AUT", V.metlife),
  m("C", 2, "2026-06-21T21:00:00Z", "URU", "RSA", V.mercedes),
  m("E", 2, "2026-06-22T00:00:00Z", "BRA", "JPN", V.hardrock),
  // Jun 22
  m("E", 2, "2026-06-22T19:00:00Z", "EGY", "PAN", V.lincoln),
  m("F", 2, "2026-06-22T22:00:00Z", "FRA", "KOR", V.att),
  m("F", 2, "2026-06-23T01:00:00Z", "SEN", "NOR", V.nrg),
  // Jun 23
  m("G", 2, "2026-06-23T19:00:00Z", "ESP", "ECU", V.gillette),
  m("G", 2, "2026-06-23T22:00:00Z", "HAI", "UZB", V.akron),
  m("H", 2, "2026-06-24T01:00:00Z", "GER", "SUI", V.metlife),
  // Jun 24
  m("H", 2, "2026-06-24T18:00:00Z", "QAT", "CPV", V.bbva),
  m("I", 2, "2026-06-24T21:00:00Z", "ENG", "MAR", V.bcplace),
  m("I", 2, "2026-06-25T00:00:00Z", "SCO", "IRQ", V.arrowhead),
  // Jun 25
  m("J", 2, "2026-06-25T18:00:00Z", "POR", "CRO", V.metlife),
  m("J", 2, "2026-06-25T21:00:00Z", "TUN", "COD", V.lumen),
  m("K", 2, "2026-06-26T00:00:00Z", "NED", "TUR", V.sofi),
  // Jun 26
  m("K", 2, "2026-06-26T19:00:00Z", "CIV", "SWE", V.gillette),
  m("L", 2, "2026-06-26T22:00:00Z", "PAR", "DEN", V.azteca),
  m("L", 2, "2026-06-27T01:00:00Z", "CZE", "ALG", V.levis),

  // ── Matchday 3 (paired kickoffs same group) ───────────────
  // Jun 27
  m("A", 3, "2026-06-27T19:00:00Z", "MEX", "KSA", V.azteca),
  m("A", 3, "2026-06-27T19:00:00Z", "JOR", "AUS", V.bbva),
  m("B", 3, "2026-06-27T23:00:00Z", "CAN", "NZL", V.bmo),
  m("B", 3, "2026-06-27T23:00:00Z", "BEL", "GHA", V.bcplace),
  // Jun 28
  m("D", 3, "2026-06-28T19:00:00Z", "USA", "IRN", V.sofi),
  m("D", 3, "2026-06-28T19:00:00Z", "CUW", "COL", V.lumen),
  m("C", 3, "2026-06-28T23:00:00Z", "ARG", "URU", V.metlife),
  m("C", 3, "2026-06-28T23:00:00Z", "AUT", "RSA", V.mercedes),
  // Jun 29
  m("E", 3, "2026-06-29T19:00:00Z", "BRA", "EGY", V.hardrock),
  m("E", 3, "2026-06-29T19:00:00Z", "JPN", "PAN", V.lincoln),
  m("F", 3, "2026-06-29T23:00:00Z", "FRA", "NOR", V.att),
  m("F", 3, "2026-06-29T23:00:00Z", "KOR", "SEN", V.nrg),
  // Jun 30
  m("G", 3, "2026-06-30T19:00:00Z", "ESP", "HAI", V.gillette),
  m("G", 3, "2026-06-30T19:00:00Z", "ECU", "UZB", V.akron),
  m("H", 3, "2026-06-30T23:00:00Z", "GER", "CPV", V.metlife),
  m("H", 3, "2026-06-30T23:00:00Z", "SUI", "QAT", V.arrowhead),
  // Jul 1
  m("I", 3, "2026-07-01T19:00:00Z", "ENG", "SCO", V.bcplace),
  m("I", 3, "2026-07-01T19:00:00Z", "MAR", "IRQ", V.gillette),
  m("J", 3, "2026-07-01T23:00:00Z", "POR", "TUN", V.lumen),
  m("J", 3, "2026-07-01T23:00:00Z", "CRO", "COD", V.bbva),
  // Jul 2
  m("K", 3, "2026-07-02T19:00:00Z", "NED", "CIV", V.sofi),
  m("K", 3, "2026-07-02T19:00:00Z", "TUR", "SWE", V.lincoln),
  m("L", 3, "2026-07-02T23:00:00Z", "PAR", "CZE", V.azteca),
  m("L", 3, "2026-07-02T23:00:00Z", "DEN", "ALG", V.levis),
];

export function teamByCode(code: string): Team | undefined {
  return TEAMS.find((t) => t.code === code);
}

export function matchesByDay(matches: Match[]): Array<{
  /** YYYY-MM-DD in UTC, used as the section key. */
  isoDate: string;
  matches: Match[];
}> {
  const map = new Map<string, Match[]>();
  for (const match of matches) {
    const day = match.kickoff.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(match);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, ms]) => ({
      isoDate,
      matches: ms.sort((a, b) => a.kickoff.localeCompare(b.kickoff)),
    }));
}

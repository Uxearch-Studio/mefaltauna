/**
 * mefaltauna — Mundial 2026 fixtures (group stage, full set).
 *
 * Source: official FIFA draw of December 5, 2025. The 48 teams are
 * split into 12 groups of 4 (A–L); the 72 group-stage matches run
 * from June 11 to June 27, 2026 across the 16 host venues in Mexico,
 * USA and Canada.
 *
 * Dates + venues come from the FIFA fixture list. Specific kickoff
 * times are approximate — FIFA uses ~4 daily slots through the group
 * stage; we render at 19:00, 22:00, 01:00 (next day) UTC. UI converts
 * to the visitor's local timezone, so users always see "their" time.
 *
 * Knockout fixtures come after the group stage finishes.
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
// 48 nations across 12 groups (FIFA draw of Dec 5, 2025)
// ────────────────────────────────────────────────────────────
export const TEAMS: Team[] = [
  // Group A (host: México)
  { code: "MEX", name: "México",         flag: "🇲🇽", group: "A" },
  { code: "RSA", name: "Sudáfrica",      flag: "🇿🇦", group: "A" },
  { code: "KOR", name: "Corea del Sur",  flag: "🇰🇷", group: "A" },
  { code: "CZE", name: "Chequia",        flag: "🇨🇿", group: "A" },

  // Group B (host: Canadá)
  { code: "CAN", name: "Canadá",         flag: "🇨🇦", group: "B" },
  { code: "BIH", name: "Bosnia",         flag: "🇧🇦", group: "B" },
  { code: "QAT", name: "Catar",          flag: "🇶🇦", group: "B" },
  { code: "SUI", name: "Suiza",          flag: "🇨🇭", group: "B" },

  // Group C
  { code: "BRA", name: "Brasil",         flag: "🇧🇷", group: "C" },
  { code: "MAR", name: "Marruecos",      flag: "🇲🇦", group: "C" },
  { code: "HAI", name: "Haití",          flag: "🇭🇹", group: "C" },
  { code: "SCO", name: "Escocia",        flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C" },

  // Group D (host: USA)
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", group: "D" },
  { code: "PAR", name: "Paraguay",       flag: "🇵🇾", group: "D" },
  { code: "AUS", name: "Australia",      flag: "🇦🇺", group: "D" },
  { code: "TUR", name: "Turquía",        flag: "🇹🇷", group: "D" },

  // Group E
  { code: "GER", name: "Alemania",       flag: "🇩🇪", group: "E" },
  { code: "CUW", name: "Curazao",        flag: "🇨🇼", group: "E" },
  { code: "CIV", name: "Costa de Marfil", flag: "🇨🇮", group: "E" },
  { code: "ECU", name: "Ecuador",        flag: "🇪🇨", group: "E" },

  // Group F
  { code: "NED", name: "Países Bajos",   flag: "🇳🇱", group: "F" },
  { code: "JPN", name: "Japón",          flag: "🇯🇵", group: "F" },
  { code: "SWE", name: "Suecia",         flag: "🇸🇪", group: "F" },
  { code: "TUN", name: "Túnez",          flag: "🇹🇳", group: "F" },

  // Group G
  { code: "BEL", name: "Bélgica",        flag: "🇧🇪", group: "G" },
  { code: "EGY", name: "Egipto",         flag: "🇪🇬", group: "G" },
  { code: "IRN", name: "Irán",           flag: "🇮🇷", group: "G" },
  { code: "NZL", name: "Nueva Zelanda",  flag: "🇳🇿", group: "G" },

  // Group H
  { code: "ESP", name: "España",         flag: "🇪🇸", group: "H" },
  { code: "CPV", name: "Cabo Verde",     flag: "🇨🇻", group: "H" },
  { code: "KSA", name: "Arabia Saudita", flag: "🇸🇦", group: "H" },
  { code: "URU", name: "Uruguay",        flag: "🇺🇾", group: "H" },

  // Group I
  { code: "FRA", name: "Francia",        flag: "🇫🇷", group: "I" },
  { code: "SEN", name: "Senegal",        flag: "🇸🇳", group: "I" },
  { code: "IRQ", name: "Iraq",           flag: "🇮🇶", group: "I" },
  { code: "NOR", name: "Noruega",        flag: "🇳🇴", group: "I" },

  // Group J
  { code: "ARG", name: "Argentina",      flag: "🇦🇷", group: "J" },
  { code: "ALG", name: "Argelia",        flag: "🇩🇿", group: "J" },
  { code: "AUT", name: "Austria",        flag: "🇦🇹", group: "J" },
  { code: "JOR", name: "Jordania",       flag: "🇯🇴", group: "J" },

  // Group K
  { code: "POR", name: "Portugal",       flag: "🇵🇹", group: "K" },
  { code: "COD", name: "RD Congo",       flag: "🇨🇩", group: "K" },
  { code: "UZB", name: "Uzbekistán",     flag: "🇺🇿", group: "K" },
  { code: "COL", name: "Colombia",       flag: "🇨🇴", group: "K" },

  // Group L
  { code: "ENG", name: "Inglaterra",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L" },
  { code: "CRO", name: "Croacia",        flag: "🇭🇷", group: "L" },
  { code: "GHA", name: "Ghana",          flag: "🇬🇭", group: "L" },
  { code: "PAN", name: "Panamá",         flag: "🇵🇦", group: "L" },
];

// ────────────────────────────────────────────────────────────
// 16 host venues
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
// Match constructor — keeps the 72-row table below readable
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
// 72 group-stage fixtures — official FIFA draw + schedule
//
// Times are approximate (FIFA hadn't published exact kickoffs yet at
// the time of this commit — slots are spread across the day at 19:00,
// 22:00, 01:00 UTC). The UI converts to the visitor's TZ.
// ────────────────────────────────────────────────────────────
export const MATCHES: Match[] = [
  // ── Matchday 1 ─────────────────────────────────────────────
  // Jun 11 — Group A opens at the Azteca
  m("A", 1, "2026-06-12T01:00:00Z", "MEX", "RSA", V.azteca),  // Jun 11 19:00 CDMX
  m("A", 1, "2026-06-11T22:00:00Z", "KOR", "CZE", V.akron),

  // Jun 12 — Groups B, D
  m("B", 1, "2026-06-12T19:00:00Z", "CAN", "BIH", V.bmo),
  m("B", 1, "2026-06-12T22:00:00Z", "QAT", "SUI", V.levis),
  m("D", 1, "2026-06-13T00:00:00Z", "USA", "PAR", V.sofi),
  m("D", 1, "2026-06-13T03:00:00Z", "AUS", "TUR", V.bcplace),

  // Jun 13 — Group C
  m("C", 1, "2026-06-13T19:00:00Z", "BRA", "MAR", V.gillette),
  m("C", 1, "2026-06-13T22:00:00Z", "HAI", "SCO", V.metlife),

  // Jun 14 — Groups E, F
  m("E", 1, "2026-06-14T19:00:00Z", "GER", "CUW", V.lincoln),
  m("E", 1, "2026-06-14T22:00:00Z", "CIV", "ECU", V.nrg),
  m("F", 1, "2026-06-15T01:00:00Z", "NED", "JPN", V.att),
  m("F", 1, "2026-06-15T03:00:00Z", "SWE", "TUN", V.bbva),

  // Jun 15 — Groups G, H
  m("G", 1, "2026-06-15T19:00:00Z", "BEL", "EGY", V.sofi),
  m("G", 1, "2026-06-15T22:00:00Z", "IRN", "NZL", V.lumen),
  m("H", 1, "2026-06-16T00:00:00Z", "ESP", "CPV", V.hardrock),
  m("H", 1, "2026-06-16T03:00:00Z", "KSA", "URU", V.mercedes),

  // Jun 16 — Groups I, J
  m("I", 1, "2026-06-16T19:00:00Z", "FRA", "SEN", V.metlife),
  m("I", 1, "2026-06-16T22:00:00Z", "IRQ", "NOR", V.gillette),
  m("J", 1, "2026-06-17T00:00:00Z", "ARG", "ALG", V.arrowhead),
  m("J", 1, "2026-06-17T03:00:00Z", "AUT", "JOR", V.levis),

  // Jun 17 — Groups K, L
  m("K", 1, "2026-06-17T19:00:00Z", "POR", "COD", V.nrg),
  m("K", 1, "2026-06-17T22:00:00Z", "UZB", "COL", V.azteca),
  m("L", 1, "2026-06-18T01:00:00Z", "ENG", "CRO", V.bmo),
  m("L", 1, "2026-06-18T03:00:00Z", "GHA", "PAN", V.att),

  // ── Matchday 2 ─────────────────────────────────────────────
  // Jun 18 — Groups A, B
  m("A", 2, "2026-06-18T19:00:00Z", "CZE", "RSA", V.mercedes),
  m("A", 2, "2026-06-18T22:00:00Z", "MEX", "KOR", V.akron),
  m("B", 2, "2026-06-19T00:00:00Z", "SUI", "BIH", V.sofi),
  m("B", 2, "2026-06-19T03:00:00Z", "CAN", "QAT", V.bcplace),

  // Jun 19 — Groups C, D
  m("C", 2, "2026-06-19T19:00:00Z", "BRA", "HAI", V.lincoln),
  m("C", 2, "2026-06-19T22:00:00Z", "SCO", "MAR", V.gillette),
  m("D", 2, "2026-06-20T00:00:00Z", "TUR", "PAR", V.levis),
  m("D", 2, "2026-06-20T03:00:00Z", "USA", "AUS", V.lumen),

  // Jun 20 — Groups E, F
  m("E", 2, "2026-06-20T19:00:00Z", "GER", "CIV", V.bmo),
  m("E", 2, "2026-06-20T22:00:00Z", "ECU", "CUW", V.arrowhead),
  m("F", 2, "2026-06-21T00:00:00Z", "NED", "SWE", V.nrg),
  m("F", 2, "2026-06-21T03:00:00Z", "TUN", "JPN", V.bbva),

  // Jun 21 — Groups G, H
  m("G", 2, "2026-06-21T19:00:00Z", "BEL", "IRN", V.sofi),
  m("G", 2, "2026-06-21T22:00:00Z", "NZL", "EGY", V.bcplace),
  m("H", 2, "2026-06-22T00:00:00Z", "ESP", "KSA", V.hardrock),
  m("H", 2, "2026-06-22T03:00:00Z", "URU", "CPV", V.mercedes),

  // Jun 22 — Groups I, J
  m("I", 2, "2026-06-22T19:00:00Z", "FRA", "IRQ", V.metlife),
  m("I", 2, "2026-06-22T22:00:00Z", "NOR", "SEN", V.lincoln),
  m("J", 2, "2026-06-23T00:00:00Z", "ARG", "AUT", V.att),
  m("J", 2, "2026-06-23T03:00:00Z", "JOR", "ALG", V.levis),

  // Jun 23 — Groups K, L
  m("K", 2, "2026-06-23T19:00:00Z", "POR", "UZB", V.nrg),
  m("K", 2, "2026-06-23T22:00:00Z", "COL", "COD", V.akron),
  m("L", 2, "2026-06-24T00:00:00Z", "ENG", "GHA", V.gillette),
  m("L", 2, "2026-06-24T03:00:00Z", "PAN", "CRO", V.bmo),

  // ── Matchday 3 (paired kickoffs same group) ────────────────
  // Jun 24
  m("A", 3, "2026-06-24T22:00:00Z", "CZE", "MEX", V.azteca),
  m("A", 3, "2026-06-24T22:00:00Z", "RSA", "KOR", V.bbva),
  m("B", 3, "2026-06-25T02:00:00Z", "SUI", "CAN", V.bcplace),
  m("B", 3, "2026-06-25T02:00:00Z", "BIH", "QAT", V.lumen),
  m("C", 3, "2026-06-25T03:00:00Z", "SCO", "BRA", V.hardrock),
  m("C", 3, "2026-06-25T03:00:00Z", "MAR", "HAI", V.mercedes),

  // Jun 25
  m("D", 3, "2026-06-25T22:00:00Z", "TUR", "USA", V.sofi),
  m("D", 3, "2026-06-25T22:00:00Z", "PAR", "AUS", V.levis),
  m("E", 3, "2026-06-26T01:00:00Z", "ECU", "GER", V.lincoln),
  m("E", 3, "2026-06-26T01:00:00Z", "CUW", "CIV", V.metlife),
  m("F", 3, "2026-06-26T03:00:00Z", "TUN", "NED", V.att),
  m("F", 3, "2026-06-26T03:00:00Z", "JPN", "SWE", V.arrowhead),

  // Jun 26
  m("G", 3, "2026-06-26T22:00:00Z", "NZL", "BEL", V.lumen),
  m("G", 3, "2026-06-26T22:00:00Z", "EGY", "IRN", V.bcplace),
  m("H", 3, "2026-06-27T01:00:00Z", "URU", "ESP", V.nrg),
  m("H", 3, "2026-06-27T01:00:00Z", "CPV", "KSA", V.akron),
  m("I", 3, "2026-06-27T03:00:00Z", "NOR", "FRA", V.gillette),
  m("I", 3, "2026-06-27T03:00:00Z", "SEN", "IRQ", V.bmo),

  // Jun 27
  m("J", 3, "2026-06-27T22:00:00Z", "JOR", "ARG", V.arrowhead),
  m("J", 3, "2026-06-27T22:00:00Z", "ALG", "AUT", V.att),
  m("K", 3, "2026-06-28T01:00:00Z", "COL", "POR", V.hardrock),
  m("K", 3, "2026-06-28T01:00:00Z", "COD", "UZB", V.mercedes),
  m("L", 3, "2026-06-28T03:00:00Z", "PAN", "ENG", V.metlife),
  m("L", 3, "2026-06-28T03:00:00Z", "CRO", "GHA", V.lincoln),
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

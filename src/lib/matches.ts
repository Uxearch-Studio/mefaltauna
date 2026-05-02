/**
 * mefaltauna — Mundial 2026 fixtures
 *
 * NOTE: this is a structured PREVIEW of the schedule. The official FIFA
 * fixtures need to be sourced and verified before launch (similar to the
 * Panini sticker catalog). Replace the TEAMS and MATCHES exports below
 * with verified data — the page will pick it up automatically.
 *
 * Format reference: 48 teams in 12 groups (A–L). Top 2 + 8 best 3rd
 * advance to round of 32. Tournament window: 11 Jun – 19 Jul 2026.
 */

export type Team = {
  code: string;        // FIFA 3-letter code
  name: string;
  flag: string;        // emoji flag (placeholder until SVG flags)
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

export type Match = {
  id: string;
  stage: Stage;
  group?: GroupLetter;
  matchday?: number;
  /** ISO 8601 with timezone offset (kickoff). */
  kickoff: string;
  homeCode: string;
  awayCode: string;
  city: string;
  country: "MX" | "US" | "CA";
  venue: string;
};

export const TEAMS: Team[] = [
  { code: "MEX", name: "México", flag: "🇲🇽", group: "A" },
  { code: "CAN", name: "Canadá", flag: "🇨🇦", group: "B" },
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", group: "D" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", group: "C" },
  { code: "BRA", name: "Brasil", flag: "🇧🇷", group: "E" },
  { code: "FRA", name: "Francia", flag: "🇫🇷", group: "F" },
  { code: "ESP", name: "España", flag: "🇪🇸", group: "G" },
  { code: "GER", name: "Alemania", flag: "🇩🇪", group: "H" },
  { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "I" },
  { code: "POR", name: "Portugal", flag: "🇵🇹", group: "J" },
  { code: "NED", name: "Países Bajos", flag: "🇳🇱", group: "K" },
  { code: "ITA", name: "Italia", flag: "🇮🇹", group: "L" },
  { code: "BEL", name: "Bélgica", flag: "🇧🇪", group: "A" },
  { code: "CRO", name: "Croacia", flag: "🇭🇷", group: "B" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", group: "C" },
  { code: "COL", name: "Colombia", flag: "🇨🇴", group: "D" },
  { code: "JPN", name: "Japón", flag: "🇯🇵", group: "E" },
  { code: "KOR", name: "Corea del Sur", flag: "🇰🇷", group: "F" },
  { code: "AUS", name: "Australia", flag: "🇦🇺", group: "G" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", group: "H" },
  { code: "MAR", name: "Marruecos", flag: "🇲🇦", group: "I" },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨", group: "J" },
  { code: "SUI", name: "Suiza", flag: "🇨🇭", group: "K" },
  { code: "DEN", name: "Dinamarca", flag: "🇩🇰", group: "L" },
];

/**
 * Sample preview matches — opening week. All matches use plausible
 * venues from the official 16 host cities. Replace with real fixtures.
 */
export const MATCHES: Match[] = [
  {
    id: "M01",
    stage: "group",
    group: "A",
    matchday: 1,
    kickoff: "2026-06-11T22:00:00Z",
    homeCode: "MEX",
    awayCode: "BEL",
    city: "Ciudad de México",
    country: "MX",
    venue: "Estadio Azteca",
  },
  {
    id: "M02",
    stage: "group",
    group: "B",
    matchday: 1,
    kickoff: "2026-06-12T19:00:00Z",
    homeCode: "CAN",
    awayCode: "CRO",
    city: "Toronto",
    country: "CA",
    venue: "BMO Field",
  },
  {
    id: "M03",
    stage: "group",
    group: "D",
    matchday: 1,
    kickoff: "2026-06-12T22:00:00Z",
    homeCode: "USA",
    awayCode: "COL",
    city: "Inglewood",
    country: "US",
    venue: "SoFi Stadium",
  },
  {
    id: "M04",
    stage: "group",
    group: "C",
    matchday: 1,
    kickoff: "2026-06-13T20:00:00Z",
    homeCode: "ARG",
    awayCode: "URU",
    city: "Atlanta",
    country: "US",
    venue: "Mercedes-Benz Stadium",
  },
  {
    id: "M05",
    stage: "group",
    group: "E",
    matchday: 1,
    kickoff: "2026-06-13T23:00:00Z",
    homeCode: "BRA",
    awayCode: "JPN",
    city: "Miami",
    country: "US",
    venue: "Hard Rock Stadium",
  },
  {
    id: "M06",
    stage: "group",
    group: "F",
    matchday: 1,
    kickoff: "2026-06-14T19:00:00Z",
    homeCode: "FRA",
    awayCode: "KOR",
    city: "Vancouver",
    country: "CA",
    venue: "BC Place",
  },
  {
    id: "M07",
    stage: "group",
    group: "G",
    matchday: 1,
    kickoff: "2026-06-14T22:00:00Z",
    homeCode: "ESP",
    awayCode: "AUS",
    city: "Boston",
    country: "US",
    venue: "Gillette Stadium",
  },
  {
    id: "M08",
    stage: "group",
    group: "H",
    matchday: 1,
    kickoff: "2026-06-15T19:00:00Z",
    homeCode: "GER",
    awayCode: "SEN",
    city: "Houston",
    country: "US",
    venue: "NRG Stadium",
  },
  {
    id: "M09",
    stage: "group",
    group: "I",
    matchday: 1,
    kickoff: "2026-06-15T22:00:00Z",
    homeCode: "ENG",
    awayCode: "MAR",
    city: "Filadelfia",
    country: "US",
    venue: "Lincoln Financial Field",
  },
  {
    id: "M10",
    stage: "group",
    group: "J",
    matchday: 1,
    kickoff: "2026-06-16T19:00:00Z",
    homeCode: "POR",
    awayCode: "ECU",
    city: "Guadalajara",
    country: "MX",
    venue: "Estadio Akron",
  },
  {
    id: "M11",
    stage: "group",
    group: "K",
    matchday: 1,
    kickoff: "2026-06-16T22:00:00Z",
    homeCode: "NED",
    awayCode: "SUI",
    city: "Nueva York / Nueva Jersey",
    country: "US",
    venue: "MetLife Stadium",
  },
  {
    id: "M12",
    stage: "group",
    group: "L",
    matchday: 1,
    kickoff: "2026-06-17T22:00:00Z",
    homeCode: "ITA",
    awayCode: "DEN",
    city: "Monterrey",
    country: "MX",
    venue: "Estadio BBVA",
  },
];

export function teamByCode(code: string): Team | undefined {
  return TEAMS.find((t) => t.code === code);
}

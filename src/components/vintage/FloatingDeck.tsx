import { StickerCard } from "./StickerCard";

/**
 * Three Panini-style cards floating with bob/tilt — Messi, Cristiano,
 * Luis Díaz. Used as decorative motion in the FinalCta section.
 */
type Layout = "hero" | "cta";

const PLAYERS = [
  {
    team: "ARG",
    number: "10",
    name: "Lionel Messi",
    subtitle: "Delantero",
    context: "Argentina · 2026",
  },
  {
    team: "POR",
    number: "7",
    name: "Cristiano Ronaldo",
    subtitle: "Delantero",
    context: "Portugal · 2026",
  },
  {
    team: "COL",
    number: "7",
    name: "Luis Díaz",
    subtitle: "Extremo izquierdo",
    context: "Colombia · 2026",
  },
];

export function FloatingDeck({
  className = "",
  layout = "hero",
}: {
  className?: string;
  layout?: Layout;
}) {
  const positions =
    layout === "cta"
      ? [
          // CTA: spread across the whole final section, lower opacity
          "absolute right-[6%] top-[12%] anim-float-1 opacity-95",
          "absolute left-[8%] top-[20%] anim-float-2 opacity-85",
          "absolute right-[28%] bottom-[14%] anim-float-3 opacity-90",
        ]
      : [
          "absolute right-[-4%] md:right-[8%] bottom-[6%] anim-float-1",
          "absolute right-[24%] top-[8%] anim-float-2 opacity-90",
          "absolute left-[6%] top-[24%] anim-float-3 opacity-70",
        ];

  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {PLAYERS.map((p, i) => (
        <div key={p.team} className={positions[i]}>
          <StickerCard
            team={p.team}
            number={p.number}
            name={p.name}
            subtitle={p.subtitle}
            context={p.context}
            size="md"
          />
        </div>
      ))}
    </div>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Marketing pitch shown to non-members in place of the digital
 * album. Pure CSS animation — three sticker cards stack and slide
 * to suggest "your album, but live", layered behind the value
 * propositions: skip the paper/Excel, real-time progress, publish
 * duplicates straight from a tap. CTA goes to /app/membership.
 */
export function AlbumPaywall() {
  const t = useTranslations("album.paywall");

  const benefits: Array<{ icon: React.ReactNode; label: string }> = [
    {
      icon: <BulletIconStack />,
      label: t("benefitNoPaper"),
    },
    {
      icon: <BulletIconLive />,
      label: t("benefitProgress"),
    },
    {
      icon: <BulletIconPublish />,
      label: t("benefitPublish"),
    },
  ];

  return (
    <div className="flex flex-col gap-8 items-center text-center pt-2">
      {/* Animated hero — three stacked stickers that drift apart in a
          loop to suggest "your collection, alive". */}
      <div className="relative h-44 w-full max-w-xs flex items-center justify-center">
        <FloatingSticker code="ARG" number="10" delay="0s"   x="-32%" rotate="-10deg" />
        <FloatingSticker code="BRA" number="9"  delay="0.6s" x="0"     rotate="2deg" />
        <FloatingSticker code="COL" number="7"  delay="1.2s" x="32%"  rotate="8deg" />
      </div>

      <header className="flex flex-col gap-2 max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
          {t("kicker")}
        </p>
        <h2 className="font-display text-3xl leading-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </header>

      <ul className="flex flex-col gap-3 self-stretch max-w-sm mx-auto">
        {benefits.map((b, i) => (
          <li
            key={i}
            className="surface-card p-3.5 flex items-center gap-3 text-left"
          >
            <span className="size-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
              {b.icon}
            </span>
            <span className="text-sm text-foreground leading-snug">
              {b.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/app/membership"
        className="h-12 px-6 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-sm font-bold uppercase tracking-[0.2em] inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_8px_20px_rgba(255,199,44,0.35)]"
      >
        {t("cta")}
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </Link>
    </div>
  );
}

/**
 * One floating sticker card in the hero animation. Position is set
 * via translateX so the cards spread horizontally; the looping
 * `paywall-float` keyframe gives each one a subtle bob with a
 * different delay so the stack feels alive.
 */
function FloatingSticker({
  code,
  number,
  delay,
  x,
  rotate,
}: {
  code: string;
  number: string;
  delay: string;
  x: string;
  rotate: string;
}) {
  return (
    <div
      className="absolute w-24 h-32 rounded-2xl border border-border bg-background shadow-xl shadow-black/10 anim-paywall-float"
      style={{
        animationDelay: delay,
        // x positions the card horizontally; rotate gives the deck-of-cards feel.
        transform: `translateX(${x}) rotate(${rotate})`,
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--highlight) 100%)",
          opacity: 0.18,
        }}
      />
      <div className="relative h-full flex flex-col items-center justify-center gap-1 p-2">
        <span
          className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider"
          style={{
            background: "var(--stage-bg)",
            color: "var(--stage-yellow)",
          }}
        >
          {code}
        </span>
        <span
          className="font-display tabular-nums leading-none"
          style={{
            fontSize: "2rem",
            color: "var(--stage-bg)",
            textShadow: "1px 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {number}
        </span>
      </div>
    </div>
  );
}

function BulletIconStack() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="3" width="13" height="17" rx="1.5" />
      <rect x="7" y="6" width="13" height="17" rx="1.5" />
    </svg>
  );
}

function BulletIconLive() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 12a10 10 0 1 1-3-7" />
      <path d="M16 12l-4 4-2-2" />
    </svg>
  );
}

function BulletIconPublish() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </svg>
  );
}

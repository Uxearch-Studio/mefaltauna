import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Marketing pitch shown to non-members in place of the inbox /
 * conversation list. Same visual language as AlbumPaywall: a small
 * animated hero that telegraphs the feature, three benefit cards,
 * and a single "Unirme al club" CTA pointed at /app/membership.
 *
 * Hero: two chat bubbles floating in front of a stylized QR badge
 * — that's the whole flow in one image. Bubbles bob with the same
 * `paywall-bob` keyframe the album hero uses, staggered by delay
 * so the row reads as alive without distracting the eye.
 */
export function ChatPaywall() {
  const t = useTranslations("inbox.paywall");

  const benefits: Array<{ icon: React.ReactNode; label: string }> = [
    { icon: <BulletIconChat />,    label: t("benefitChat") },
    { icon: <BulletIconQr />,      label: t("benefitQr") },
    { icon: <BulletIconStar />,    label: t("benefitReputation") },
    { icon: <BulletIconShield />,  label: t("benefitSafe") },
  ];

  return (
    <div className="flex flex-col gap-8 items-center text-center pt-2">
      {/* Animated hero — chat bubbles in front of a QR card. */}
      <div className="relative h-44 w-full max-w-xs flex items-center justify-center">
        {/* Background QR card */}
        <div
          className="absolute size-32 rounded-2xl border border-border bg-background shadow-xl shadow-black/10 anim-paywall-float"
          style={{
            animationDelay: "1.6s",
            transform: "translate(0, -10px) rotate(-8deg)",
          }}
        >
          <div className="absolute inset-2 rounded-lg bg-[var(--stage-bg)] grid grid-cols-5 grid-rows-5 gap-px p-2">
            {/* Stylized QR pattern — 25 cells with deterministic
                "filled" positions so it reads as a QR without needing
                a real one. */}
            {Array.from({ length: 25 }).map((_, i) => {
              const pattern = [
                1,1,1,0,1,
                1,0,1,1,1,
                1,1,0,1,0,
                0,1,1,1,1,
                1,0,1,0,1,
              ];
              return (
                <span
                  key={i}
                  className={
                    pattern[i]
                      ? "bg-[var(--stage-yellow)] rounded-[1px]"
                      : ""
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Foreground chat bubble — left, "incoming" */}
        <div
          className="absolute anim-paywall-float"
          style={{
            animationDelay: "0s",
            transform: "translate(-72%, -16px) rotate(-4deg)",
          }}
        >
          <div className="px-4 py-2 rounded-2xl rounded-bl-sm bg-foreground text-background text-xs font-medium shadow-md max-w-[160px]">
            ¿Cambias la #7?
          </div>
        </div>

        {/* Foreground chat bubble — right, "outgoing" */}
        <div
          className="absolute anim-paywall-float"
          style={{
            animationDelay: "0.8s",
            transform: "translate(72%, 24px) rotate(4deg)",
          }}
        >
          <div className="px-4 py-2 rounded-2xl rounded-br-sm bg-[var(--stage-yellow)] text-[#1a0b3d] text-xs font-bold shadow-md">
            ¡Vamos! 🤝
          </div>
        </div>
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

function BulletIconChat() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BulletIconQr() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h2v2h-2zM18 14v3M14 18h3v3" />
    </svg>
  );
}

function BulletIconStar() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8z" />
    </svg>
  );
}

function BulletIconShield() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

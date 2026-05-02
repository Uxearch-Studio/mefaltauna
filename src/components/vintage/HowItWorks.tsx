import { useTranslations } from "next-intl";

const STEPS = ["mark", "match", "trade"] as const;

function StepIcon({ name }: { name: (typeof STEPS)[number] }) {
  if (name === "mark") {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="6" y="6" width="36" height="36" />
        <path d="M14 24 L21 31 L34 17" strokeLinecap="square" />
      </svg>
    );
  }
  if (name === "match") {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="4" y="10" width="16" height="20" />
        <rect x="28" y="18" width="16" height="20" />
        <path d="M20 20 L28 28 M28 20 L20 28" strokeLinecap="square" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M8 18 L36 18 L40 14 L40 26" strokeLinecap="square" />
      <path d="M40 30 L12 30 L8 34 L8 22" strokeLinecap="square" />
    </svg>
  );
}

export function HowItWorks() {
  const t = useTranslations("how");

  return (
    <section id="how" className="border-t-2 border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-baseline justify-between mb-12 gap-6 flex-wrap">
          <h2 className="font-display text-4xl md:text-6xl leading-[0.9]">
            {t("title")}
          </h2>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("kicker")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <article
              key={step}
              className="border-2 border-border bg-muted p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="size-12 text-foreground">
                  <StepIcon name={step} />
                </span>
              </div>
              <h3 className="font-display text-2xl leading-tight">
                {t(`${step}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/70">
                {t(`${step}.body`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

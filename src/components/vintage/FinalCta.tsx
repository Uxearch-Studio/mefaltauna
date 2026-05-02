import { useTranslations } from "next-intl";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="border-t-2 border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center gap-6">
        <p className="font-mono text-xs uppercase tracking-widest opacity-70">
          {t("kicker")}
        </p>
        <h2 className="font-display text-4xl md:text-7xl leading-[0.9] max-w-3xl">
          {t("title")}
        </h2>
        <button
          type="button"
          className="mt-4 h-12 px-6 font-mono text-sm uppercase tracking-widest bg-accent text-accent-foreground border-2 border-background hover:bg-background hover:text-foreground transition-colors"
        >
          {t("cta")}
        </button>
      </div>
    </section>
  );
}

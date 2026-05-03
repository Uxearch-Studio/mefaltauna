import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-foreground text-background relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 20px, currentColor 20px 21px)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center gap-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-highlight">
          {t("kicker")}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] max-w-3xl">
          {t("title")}
        </h2>
        <p className="text-base md:text-lg opacity-70 max-w-xl leading-relaxed">
          {t("subtitle")}
        </p>
        <Link
          href="/sign-in"
          className="mt-4 h-12 px-6 inline-flex items-center justify-center rounded-full bg-highlight text-highlight-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}

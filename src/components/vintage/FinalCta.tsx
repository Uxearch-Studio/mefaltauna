import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center gap-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {t("kicker")}
        </p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] max-w-3xl">
          {t("title")}
        </h2>
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

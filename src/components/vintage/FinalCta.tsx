import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MeshGradient } from "./MeshGradient";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="relative overflow-hidden stage-purple grain">
      <MeshGradient />
      <div className="relative mx-auto max-w-3xl px-6 py-24 md:py-32 flex flex-col items-center text-center gap-6 z-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--stage-yellow)]">
          {t("kicker")}
        </p>
        <h2
          className="font-display leading-[0.95] text-balance"
          style={{ fontSize: "clamp(2rem, 8vw, 5rem)" }}
        >
          {t("title")}
        </h2>
        <p className="text-base md:text-lg text-white/75 max-w-xl leading-relaxed">
          {t("subtitle")}
        </p>
        <Link
          href="/sign-in"
          className="mt-2 h-13 px-8 inline-flex items-center justify-center rounded-full bg-[var(--stage-yellow)] text-[var(--stage-bg)] text-base font-bold hover:opacity-90 transition-opacity shadow-2xl shadow-[var(--stage-yellow)]/30"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}

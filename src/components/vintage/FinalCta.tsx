import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Street-poster CTA: tape-edge corners, marker kicker, gold dust.
 */
export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-foreground text-background relative overflow-hidden paper-grain">
      {/* Diagonal pitch-stripe wash */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 28px, currentColor 28px 29px)",
        }}
      />
      {/* Gold dust */}
      <span aria-hidden className="absolute left-[14%] top-[22%] size-1.5 rounded-full bg-[#f7c948] opacity-70 anim-spark" style={{ animationDelay: "0s" }} />
      <span aria-hidden className="absolute right-[18%] top-[34%] size-1 rounded-full bg-[#f7c948] opacity-60 anim-spark" style={{ animationDelay: "0.5s" }} />
      <span aria-hidden className="absolute left-[32%] bottom-[18%] size-2 rounded-full bg-[#f7c948] opacity-50 anim-spark" style={{ animationDelay: "1s" }} />
      <span aria-hidden className="absolute right-[24%] bottom-[28%] size-1.5 rounded-full bg-[#f7c948] opacity-60 anim-spark" style={{ animationDelay: "1.5s" }} />

      {/* Tape strips at corners */}
      <span aria-hidden className="absolute -top-2 left-[10%] w-20 h-7 bg-[#f7c948]/70 rotate-[-6deg] shadow-md" />
      <span aria-hidden className="absolute -top-2 right-[12%] w-16 h-7 bg-[#f7c948]/60 rotate-[8deg] shadow-md" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 flex flex-col items-center text-center gap-5">
        <p className="font-marker text-xl md:text-2xl text-[#f7c948]">
          {t("kicker")}
        </p>
        <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-[0.92] max-w-3xl">
          {t("title")}
        </h2>
        <p className="text-base md:text-lg opacity-70 max-w-xl leading-relaxed">
          {t("subtitle")}
        </p>
        <Link
          href="/sign-in"
          className="mt-4 h-14 px-8 inline-flex items-center justify-center rounded-full bg-[#f7c948] text-[#0a1426] text-base font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#f7c948]/20"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}

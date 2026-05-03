import { useTranslations } from "next-intl";
import { LogoMark } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 flex flex-col items-center text-center gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <LogoMark className="size-12" />
          <span className="font-display text-2xl tracking-tight lowercase">
            mefaltauna
          </span>
        </div>

        {/* Origin pill */}
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t("origin")}
        </span>

        {/* Tagline */}
        <p className="text-base md:text-lg leading-relaxed max-w-xl">
          {t("tagline")}
        </p>

        {/* Credit */}
        <div className="flex flex-col items-center gap-1 text-sm">
          <p className="text-muted-foreground">
            {t("credit")}{" "}
            <a
              href="https://uxearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-semibold hover:text-accent transition-colors"
            >
              uxearch.com
            </a>
          </p>
          <p className="text-muted-foreground">Javier Mora</p>
        </div>

        {/* Year line */}
        <p className="text-xs text-muted-foreground/60 mt-4">© {year} mefaltauna</p>
      </div>
    </footer>
  );
}

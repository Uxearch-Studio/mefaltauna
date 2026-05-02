import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-6">
        <p className="font-display text-2xl md:text-3xl leading-tight max-w-3xl">
          {t("tagline")}
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-6 border-t border-border/30">
          <p className="text-sm font-mono text-muted-foreground">
            {t("credit")}{" "}
            <a
              href="https://uxearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:text-accent transition-colors"
            >
              uxearch.com
            </a>{" "}
            {t("and")}{" "}
            <span className="text-foreground font-semibold">Javier Mora</span>
            <span className="opacity-60"> — {t("role")}</span>
          </p>

          <p className="text-xs font-mono text-muted-foreground/60">
            © {year} mefaltauna. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

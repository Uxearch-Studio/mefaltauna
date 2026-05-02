import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-24 bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-sm">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("tagline")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{t("origin")}</p>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-muted-foreground">
          <p>
            {t("credit")}{" "}
            <a
              href="https://uxearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors"
            >
              uxearch.com
            </a>{" "}
            · <span className="text-foreground">Javier Mora</span>{" "}
            <span>— {t("role")}</span>
          </p>
          <p>
            © {year} mefaltauna · {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

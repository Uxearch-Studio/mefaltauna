import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-24"
      style={{ background: "#0a2e18", color: "#f5efe1" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-md">
            <Logo />
            <p className="text-sm leading-relaxed opacity-80">
              {t("tagline")}
            </p>
            <p className="text-xs opacity-60">{t("origin")}</p>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
          style={{ borderTop: "1px solid rgba(245, 239, 225, 0.12)" }}
        >
          <p className="opacity-70">
            {t("credit")}{" "}
            <a
              href="https://uxearch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
              style={{ color: "#2ea84e" }}
            >
              uxearch.com
            </a>{" "}
            · <span>Javier Mora</span>
          </p>
          <p className="opacity-50">© {year} mefaltauna</p>
        </div>
      </div>
    </footer>
  );
}

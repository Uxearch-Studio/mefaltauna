import { useTranslations } from "next-intl";
import { Logo } from "./Logo";

/**
 * Single-color footer — deep pitch green regardless of theme,
 * giving it a distinct identity from the rest of the site.
 */
export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-24"
      style={{ background: "#0a2e18", color: "#f5efe1" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-sm leading-relaxed max-w-sm opacity-75">
              {t("tagline")}
            </p>
          </div>
          <p className="font-pixel text-[10px] uppercase tracking-widest opacity-50">
            {t("origin")}
          </p>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs font-mono"
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
            <span className="opacity-60"> — {t("role")}</span>
          </p>
          <p className="opacity-50">
            © {year} mefaltauna · {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

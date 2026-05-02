import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
          <a href="#how" className="hover:text-accent transition-colors">
            {t("howItWorks")}
          </a>
          <a href="#pricing" className="hover:text-accent transition-colors">
            {t("pricing")}
          </a>
          <a href="#explore" className="hover:text-accent transition-colors">
            {t("explore")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          <button
            type="button"
            className="hidden sm:inline-flex items-center h-9 px-3 font-mono text-xs uppercase tracking-widest bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {t("signIn")}
          </button>
        </div>
      </div>
    </header>
  );
}

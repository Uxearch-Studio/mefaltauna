import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export async function Header() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link
            href="/how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("howItWorks")}
          </Link>
          <Link
            href="/matches"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("matches")}
          </Link>
          <a
            href="/#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("pricing")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          {user ? (
            <Link
              href="/app/feed"
              className="hidden sm:inline-flex items-center h-9 px-4 text-sm font-medium rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              {t("openApp")} →
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center h-9 px-4 text-sm font-medium rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

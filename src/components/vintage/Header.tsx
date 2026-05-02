import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const t = await getTranslations("nav");
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="hover:opacity-70 transition-opacity">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-pixel text-[10px] uppercase">
          <Link
            href="/how-it-works"
            className="hover:text-accent transition-colors"
          >
            {t("howItWorks")}
          </Link>
          <Link
            href="/matches"
            className="hover:text-accent transition-colors"
          >
            {t("matches")}
          </Link>
          <a href="/#pricing" className="hover:text-accent transition-colors">
            {t("pricing")}
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeSwitcher />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center h-9 px-3 font-pixel text-[10px] uppercase bg-foreground text-background border-2 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

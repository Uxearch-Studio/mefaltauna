import { AppLogoLink } from "./AppLogoLink";
import { InstallShortcut } from "./InstallShortcut";
import { ThemeSwitcher } from "./ThemeSwitcher";

type Props = {
  title?: string;
  trailing?: React.ReactNode;
};

/**
 * App-shell top bar. Left: full mefaltauna logo (mark + wordmark)
 * which always links back to the feed. Right: install-to-homescreen
 * shortcut, theme switcher, and optional caller-supplied trailing
 * nodes.
 *
 * The optional `title` is rendered as a subtle subtitle next to the
 * wordmark so the top bar always reads as the brand first, then the
 * page label.
 */
export function AppTopBar({ title, trailing }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-3">
        <AppLogoLink title={title} />

        <div className="flex items-center gap-2">
          <InstallShortcut />
          <ThemeSwitcher />
          {trailing}
        </div>
      </div>
    </header>
  );
}

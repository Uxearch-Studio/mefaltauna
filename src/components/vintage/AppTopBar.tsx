import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { InstallShortcut } from "./InstallShortcut";

type Props = {
  title?: string;
  trailing?: React.ReactNode;
};

/**
 * App-shell top bar. Left: full mefaltauna logo (mark + wordmark)
 * which always links back to the feed. Right: install-to-homescreen
 * shortcut + optional caller-supplied trailing nodes.
 *
 * The optional `title` is rendered as a subtle subtitle next to the
 * wordmark so the top bar always reads as the brand first, then the
 * page label.
 */
export function AppTopBar({ title, trailing }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-3">
        <Link
          href="/app/feed"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity min-w-0"
        >
          <Logo />
          {title && (
            <span className="ml-1.5 text-xs font-medium text-muted-foreground truncate hidden sm:inline">
              · {title}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <InstallShortcut />
          {trailing}
        </div>
      </div>
    </header>
  );
}

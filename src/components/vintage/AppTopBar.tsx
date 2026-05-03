import { Link } from "@/i18n/navigation";
import { LogoMark } from "./Logo";

type Props = {
  title?: string;
  trailing?: React.ReactNode;
};

export function AppTopBar({ title, trailing }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-3">
        <Link
          href="/app/feed"
          className="flex items-center gap-2 hover:opacity-70 transition-opacity min-w-0"
        >
          <LogoMark className="size-7 shrink-0" />
          {title && (
            <h1 className="text-base font-semibold tracking-tight truncate">
              {title}
            </h1>
          )}
        </Link>
        <div className="flex items-center gap-2">{trailing}</div>
      </div>
    </header>
  );
}

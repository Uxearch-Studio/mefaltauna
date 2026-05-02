import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

type Props = {
  title?: string;
  trailing?: React.ReactNode;
};

export function AppTopBar({ title, trailing }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/app/feed" className="hover:opacity-70 transition-opacity">
          {title ? (
            <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          ) : (
            <Logo />
          )}
        </Link>
        <div className="flex items-center gap-2">{trailing}</div>
      </div>
    </header>
  );
}

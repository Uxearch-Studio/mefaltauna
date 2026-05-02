import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-7" />
      {showWordmark && (
        <span className="font-semibold tracking-tight leading-none text-base">
          mefaltauna
        </span>
      )}
    </span>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="mefaltauna"
      className={cn("text-foreground", className)}
    >
      {/* 3x2 album grid; the middle-bottom slot is "missing" — dashed outline. */}
      <g fill="currentColor">
        <rect x="3" y="6" width="7" height="9" rx="1.4" />
        <rect x="12.5" y="6" width="7" height="9" rx="1.4" />
        <rect x="22" y="6" width="7" height="9" rx="1.4" />
        <rect x="3" y="17" width="7" height="9" rx="1.4" />
        <rect x="22" y="17" width="7" height="9" rx="1.4" />
      </g>
      <rect
        x="12.5"
        y="17"
        width="7"
        height="9"
        rx="1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="2 1.6"
      />
    </svg>
  );
}

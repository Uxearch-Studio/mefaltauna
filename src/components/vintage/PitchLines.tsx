import { cn } from "@/lib/cn";

/**
 * Decorative top-down pitch — center line, center circle, penalty boxes.
 * Sits as a faint background watermark behind hero sections.
 */
export function PitchLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("text-foreground/[0.05]", className)}
      aria-hidden
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      >
        {/* outer line */}
        <rect x="20" y="20" width="760" height="360" />
        {/* center line */}
        <line x1="400" y1="20" x2="400" y2="380" />
        {/* center circle */}
        <circle cx="400" cy="200" r="70" />
        <circle cx="400" cy="200" r="3" fill="currentColor" stroke="none" />
        {/* left penalty box */}
        <rect x="20" y="120" width="120" height="160" />
        <rect x="20" y="160" width="40" height="80" />
        {/* right penalty box */}
        <rect x="660" y="120" width="120" height="160" />
        <rect x="740" y="160" width="40" height="80" />
        {/* corner arcs */}
        <path d="M 20 20 a 12 12 0 0 1 -12 -12" />
        <path d="M 780 20 a 12 12 0 0 0 12 -12" />
        <path d="M 20 380 a 12 12 0 0 0 -12 12" />
        <path d="M 780 380 a 12 12 0 0 1 12 12" />
      </g>
    </svg>
  );
}

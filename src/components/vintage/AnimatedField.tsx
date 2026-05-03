import { cn } from "@/lib/cn";

/**
 * Decorative animated background for the landing hero.
 * Pitch lines pan slowly. Three soccer balls rotate + drift on
 * different paths. A player silhouette sways. All low-opacity so
 * the foreground copy reads cleanly. Pure CSS (no JS).
 */
export function AnimatedField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
    >
      {/* Slow-panning pitch lines */}
      <div className="absolute inset-0 anim-pitch-pan">
        <svg
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-[110%] h-[110%] -left-[5%] -top-[5%] text-foreground/[0.05]"
        >
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <rect x="20" y="20" width="760" height="360" />
            <line x1="400" y1="20" x2="400" y2="380" />
            <circle cx="400" cy="200" r="70" />
            <circle cx="400" cy="200" r="3" fill="currentColor" stroke="none" />
            <rect x="20" y="120" width="120" height="160" />
            <rect x="660" y="120" width="120" height="160" />
          </g>
        </svg>
      </div>

      {/* Floating soccer balls — different paths + speeds */}
      <Ball className="left-[8%] top-[20%] size-10 anim-drift-1 text-foreground/30" />
      <Ball className="right-[12%] top-[30%] size-8 anim-drift-2 text-accent/40" />
      <Ball className="left-[20%] bottom-[18%] size-7 anim-drift-3 text-highlight/40" />

      {/* Player silhouette swaying */}
      <PlayerSilhouette className="right-[6%] bottom-[10%] anim-sway text-foreground/[0.07]" />
      <PlayerSilhouette className="left-[4%] top-[14%] anim-sway-reverse text-foreground/[0.05]" />

      {/* Country flag chips floating subtly — multi-color WC vibe */}
      <FlagChip color="#C8102E" className="left-[40%] top-[8%] anim-bob-1" />
      <FlagChip color="#003DA5" className="right-[35%] bottom-[20%] anim-bob-2" />
      <FlagChip color="#FCD116" className="left-[55%] bottom-[8%] anim-bob-3" />
    </div>
  );
}

function Ball({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("absolute", className)}
      fill="currentColor"
    >
      <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.7" />
      <path
        d="M16 6 L22 11 L20 18 L12 18 L10 11 Z"
        fill="var(--background)"
        opacity="0.9"
      />
      <path
        d="M16 6 L16 2 M22 11 L26 8 M20 18 L24 22 M12 18 L8 22 M10 11 L6 8"
        stroke="var(--background)"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}

function PlayerSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 120"
      className={cn("absolute size-32", className)}
      fill="currentColor"
    >
      {/* Head */}
      <circle cx="40" cy="22" r="11" />
      {/* Torso */}
      <path d="M28 38 Q40 30 52 38 L58 78 L48 80 L46 60 L42 62 L42 88 L38 88 L38 62 L34 60 L32 80 L22 78 Z" />
      {/* Legs */}
      <path d="M34 80 L30 116 L36 116 L40 84 Z" />
      <path d="M46 80 L50 116 L44 116 L40 84 Z" />
      {/* Ball at foot */}
      <circle cx="56" cy="116" r="4" />
    </svg>
  );
}

function FlagChip({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-3 rounded-sm shadow-sm",
        className,
      )}
      style={{ background: color, opacity: 0.5 }}
    />
  );
}

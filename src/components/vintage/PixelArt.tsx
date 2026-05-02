import { cn } from "@/lib/cn";

type PixelProps = { className?: string };

/**
 * 16x16 pixel-art soccer ball. Uses crispEdges so it scales to any size
 * without anti-aliasing — keeps the arcade/console feel.
 */
export function PixelBall({ className }: PixelProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("pixel-art", className)}
      role="img"
      aria-label="ball"
    >
      <g fill="currentColor">
        {/* outline */}
        <rect x="5" y="0" width="6" height="1" />
        <rect x="3" y="1" width="2" height="1" />
        <rect x="11" y="1" width="2" height="1" />
        <rect x="2" y="2" width="1" height="1" />
        <rect x="13" y="2" width="1" height="1" />
        <rect x="1" y="3" width="1" height="2" />
        <rect x="14" y="3" width="1" height="2" />
        <rect x="0" y="5" width="1" height="6" />
        <rect x="15" y="5" width="1" height="6" />
        <rect x="1" y="11" width="1" height="2" />
        <rect x="14" y="11" width="1" height="2" />
        <rect x="2" y="13" width="1" height="1" />
        <rect x="13" y="13" width="1" height="1" />
        <rect x="3" y="14" width="2" height="1" />
        <rect x="11" y="14" width="2" height="1" />
        <rect x="5" y="15" width="6" height="1" />
        {/* central pentagon (panel) */}
        <rect x="7" y="5" width="2" height="1" />
        <rect x="6" y="6" width="4" height="1" />
        <rect x="5" y="7" width="6" height="2" />
        <rect x="6" y="9" width="4" height="1" />
        <rect x="7" y="10" width="2" height="1" />
        {/* connectors to outer panels */}
        <rect x="7" y="3" width="2" height="2" />
        <rect x="3" y="6" width="2" height="2" />
        <rect x="11" y="6" width="2" height="2" />
        <rect x="3" y="8" width="2" height="2" />
        <rect x="11" y="8" width="2" height="2" />
        <rect x="7" y="11" width="2" height="2" />
      </g>
    </svg>
  );
}

/**
 * Pixel-art trophy.
 */
export function PixelTrophy({ className }: PixelProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("pixel-art", className)}
      role="img"
      aria-label="trophy"
    >
      <g fill="currentColor">
        {/* handles */}
        <rect x="1" y="3" width="2" height="1" />
        <rect x="13" y="3" width="2" height="1" />
        <rect x="1" y="4" width="1" height="3" />
        <rect x="14" y="4" width="1" height="3" />
        <rect x="1" y="7" width="2" height="1" />
        <rect x="13" y="7" width="2" height="1" />
        {/* cup */}
        <rect x="3" y="2" width="10" height="1" />
        <rect x="3" y="3" width="10" height="6" />
        {/* stem */}
        <rect x="6" y="9" width="4" height="2" />
        <rect x="5" y="11" width="6" height="1" />
        {/* base */}
        <rect x="3" y="12" width="10" height="1" />
        <rect x="2" y="13" width="12" height="2" />
      </g>
    </svg>
  );
}

/**
 * Pixel-art stadium silhouette.
 */
export function PixelStadium({ className }: PixelProps) {
  return (
    <svg
      viewBox="0 0 32 16"
      className={cn("pixel-art", className)}
      role="img"
      aria-label="stadium"
    >
      <g fill="currentColor">
        {/* top arches */}
        <rect x="6" y="3" width="20" height="1" />
        <rect x="4" y="4" width="24" height="1" />
        <rect x="3" y="5" width="26" height="1" />
        <rect x="2" y="6" width="28" height="2" />
        {/* light pylons */}
        <rect x="2" y="1" width="1" height="3" />
        <rect x="29" y="1" width="1" height="3" />
        <rect x="1" y="0" width="3" height="1" />
        <rect x="28" y="0" width="3" height="1" />
        {/* stands shading */}
        <rect x="2" y="8" width="28" height="1" />
        <rect x="3" y="9" width="26" height="1" />
        <rect x="4" y="10" width="24" height="1" />
        {/* pitch line */}
        <rect x="6" y="11" width="20" height="1" />
        {/* base shadow */}
        <rect x="0" y="14" width="32" height="2" />
      </g>
    </svg>
  );
}

/**
 * Pixel pitch — top-down field with center line and circle.
 * Use as decorative background.
 */
export function PixelPitch({ className }: PixelProps) {
  return (
    <svg
      viewBox="0 0 64 32"
      className={cn("pixel-art", className)}
      role="img"
      aria-label="pitch"
    >
      <g fill="currentColor">
        {/* outer line */}
        <rect x="0" y="0" width="64" height="1" />
        <rect x="0" y="31" width="64" height="1" />
        <rect x="0" y="0" width="1" height="32" />
        <rect x="63" y="0" width="1" height="32" />
        {/* center line */}
        <rect x="31" y="0" width="2" height="32" />
        {/* center circle */}
        <rect x="28" y="13" width="8" height="1" />
        <rect x="28" y="18" width="8" height="1" />
        <rect x="26" y="14" width="2" height="4" />
        <rect x="36" y="14" width="2" height="4" />
        {/* center spot */}
        <rect x="31" y="15" width="2" height="2" />
        {/* left penalty box */}
        <rect x="0" y="8" width="10" height="1" />
        <rect x="0" y="23" width="10" height="1" />
        <rect x="9" y="8" width="1" height="16" />
        {/* right penalty box */}
        <rect x="54" y="8" width="10" height="1" />
        <rect x="54" y="23" width="10" height="1" />
        <rect x="54" y="8" width="1" height="16" />
        {/* goals */}
        <rect x="0" y="14" width="2" height="4" />
        <rect x="62" y="14" width="2" height="4" />
      </g>
    </svg>
  );
}

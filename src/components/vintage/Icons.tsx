import { cn } from "@/lib/cn";

type IconProps = { className?: string };

const stroke =
  "fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'";

function base(className?: string) {
  return cn("shrink-0", className);
}

// ─────────────────────────────────────────────
// Bottom-nav icons (24×24) — football themed
// ─────────────────────────────────────────────

/**
 * Feed → top-down pitch (rectangle + center line + center circle).
 * Reads as "the live game".
 */
export function FeedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <circle cx="12" cy="12" r="3" />
      <line x1="3" y1="9" x2="6" y2="9" />
      <line x1="3" y1="15" x2="6" y2="15" />
      <line x1="6" y1="9" x2="6" y2="15" />
      <line x1="18" y1="9" x2="21" y2="9" />
      <line x1="18" y1="15" x2="21" y2="15" />
      <line x1="18" y1="9" x2="18" y2="15" />
    </svg>
  );
}

/**
 * Album → 3×2 sticker grid with one slot dashed (the brand mark in
 * miniature). Same idea as the logo so the metaphor stays consistent.
 */
export function AlbumIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4"  width="5" height="6" rx="1" />
      <rect x="9.5" y="4"  width="5" height="6" rx="1" />
      <rect x="16" y="4"  width="5" height="6" rx="1" />
      <rect x="3" y="14" width="5" height="6" rx="1" />
      <rect x="16" y="14" width="5" height="6" rx="1" />
      <rect x="9.5" y="14" width="5" height="6" rx="1" strokeDasharray="1.6 1.4" />
    </svg>
  );
}

/**
 * Publish → sticker card with a peeled corner and a + inside.
 * Reads as "list a new sticker", not as a camera.
 */
export function PublishIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h11l3 3v12.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M16 4v3h3" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

/**
 * Inbox → speech bubble with a tiny ball inside (the "talk about a
 * sticker" idea).
 */
export function InboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9l-4 3v-3H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <circle cx="11" cy="11.5" r="2.4" />
      <path d="M11 9.1v4.8M8.6 11.5h4.8" />
    </svg>
  );
}

/**
 * Profile → jersey shape with a crew neck.
 */
export function ProfileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4 L4 6.5 L5.5 11 L8 10 V20 H16 V10 L18.5 11 L20 6.5 L15 4 A3 3 0 0 1 9 4 Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// In-page step icons (replacing the pixel-art set)
// ─────────────────────────────────────────────

export function MarkAlbumIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="36" height="36" rx="3" />
      <path d="M14 24l7 7 13-15" />
    </svg>
  );
}

export function MatchPeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="20" r="6" />
      <circle cx="32" cy="20" r="6" />
      <path d="M6 40c0-5 4-9 10-9s10 4 10 9" />
      <path d="M22 40c0-5 4-9 10-9s10 4 10 9" />
    </svg>
  );
}

export function HandshakeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 24l8-8 6 6 6-6 8 8" />
      <path d="M14 24l4 4 6-6 4 4 6-6" />
      <path d="M2 18l4-4M42 18l4-4" />
    </svg>
  );
}

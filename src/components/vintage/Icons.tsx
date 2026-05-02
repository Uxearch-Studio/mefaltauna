import { cn } from "@/lib/cn";

type IconProps = { className?: string };

const stroke =
  "fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'";

function base(className?: string) {
  return cn("shrink-0", className);
}

// ─────────────────────────────────────────────
// Bottom-nav icons (24×24)
// ─────────────────────────────────────────────

export function FeedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      <circle cx="20" cy="4" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AlbumIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16M4 15h16M9 4v16M15 4v16" />
    </svg>
  );
}

export function PublishIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-4 4-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ProfileIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={base(className)} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
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

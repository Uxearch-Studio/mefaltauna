"use client";

import { useEffect, useState } from "react";

/**
 * Renders a kickoff time in the visitor's local timezone with a
 * day prefix (e.g. "Jue 11 · 17:00"). Server-rendered with the UTC
 * placeholder so the markup is stable, then upgraded on the client.
 *
 * Why a tiny client component for this: the rest of the landing is
 * a server component for SEO, so we can't call new Date().toLocale*
 * with the user's timezone at render time. Hydrating just this label
 * keeps the rest of the page as a pure server payload.
 */
type Props = {
  iso: string;
  locale: string;
};

export function MatchTimeLabel({ iso, locale }: Props) {
  const [label, setLabel] = useState<string>(() => fallbackLabel(iso, locale));

  useEffect(() => {
    const date = new Date(iso);
    const day = date.toLocaleDateString(locale, {
      weekday: "short",
      day: "2-digit",
    });
    const time = date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLabel(`${day} · ${time}`);
  }, [iso, locale]);

  return (
    <span className="text-muted-foreground tabular-nums">{label}</span>
  );
}

/** SSR-safe fallback: render in UTC so the markup matches whatever
 *  the client renders before hydration. We just show the day in
 *  short form; client effect immediately replaces it with local TZ.
 */
function fallbackLabel(iso: string, locale: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString(locale, {
    weekday: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
  return `${day}`;
}

"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * iPhone-style slide-to-unlock pack opening.
 * - The closed pack shows a horizontal slider track at the bottom
 *   with a thumb on the left and the text "Desliza para abrir".
 * - The user drags the thumb left → right.
 * - As the thumb travels, the wrapper progressively tears open.
 * - When the thumb reaches the end (≥95%), the wrapper peels off
 *   and the gold collector card is revealed with price + benefits.
 */
type Props = { className?: string };

export function PriceReveal({ className = "" }: Props) {
  const t = useTranslations("pricing.benefits");
  const tp = useTranslations("pricing");
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const HANDLE_SIZE = 48;

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function setFromX(clientX: number) {
    const track = trackRef.current?.getBoundingClientRect();
    if (!track) return;
    const inner = track.width - HANDLE_SIZE;
    if (inner <= 0) return;
    const x = clamp(clientX - track.left - HANDLE_SIZE / 2, 0, inner);
    const next = x / inner;
    setProgress(next);
    if (next >= 0.95 && !open) setOpen(true);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (open) return;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setFromX(e.clientX);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (progress < 0.95) setProgress(0);
  }

  function reset() {
    setOpen(false);
    setProgress(0);
  }

  return (
    <div
      className={`relative select-none rounded-2xl overflow-hidden border border-border shadow-2xl shadow-accent/30 ${className}`}
    >
      {/* Gold collector card behind the wrapper — only renders when open */}
      {open && (
        <GoldCollectorCard
          labels={{
            full: t("full"),
            chat: t("chat"),
            unlimited: t("unlimited"),
            noCommission: t("noCommission"),
            albumProgress: t("albumProgress"),
            findMissing: t("findMissing"),
          }}
          ctaLabel={tp("passCta")}
        />
      )}

      {/* Wrapper that tears as the slider progresses */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: open ? 0 : 1, transition: "opacity 320ms" }}
      >
        <PackWrapper torn={progress} />

        {!open && (
          <div className="absolute inset-x-3 bottom-3 pointer-events-auto">
            <SliderTrack
              trackRef={trackRef}
              progress={progress}
              dragging={dragging.current}
              handleSize={HANDLE_SIZE}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
        )}

        {progress > 0.05 && progress < 0.95 && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: Math.min(1, progress * 1.5) }}
          >
            <span aria-hidden className="absolute left-[35%] top-[30%] size-2 rounded-full bg-[var(--stage-yellow)] anim-spark" style={{ animationDelay: "0.0s", boxShadow: "0 0 12px var(--stage-yellow)" }} />
            <span aria-hidden className="absolute left-[55%] top-[50%] size-1.5 rounded-full bg-white anim-spark" style={{ animationDelay: "0.2s", boxShadow: "0 0 10px white" }} />
            <span aria-hidden className="absolute left-[40%] top-[70%] size-1.5 rounded-full bg-[var(--stage-yellow)] anim-spark" style={{ animationDelay: "0.4s", boxShadow: "0 0 10px var(--stage-yellow)" }} />
          </div>
        )}
      </div>

      {open && (
        <button
          type="button"
          onClick={reset}
          className="absolute top-3 left-3 size-7 rounded-full bg-white/15 text-white/80 flex items-center justify-center hover:bg-white/25 transition-colors backdrop-blur z-20"
          aria-label="Cerrar el sobre"
        >
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
        </button>
      )}
    </div>
  );
}

function SliderTrack({
  trackRef,
  progress,
  dragging,
  handleSize,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
  progress: number;
  dragging: boolean;
  handleSize: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      ref={trackRef}
      className="relative h-12 rounded-full bg-[#1a0b3d]/70 backdrop-blur border border-white/20 overflow-hidden"
    >
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-[var(--stage-yellow)] anim-marquee-hint pointer-events-none">
        Desliza para abrir
      </span>

      <div
        className="absolute inset-y-0 left-0 bg-[var(--stage-yellow)]/30"
        style={{
          width: `calc(${handleSize / 2}px + ${progress} * (100% - ${handleSize}px))`,
          transition: dragging
            ? "none"
            : "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label="Desliza para abrir"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        className="absolute top-0 size-12 rounded-full bg-[var(--stage-yellow)] shadow-lg shadow-black/30 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{
          left: `calc(${progress} * (100% - ${handleSize}px))`,
          transition: dragging
            ? "none"
            : "left 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5 text-[#1a0b3d]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  );
}

function PackWrapper({ torn }: { torn: number }) {
  const t = torn * 30;
  const path = `M 0,0 L 100,0 L 100,${100 - t * 0.5} L ${88 - t * 0.6},${
    96 - t * 0.4
  } L ${78 - t * 0.4},100 L ${68 - t * 0.5},${94 - t * 0.3} L ${58 - t * 0.5},100 L ${
    44 - t * 0.5
  },${92 - t * 0.4} L ${30 - t * 0.5},100 L 0,${100 - t * 0.6} Z`;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Yellow tonal background — multiple layered gradients */}
      <svg
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="reveal-wrap-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#fff3a0" />
            <stop offset="40%"  stopColor="#ffd44a" />
            <stop offset="70%"  stopColor="#ffc72c" />
            <stop offset="100%" stopColor="#c4901c" />
          </linearGradient>
          <linearGradient id="reveal-wrap-shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id="reveal-wrap-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path d={path} fill="url(#reveal-wrap-fill)" />
        <path d={path} fill="url(#reveal-wrap-shine)" opacity="0.6" />
        <path d={path} fill="url(#reveal-wrap-glow)" />
      </svg>

      {/* HTML content layered on top — logo, brand, title, tagline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-6 pb-20 gap-2">
        {/* Logo mark */}
        <svg
          viewBox="0 0 32 32"
          className="size-10 md:size-12 text-[#1a0b3d]"
          aria-hidden
        >
          <g fill="currentColor">
            <rect x="3" y="6" width="7" height="9" rx="1.4" />
            <rect x="12.5" y="6" width="7" height="9" rx="1.4" />
            <rect x="22" y="6" width="7" height="9" rx="1.4" />
            <rect x="3" y="17" width="7" height="9" rx="1.4" />
            <rect x="22" y="17" width="7" height="9" rx="1.4" />
          </g>
          <rect
            x="12.5" y="17" width="7" height="9" rx="1.4"
            fill="none" stroke="currentColor" strokeWidth="1.4"
            strokeDasharray="2 1.6"
          />
        </svg>

        {/* Wordmark */}
        <span className="font-display text-2xl md:text-3xl tracking-tight lowercase text-[#1a0b3d]">
          mefaltauna
        </span>

        {/* Title — Pase único */}
        <p className="mt-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#1a0b3d]/70">
          Pase único
        </p>
        <p
          className="font-display text-base md:text-xl text-[#1a0b3d] leading-tight max-w-[14ch]"
          style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.4)" }}
        >
          Encuentra las que te faltan
        </p>

        {/* Bottom seal */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#1a0b3d]/50">
          <span>Edición</span>
          <span>· Mundial 2026 ·</span>
          <span>★</span>
        </div>
      </div>
    </div>
  );
}

/**
 * FIFA Ultimate Team-inspired premium pass card.
 * - Single panel (dark violet base) with a gold holographic frame
 *   accent and corner caret marks (FUT Icon vibe).
 * - Top-left rating block: price as the "rating", "PASE" as position,
 *   Colombian flag as the nationality mark.
 * - Top-right logo medallion as the player photo equivalent.
 * - Wordmark + thin gold divider centered like a player name.
 * - 2-column benefit grid styled as FIFA stat lines (✓ then short
 *   abbreviation + full label).
 * - Yellow "Entrar al club" CTA pinned to the bottom.
 */
function GoldCollectorCard({
  labels,
  ctaLabel,
}: {
  labels: {
    full: string;
    chat: string;
    unlimited: string;
    noCommission: string;
    albumProgress: string;
    findMissing: string;
  };
  ctaLabel: string;
}) {
  const benefits: Array<{ tag: string; label: string }> = [
    { tag: "FED", label: labels.full },
    { tag: "CHA", label: labels.chat },
    { tag: "PUB", label: labels.unlimited },
    { tag: "0%",  label: labels.noCommission },
    { tag: "ALB", label: labels.albumProgress },
    { tag: "BSC", label: labels.findMissing },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0e0524] text-white overflow-hidden">
      {/* Holographic gold sheen behind everything */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(140% 90% at 50% -10%, rgba(255,215,122,0.35) 0%, rgba(255,199,44,0.18) 25%, transparent 55%), linear-gradient(160deg, rgba(255,199,44,0.05) 0%, transparent 40%, rgba(255,199,44,0.10) 90%)",
        }}
      />
      {/* Animated foil sweep across the whole card */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none shine-sweep"
        style={{ mixBlendMode: "screen", opacity: 0.5 }}
      />

      {/* Gold foil frame */}
      <div
        aria-hidden
        className="absolute inset-2 rounded-[18px] pointer-events-none"
        style={{
          border: "1px solid rgba(255,215,122,0.55)",
          boxShadow:
            "inset 0 0 0 2px rgba(255,199,44,0.10), 0 0 24px rgba(255,199,44,0.15)",
        }}
      />

      {/* Corner carets — FUT Icon style */}
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <span
          key={c}
          aria-hidden
          className={`absolute size-3 border-[var(--stage-yellow)] pointer-events-none ${
            c === "tl"
              ? "top-3 left-3 border-t-2 border-l-2"
              : c === "tr"
                ? "top-3 right-3 border-t-2 border-r-2"
                : c === "bl"
                  ? "bottom-3 left-3 border-b-2 border-l-2"
                  : "bottom-3 right-3 border-b-2 border-r-2"
          }`}
        />
      ))}

      {/* Top section: rating block + logo medallion */}
      <div className="relative pt-7 px-6 flex items-start justify-between gap-3">
        <div className="flex flex-col items-start">
          <span
            className="font-display tabular-nums leading-none text-[var(--stage-yellow)]"
            style={{
              fontSize: "clamp(1.6rem, 7vw, 2.4rem)",
              textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
            }}
          >
            $9.900
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/85 mt-1.5">
            Pase
          </span>
          <span className="text-lg leading-none mt-1.5">🇨🇴</span>
        </div>

        <div
          className="size-16 md:size-20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          style={{
            background:
              "linear-gradient(135deg, #ffd97a 0%, #ffc72c 50%, #b67e0f 100%)",
          }}
        >
          <svg viewBox="0 0 32 32" className="size-10 md:size-12 text-[#1a0b3d]" aria-hidden>
            <g fill="currentColor">
              <rect x="3" y="6" width="7" height="9" rx="1.4" />
              <rect x="12.5" y="6" width="7" height="9" rx="1.4" />
              <rect x="22" y="6" width="7" height="9" rx="1.4" />
              <rect x="3" y="17" width="7" height="9" rx="1.4" />
              <rect x="22" y="17" width="7" height="9" rx="1.4" />
            </g>
            <rect
              x="12.5" y="17" width="7" height="9" rx="1.4"
              fill="none" stroke="currentColor" strokeWidth="1.4"
              strokeDasharray="2 1.6"
            />
          </svg>
        </div>
      </div>

      {/* Wordmark + divider — the "player name" zone */}
      <div className="relative px-6 mt-4 text-center">
        <h3
          className="font-display lowercase leading-none text-[var(--stage-yellow)]"
          style={{
            fontSize: "clamp(1.6rem, 6.5vw, 2.25rem)",
            textShadow: "2px 2px 0 rgba(0,0,0,0.45)",
          }}
        >
          mefaltauna
        </h3>
        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mt-2">
          Edición · Mundial 2026
        </span>
        <div
          aria-hidden
          className="mx-auto mt-3 h-[1.5px] w-20"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, var(--stage-yellow) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* FIFA-style stats grid — 2 columns × 3 rows */}
      <ul className="relative px-5 mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] md:text-[11px] w-full">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-center gap-1.5 min-w-0">
            <span
              aria-hidden
              className="size-3.5 rounded-full bg-emerald-400 text-[#0a2a18] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            >
              <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8 L7 12 L13 4" />
              </svg>
            </span>
            <span className="font-bold uppercase tracking-wider text-[var(--stage-yellow)] tabular-nums shrink-0">
              {b.tag}
            </span>
            <span className="leading-tight text-white/80 truncate">
              {b.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA pinned to the bottom edge */}
      <a
        href="/sign-in"
        className="relative mt-auto mb-5 mx-5 h-10 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_8px_20px_rgba(255,199,44,0.35)]"
      >
        {ctaLabel}
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </a>
    </div>
  );
}

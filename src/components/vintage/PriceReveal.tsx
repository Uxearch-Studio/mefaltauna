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
      {/* Gold collector card behind the wrapper */}
      <GoldCollectorCard
        labels={{
          full: t("full"),
          chat: t("chat"),
          unlimited: t("unlimited"),
          noCommission: t("noCommission"),
        }}
      />

      {/* Wrapper that tears as the slider progresses */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: open ? 0 : 1, transition: "opacity 220ms" }}
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
          className="absolute top-3 right-3 size-9 rounded-full bg-[#1a0b3d]/85 text-[var(--stage-yellow)] flex items-center justify-center hover:bg-[#1a0b3d] transition-colors backdrop-blur z-10"
          aria-label="Cerrar el sobre"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold uppercase tracking-widest text-white/70 anim-marquee-hint pointer-events-none">
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
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      className="w-full h-full pointer-events-none"
      aria-hidden
    >
      <defs>
        <linearGradient id="reveal-wrap-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffd97a" />
          <stop offset="50%"  stopColor="#ffc72c" />
          <stop offset="100%" stopColor="#a17a30" />
        </linearGradient>
        <linearGradient id="reveal-wrap-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#reveal-wrap-fill)" />
      <rect x="0" y="0" width="100" height="50" fill="url(#reveal-wrap-shine)" />
      <text
        x="50" y="40"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="10"
        fill="#1a0b3d"
        letterSpacing="2"
      >
        mefaltauna
      </text>
      <text
        x="50" y="55"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="5"
        fill="#1a0b3d"
        opacity="0.7"
        letterSpacing="3"
      >
        PASE ÚNICO
      </text>
      <text
        x="50" y="70"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="4"
        fill="#1a0b3d"
        opacity="0.5"
        letterSpacing="3"
      >
        EDICIÓN MUNDIAL 26
      </text>
    </svg>
  );
}

function GoldCollectorCard({
  labels,
}: {
  labels: { full: string; chat: string; unlimited: string; noCommission: string };
}) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative px-3 pt-3 pb-2 foil-holo">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/30" />
        <div className="relative flex items-center justify-between text-[#1a0b3d]">
          <span className="px-2 py-0.5 rounded-md bg-[#1a0b3d] text-[var(--stage-yellow)] text-[10px] font-bold tracking-widest">
            COP
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#1a0b3d] text-[var(--stage-yellow)] text-[10px] font-bold tracking-widest">
            ★ EDICIÓN
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-3 relative bg-[#1a0b3d] text-white">
        <div
          aria-hidden
          className="absolute inset-2 rounded-xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, #ffd97a 0%, transparent 30%, transparent 70%, #ffd97a 100%)",
            opacity: 0.25,
          }}
        />

        <div className="relative flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--stage-yellow)]">
            Pase único
          </p>
          <p
            className="font-display tabular-nums leading-none"
            style={{
              fontSize: "clamp(2.25rem, 9vw, 3.75rem)",
              textShadow: "2px 2px 0 rgba(0,0,0,0.4)",
              color: "var(--stage-yellow)",
            }}
          >
            $9.900
          </p>
        </div>

        <ul className="relative flex flex-col gap-1.5 mt-1 text-[11px] md:text-xs w-full">
          {[labels.full, labels.chat, labels.unlimited, labels.noCommission].map(
            (label, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 size-3.5 rounded-full bg-[var(--stage-yellow)] text-[#1a0b3d] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8 L7 12 L13 4" />
                  </svg>
                </span>
                <span className="leading-tight text-white/90">{label}</span>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

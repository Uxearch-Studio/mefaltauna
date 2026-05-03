"use client";

import { useRef, useState } from "react";

/**
 * Interactive sticker pack — same dimensions as the "Una historia"
 * card (w-64 md:w-80, aspect-[3/4]). The user drags or holds the
 * pull-tab to tear the wrapper open. Drag distance is mirrored on
 * the wrapper so the user feels the "tearing" continuously, with
 * sparkles popping at the tear seam and the price card behind
 * progressively revealed.
 */
type Props = { className?: string };

export function PriceReveal({ className = "" }: Props) {
  const [pull, setPull] = useState(0);  // 0..1
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startPull = useRef(0);
  const dragging = useRef(false);
  const movedDistance = useRef(0);

  const THRESHOLD = 0.5;

  function bounds() {
    return containerRef.current?.getBoundingClientRect();
  }

  function onPointerDown(e: React.PointerEvent) {
    if (open) return;
    dragging.current = true;
    startX.current = e.clientX;
    startPull.current = pull;
    movedDistance.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const b = bounds();
    if (!b) return;
    const dx = e.clientX - startX.current;
    movedDistance.current = Math.abs(dx);
    const next = Math.max(0, Math.min(1, startPull.current + dx / (b.width * 0.7)));
    setPull(next);
    if (next >= 0.95 && !open) setOpen(true);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (movedDistance.current < 8) {
      setOpen(true);
      setPull(1);
      return;
    }
    if (pull >= THRESHOLD) {
      setOpen(true);
      setPull(1);
    } else {
      setPull(0);
      setOpen(false);
    }
  }

  function reset() {
    setOpen(false);
    setPull(0);
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none rounded-2xl overflow-hidden border border-border bg-background shadow-2xl shadow-accent/30 ${className}`}
    >
      {/* Price card revealed behind — same aspect as wrapper */}
      <PriceCard />

      {/* Sparkles popping at the tear seam */}
      {pull > 0.05 && pull < 0.95 && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: Math.min(1, pull * 2) }}
        >
          <Spark className="left-[40%] top-[20%]" delay="0s" />
          <Spark className="left-[55%] top-[50%]" delay="0.15s" />
          <Spark className="left-[35%] top-[70%]" delay="0.3s" />
          <Spark className="right-[30%] top-[30%]" delay="0.4s" />
        </div>
      )}

      {/* Wrapper that tears as user drags */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`absolute inset-0 ${
          open ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{
          transform: `translateX(${pull * 110}%) rotate(${pull * -18}deg)`,
          opacity: open ? 0 : 1,
          transition: dragging.current
            ? "none"
            : "transform 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms",
          transformOrigin: "0% 100%",
        }}
      >
        <PackWrapper torn={pull} />

        {/* Pull tab — explicit affordance */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <span className="font-display text-[10px] uppercase tracking-widest text-[#1a0b3d]/60 anim-marquee-hint">
            tira
          </span>
          <div className="size-8 rounded-full bg-[#1a0b3d] text-[var(--stage-yellow)] flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Reset button after open */}
      {open && (
        <button
          type="button"
          onClick={reset}
          className="absolute bottom-3 right-3 size-9 rounded-full bg-foreground/85 text-background flex items-center justify-center hover:bg-foreground transition-colors backdrop-blur"
          aria-label="Cerrar el sobre"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
        </button>
      )}
    </div>
  );
}

function PackWrapper({ torn }: { torn: number }) {
  // Build a torn-edge path that gets jaggier as torn increases.
  const tear = torn * 30;
  const path = `M 0,0 L 100,0 L 100,100 L ${85 - tear},100 L ${78 - tear * 0.8},${
    96 - tear * 0.5
  } L ${72 - tear},100 L ${64 - tear * 0.6},${94 - tear * 0.4} L ${58 - tear},100 L 0,100 Z`;

  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      className="w-full h-full pointer-events-none"
      aria-hidden
    >
      <defs>
        <linearGradient id="wrapper-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffd97a" />
          <stop offset="50%"  stopColor="#ffc72c" />
          <stop offset="100%" stopColor="#a17a30" />
        </linearGradient>
        <linearGradient id="wrapper-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Pack body */}
      <path d={path} fill="url(#wrapper-fill)" />
      {/* Pack shine */}
      <rect x="0" y="0" width="100" height="50" fill="url(#wrapper-shine)" />
      {/* Brand text */}
      <text
        x="50" y="70"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="13"
        fill="#1a0b3d"
        letterSpacing="2"
      >
        mefaltauna
      </text>
      <text
        x="50" y="86"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="6"
        fill="#1a0b3d"
        opacity="0.7"
        letterSpacing="3"
      >
        PASE ÚNICO
      </text>
    </svg>
  );
}

function PriceCard() {
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Top — gradient with badges */}
      <div
        className="flex-1 relative"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--highlight) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30" />

        <span
          className="absolute top-3 left-3 px-2.5 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest"
          style={{ background: "var(--accent)", color: "var(--highlight)" }}
        >
          COP
        </span>
        <span
          className="absolute top-3 right-3 size-9 rounded-lg flex items-center justify-center text-base font-bold"
          style={{ background: "var(--accent)", color: "var(--highlight)" }}
        >
          ★
        </span>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span
            className="font-display tabular-nums leading-none"
            style={{
              fontSize: "clamp(2.5rem, 11vw, 4.5rem)",
              textShadow: "2px 2px 0 rgba(0,0,0,0.25)",
            }}
          >
            $9.900
          </span>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border p-3 md:p-4 flex flex-col gap-0.5 text-left bg-background">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Pase único · COP
        </p>
        <h3 className="text-base md:text-lg font-semibold tracking-tight">
          Acceso completo
        </h3>
        <p className="text-xs text-muted-foreground">Sin restricciones</p>
      </div>
    </div>
  );
}

function Spark({ className, delay }: { className?: string; delay: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-2 rounded-full bg-[var(--highlight)] anim-spark ${className ?? ""}`}
      style={{
        animationDelay: delay,
        boxShadow: "0 0 12px var(--highlight)",
      }}
    />
  );
}

"use client";

import { useRef, useState } from "react";

/**
 * Interactive sticker pack — the user drags or taps to tear the
 * wrapper open and reveal the price as a Panini-style card.
 * On mobile: swipe right. On desktop: drag or click.
 */
export function PriceReveal({ className = "" }: { className?: string }) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const dragging = useRef(false);
  const movedDistance = useRef(0);

  const MAX = 220;
  const THRESHOLD = MAX * 0.4;

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
    startOffset.current = offset;
    movedDistance.current = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    movedDistance.current = Math.abs(dx);
    const next = Math.max(0, Math.min(MAX, startOffset.current + dx));
    setOffset(next);
    if (next >= MAX * 0.95 && !open) setOpen(true);
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    // Tap (no significant drag) → snap fully open
    if (movedDistance.current < 8) {
      setOpen(true);
      setOffset(MAX);
      return;
    }
    if (offset >= THRESHOLD) {
      setOpen(true);
      setOffset(MAX);
    } else {
      setOffset(0);
      setOpen(false);
    }
  }

  function reset() {
    setOpen(false);
    setOffset(0);
  }

  const torn = offset / MAX;

  return (
    <div className={`relative select-none ${className}`}>
      {/* Touch surface — captures the gesture */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {/* Pack base (back of wrapper) */}
        <svg
          viewBox="0 0 240 320"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <defs>
            <linearGradient id="reveal-pack-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#ffd97a" />
              <stop offset="50%"  stopColor="#ffc72c" />
              <stop offset="100%" stopColor="#a17a30" />
            </linearGradient>
            <linearGradient id="reveal-pack-shine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>

          <rect x="40" y="40" width="160" height="240" rx="10" fill="url(#reveal-pack-gold)" />
          <rect x="40" y="40" width="160" height="100" fill="url(#reveal-pack-shine)" rx="10" />
          <text
            x="120" y="170"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="20"
            fill="#1a0b3d"
            letterSpacing="2"
          >
            mefaltauna
          </text>
          <text
            x="120" y="195"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="#1a0b3d"
            opacity="0.7"
            letterSpacing="3"
          >
            PASE ÚNICO
          </text>
          <text
            x="120" y="265"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill="#1a0b3d"
            opacity="0.5"
            letterSpacing="3"
          >
            MUNDIAL 26
          </text>
        </svg>

        {/* Price card — revealed inside the pack */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="transition-transform duration-300 ease-out"
            style={{
              transform: open
                ? "translateY(-8%) scale(1)"
                : "translateY(20%) scale(0.85)",
              opacity: open ? 1 : torn,
            }}
          >
            <PriceCard />
          </div>
        </div>

        {/* Pack front (peels away as the user drags) */}
        <svg
          viewBox="0 0 240 320"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translateX(${offset * 1.4}px) rotate(${torn * -15}deg)`,
            transformOrigin: "0% 100%",
            transition: dragging.current ? "none" : "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: open ? 0 : 1,
          }}
        >
          <path
            d="M 40,40 L 200,40 Q 200,140 200,160 Q 180,140 160,150 Q 140,160 120,150 Q 100,140 80,150 Q 60,160 40,150 Z"
            fill="url(#reveal-pack-gold)"
            stroke="#a17a30"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Hint or close affordance */}
      {!open && torn === 0 && (
        <div className="absolute -bottom-12 inset-x-0 flex items-center justify-center gap-2 text-xs text-muted-foreground pointer-events-none">
          <span className="anim-marquee-hint">←  desliza para abrir  →</span>
        </div>
      )}
      {open && (
        <button
          type="button"
          onClick={reset}
          className="absolute -bottom-12 inset-x-0 mx-auto w-fit text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          ↺ cerrar el sobre
        </button>
      )}
    </div>
  );
}

function PriceCard() {
  return (
    <article className="relative w-44 md:w-52 rounded-2xl overflow-hidden border border-border bg-background shadow-2xl shadow-accent/30">
      {/* Top — gradient with badges */}
      <div
        className="aspect-[3/4] relative"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--highlight) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30" />

        {/* COP badge */}
        <span
          className="absolute top-2 left-2 px-2 h-7 rounded-md flex items-center justify-center text-[10px] font-bold tracking-widest"
          style={{
            background: "var(--accent)",
            color: "var(--highlight)",
          }}
        >
          COP
        </span>

        {/* Star icon (premium) */}
        <span
          className="absolute top-2 right-2 size-7 rounded-md flex items-center justify-center text-sm font-bold"
          style={{
            background: "var(--accent)",
            color: "var(--highlight)",
          }}
        >
          ★
        </span>

        {/* Big price centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span
            className="font-display tabular-nums"
            style={{
              fontSize: "2.25rem",
              lineHeight: "1",
              textShadow: "2px 2px 0 rgba(0,0,0,0.25)",
            }}
          >
            $9.900
          </span>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border p-3 flex flex-col gap-0.5 text-left bg-background">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Pase único · COP
        </p>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Acceso completo
        </h3>
        <p className="text-[10px] text-muted-foreground">Sin restricciones</p>
      </div>
    </article>
  );
}

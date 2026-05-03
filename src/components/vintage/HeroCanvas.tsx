"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-driven cinematic hero animation. Top-down stylised football:
 * - 11 players in 4-3-3 formation as glowing purple dots
 * - A saffron ball moves between them on a continuous passing routine
 *   with eased motion + trailing glow
 * - The receiving player pulses a bright ring on ball arrival
 * - Pitch lines drawn directly on canvas (centre line, circle, boxes)
 * - Slow camera oscillation pan + zoom for cinematic depth
 *
 * No card on top — the animation IS the hero motif.
 */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type Pulse = { x: number; y: number; t: number };
    type TrailDot = { x: number; y: number; t: number };

    // 4-3-3 formation in normalised coords (top of pitch is the
    // attacking end, bottom is the defensive end).
    const players: Array<{ x: number; y: number }> = [
      { x: 0.5,  y: 0.92 }, // GK
      { x: 0.22, y: 0.78 }, // LB
      { x: 0.4,  y: 0.78 }, // LCB
      { x: 0.6,  y: 0.78 }, // RCB
      { x: 0.78, y: 0.78 }, // RB
      { x: 0.32, y: 0.58 }, // LCM
      { x: 0.5,  y: 0.6  }, // CM
      { x: 0.68, y: 0.58 }, // RCM
      { x: 0.25, y: 0.32 }, // LW
      { x: 0.5,  y: 0.22 }, // CF
      { x: 0.75, y: 0.32 }, // RW
    ];

    // Passing sequence — long winding play across the pitch.
    const seq = [0, 1, 5, 6, 2, 7, 4, 3, 6, 8, 9, 10, 7, 5, 0];

    let raf = 0;
    let last = performance.now();
    let segmentT = 0; // 0..1 progress along current pass
    let segmentIdx = 0;
    const SEGMENT_DURATION = 1.6; // seconds per pass
    const pulses: Pulse[] = [];
    const trail: TrailDot[] = [];

    function dpr() {
      return Math.min(window.devicePixelRatio || 1, 2);
    }

    function resize() {
      if (!canvas) return;
      const r = dpr();
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * r);
      canvas.height = Math.floor(rect.height * r);
      ctx?.setTransform(r, 0, 0, r, 0, 0);
    }

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function drawPitch(w: number, h: number, t: number) {
      // Soft camera pan / zoom
      const zoom = 1 + Math.sin(t * 0.0003) * 0.04;
      const offX = Math.sin(t * 0.00018) * 16;
      const offY = Math.cos(t * 0.00022) * 12;

      ctx?.save();
      ctx?.translate(w / 2 + offX, h / 2 + offY);
      ctx?.scale(zoom, zoom);
      ctx?.translate(-w / 2, -h / 2);

      // Pitch background gradient
      const grad = ctx!.createRadialGradient(
        w * 0.5, h * 0.5, 0,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.7,
      );
      grad.addColorStop(0, "rgba(124, 58, 237, 0.18)");
      grad.addColorStop(1, "rgba(13, 5, 33, 0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);

      // Pitch outline (perspective optional — keep top-down for clarity)
      ctx!.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx!.lineWidth = 1.5;

      const pad = w * 0.06;
      ctx!.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

      // Centre line
      ctx!.beginPath();
      ctx!.moveTo(pad, h / 2);
      ctx!.lineTo(w - pad, h / 2);
      ctx!.stroke();

      // Centre circle
      ctx!.beginPath();
      ctx!.arc(w / 2, h / 2, Math.min(w, h) * 0.07, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.arc(w / 2, h / 2, 2, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx!.fill();

      // Penalty boxes (simplified)
      const boxW = (w - pad * 2) * 0.35;
      const boxH = (h - pad * 2) * 0.18;
      ctx!.strokeRect((w - boxW) / 2, pad, boxW, boxH);
      ctx!.strokeRect((w - boxW) / 2, h - pad - boxH, boxW, boxH);

      ctx!.restore();
    }

    function drawPlayer(x: number, y: number) {
      // Outer glow
      const g = ctx!.createRadialGradient(x, y, 0, x, y, 18);
      g.addColorStop(0, "rgba(167, 139, 250, 0.45)");
      g.addColorStop(1, "rgba(167, 139, 250, 0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(x, y, 18, 0, Math.PI * 2);
      ctx!.fill();

      // Solid dot
      ctx!.fillStyle = "#a78bfa";
      ctx!.beginPath();
      ctx!.arc(x, y, 5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawPulse(p: Pulse, dt: number) {
      p.t += dt;
      const life = 1.4;
      const k = p.t / life;
      if (k > 1) return false;
      ctx!.strokeStyle = `rgba(255, 199, 44, ${1 - k})`;
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, 8 + k * 32, 0, Math.PI * 2);
      ctx!.stroke();
      return true;
    }

    function drawBall(x: number, y: number) {
      // Trailing dots (drawn earlier, so we add now)
      for (const d of trail) {
        const k = 1 - d.t / 0.6;
        if (k <= 0) continue;
        ctx!.fillStyle = `rgba(255, 199, 44, ${k * 0.6})`;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, 3 * k, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Ball glow
      const g = ctx!.createRadialGradient(x, y, 0, x, y, 16);
      g.addColorStop(0, "rgba(255, 199, 44, 0.7)");
      g.addColorStop(1, "rgba(255, 199, 44, 0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(x, y, 16, 0, Math.PI * 2);
      ctx!.fill();

      // Solid ball
      ctx!.fillStyle = "#ffd97a";
      ctx!.beginPath();
      ctx!.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "#1a0b3d";
      ctx!.beginPath();
      ctx!.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function frame(time: number) {
      if (!canvas) return;
      const dt = Math.min(0.05, (time - last) / 1000);
      last = time;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      drawPitch(w, h, time);

      // Players
      for (const p of players) {
        drawPlayer(p.x * w, p.y * h);
      }

      // Update pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const alive = drawPulse(pulses[i], dt);
        if (!alive) pulses.splice(i, 1);
      }

      // Ball motion
      segmentT += dt / SEGMENT_DURATION;
      if (segmentT >= 1) {
        const arrived = players[seq[(segmentIdx + 1) % seq.length]];
        pulses.push({
          x: arrived.x * w,
          y: arrived.y * h,
          t: 0,
        });
        segmentIdx = (segmentIdx + 1) % seq.length;
        segmentT = 0;
      }

      const from = players[seq[segmentIdx]];
      const to = players[seq[(segmentIdx + 1) % seq.length]];
      const k = easeInOut(segmentT);
      const bx = (from.x + (to.x - from.x) * k) * w;
      const by = (from.y + (to.y - from.y) * k) * h;

      // Update trail
      for (const d of trail) d.t += dt;
      trail.unshift({ x: bx, y: by, t: 0 });
      if (trail.length > 14) trail.pop();

      drawBall(bx, by);

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full"
      aria-hidden
    />
  );
}

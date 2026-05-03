/**
 * Three large blurred orbs drifting on staggered paths give an
 * Apple-style mesh-gradient illusion. Pure CSS keyframes — no JS.
 * Sit behind the hero copy with -z-10.
 */
export function MeshGradient({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className="absolute -left-[20%] -top-[20%] size-[55vmax] rounded-full opacity-70 anim-orb-1"
        style={{
          background:
            "radial-gradient(circle, var(--stage-purple-1) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -right-[15%] top-[30%] size-[40vmax] rounded-full opacity-50 anim-orb-2"
        style={{
          background:
            "radial-gradient(circle, var(--stage-yellow) 0%, transparent 55%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute left-[20%] -bottom-[25%] size-[45vmax] rounded-full opacity-60 anim-orb-3"
        style={{
          background:
            "radial-gradient(circle, var(--stage-purple-2) 0%, transparent 60%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

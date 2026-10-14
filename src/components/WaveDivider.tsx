/** Dekorativ bølgekant. `to` er fargen på seksjonen under. */
export function WaveDivider({ to = "#f7f4ec", flip = false }: { to?: string; flip?: boolean }) {
  return (
    <div className={`pointer-events-none relative -mt-px h-12 w-full overflow-hidden md:h-20 ${flip ? "rotate-180" : ""}`} aria-hidden="true">
      <svg
        className="absolute bottom-0 h-full w-[200%] animate-drift"
        viewBox="0 0 2880 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60c120 40 240 40 360 0s240-40 360 0 240 40 360 0 240-40 360 0 240 40 360 0 240-40 360 0 240 40 360 0 240-40 360 0V120H0z"
          fill={to}
        />
      </svg>
    </div>
  );
}

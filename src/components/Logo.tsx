export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#123c36" />
      <path d="M10 30c7-10 21-10 31 0l9-8-2 10 2 10-9-8c-10 10-24 10-31 0z" fill="#5fe0c2" />
      <circle cx="19" cy="29" r="2" fill="#123c36" />
      <path
        d="M8 46c5-3 9-3 14 0s9 3 14 0 9-3 14 0 6 2 8 1"
        fill="none"
        stroke="#c98a4b"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark />
      <span className="leading-none">
        <span
          className={`block font-display text-xl font-semibold tracking-wide ${light ? "text-white" : "text-ink"}`}
        >
          Brommeland
        </span>
        <span
          className={`mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.22em] ${light ? "text-glacier" : "text-water"}`}
        >
          Suldalslågen
        </span>
      </span>
    </span>
  );
}

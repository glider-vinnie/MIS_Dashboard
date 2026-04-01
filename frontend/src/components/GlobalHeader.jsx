/**
 * GlobalHeader — thin info banner above the main top bar.
 * Shows: "Data Period: Apr 2025 – Dec 2025 | 10 Zones | MIS v1.0"
 */
export default function GlobalHeader() {
  return (
    <div className="bg-accent-500/8 border-b border-accent-500/15 px-4 md:px-6 py-1.5 flex items-center justify-center gap-3 flex-wrap">
      <span className="text-[11px] font-medium text-accent-400 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        Data Period: Apr 2025 – Dec 2025
      </span>
      <span className="text-accent-500/30 hidden sm:inline">|</span>
      <span className="text-[11px] font-medium text-accent-400 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        10 Zones
      </span>
      <span className="text-accent-500/30 hidden sm:inline">|</span>
      <span className="text-[11px] font-medium text-text-muted">
        MIS <span className="font-bold text-accent-400">v1.0</span>
      </span>
    </div>
  )
}

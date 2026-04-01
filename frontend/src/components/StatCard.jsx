/**
 * StatCard — Dark KPI stat card with icon, value, trend badge.
 *
 * Props:
 *   icon       — emoji or ReactNode for the icon
 *   label      — metric label text
 *   value      — main display value
 *   unit       — optional unit suffix
 *   trend      — 'up' | 'down' | 'neutral'
 *   trendValue — display string for trend badge (e.g. "+5%")
 *   color      — hex color for the icon background tint
 */

function TrendBadge({ trend, trendValue }) {
  if (trend === 'neutral' || !trend) {
    return <span className="text-xs text-text-muted">—</span>
  }
  const isUp = trend === 'up'
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
      {isUp ? (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        </svg>
      )}
      {trendValue}
    </span>
  )
}

export default function StatCard({ icon, label, value, unit, trend, trendValue, color = '#818cf8' }) {
  const bgTint = color + '1f' // ~12% opacity hex

  return (
    <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20 hover:border-surface-lighter/40 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: bgTint }}
        >
          {icon}
        </div>
        <TrendBadge trend={trend} trendValue={trendValue} />
      </div>
      <p className="text-2xl font-bold text-text-primary tracking-tight">
        {value}
        {unit && <span className="text-sm font-medium text-text-muted ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  )
}

/* ── Skeleton variant ──────────────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-light" />
        <div className="w-16 h-5 rounded-full bg-surface-light" />
      </div>
      <div className="w-24 h-8 rounded bg-surface-light mb-1" />
      <div className="w-32 h-4 rounded bg-surface-light" />
    </div>
  )
}

/**
 * KPICard — Reusable stat card for dashboard pages.
 *
 * Props:
 *   label       — card title (string)
 *   value       — main metric (string | number)
 *   unit        — optional unit suffix (string)
 *   trend       — 'up' | 'down' | 'neutral'
 *   trendValue  — e.g. '+12%'
 *   icon        — emoji string (e.g. '👥')
 *   color       — hex colour for the icon background tint
 */

const trendColors = {
  up:   'text-emerald-400',
  down: 'text-red-400',
  neutral: 'text-text-muted',
}

const arrows = {
  up: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  ),
  down: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
    </svg>
  ),
}

export default function KPICard({ label, value, unit, trend, trendValue, icon = '📊', color = '#818cf8' }) {
  const bg = `${color}1F` // ~12 % opacity hex suffix

  return (
    <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20 hover:border-surface-lighter/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: bg }}
        >
          {icon}
        </div>

        {trend && trend !== 'neutral' ? (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendColors[trend]}`}>
            {arrows[trend]}
            {trendValue}
          </span>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </div>

      <p className="text-2xl font-bold text-text-primary tracking-tight">
        {value}
        {unit && <span className="text-sm font-medium text-text-muted ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  )
}

/* Skeleton variant for loading states */
export function KPICardSkeleton() {
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

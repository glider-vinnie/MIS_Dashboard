const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ── Gradient cell colour helper ───────────────────────── */
function heatColor(v) {
  if (v == null || v === '') return { bg: 'transparent', text: '#64748b' }
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (n >= 90) return { bg: 'rgba(52,211,153,0.30)', text: '#34d399' }
  if (n >= 80) return { bg: 'rgba(52,211,153,0.18)', text: '#6ee7b7' }
  if (n >= 70) return { bg: 'rgba(251,191,36,0.20)', text: '#fbbf24' }
  if (n >= 60) return { bg: 'rgba(251,191,36,0.14)', text: '#fcd34d' }
  if (n >= 50) return { bg: 'rgba(248,113,113,0.16)', text: '#fca5a5' }
  return { bg: 'rgba(248,113,113,0.25)', text: '#f87171' }
}

/**
 * HeatmapTable — Zones × Months colour-coded percentage table.
 *
 * Props:
 *   data      — [{ zone: string, apr: number, may: number, … }]
 *   title     — card title
 *   subtitle  — card subtitle
 *   months    — optional month keys override (default Apr-Dec)
 *   unit      — value unit suffix (default '%')
 */
export default function HeatmapTable({
  data = [],
  title,
  subtitle,
  months = MONTHS,
  unit = '%',
}) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 overflow-x-auto">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-text-secondary mb-5">{subtitle}</p>}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-lighter/20">
            <th className="text-left py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider whitespace-nowrap">
              Zone
            </th>
            {months.map((m) => (
              <th key={m} className="text-center py-3 px-2 text-text-secondary font-medium text-xs uppercase tracking-wider">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri} className="border-b border-surface-lighter/10">
              <td className="py-2.5 px-3 text-text-primary font-medium whitespace-nowrap">{row.zone}</td>
              {months.map((m) => {
                const val = row[m.toLowerCase()]
                const { bg, text } = heatColor(val)
                return (
                  <td key={m} className="text-center py-2.5 px-1">
                    <span
                      className="inline-block min-w-[44px] px-2 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: bg, color: text }}
                    >
                      {val != null ? `${val}${unit}` : '—'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* Skeleton */
export function HeatmapTableSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-52 h-6 rounded bg-surface-light mb-2" />
      <div className="w-80 h-4 rounded bg-surface-light mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-8 rounded bg-surface-light" />)}
      </div>
    </div>
  )
}

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

/**
 * ZoneBarChart — Reusable horizontal bar chart for zone-level metrics.
 *
 * Props:
 *   data       — [{ zone: string, value: number }, …]
 *   dataKey    — key in data for the bar value (default 'value')
 *   title      — chart card title
 *   subtitle   — chart card subtitle
 *   barColor   — hex color for bars (default indigo)
 *   height     — chart height in px (default 360)
 *   unit       — optional unit label for tooltip
 *   sorted     — if true, sorts descending by value (default true)
 */

/* ── Styled tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-text-primary text-sm font-semibold mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="text-text-primary font-medium">
            {entry.value?.toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Gradient bar colours per index ─────────────────────── */
const palette = [
  '#818cf8', '#6366f1', '#a78bfa', '#7c3aed',
  '#60a5fa', '#3b82f6', '#34d399', '#10b981',
  '#fbbf24', '#f59e0b', '#f87171',
]

export default function ZoneBarChart({
  data = [],
  dataKey = 'value',
  title,
  subtitle,
  barColor,
  height = 360,
  unit = '',
  sorted = true,
}) {
  const chartData = sorted
    ? [...data].sort((a, b) => b[dataKey] - a[dataKey])
    : data

  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-text-secondary mb-5">{subtitle}</p>}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(51,65,85,0.4)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="zone"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar dataKey={dataKey} name={title || dataKey} radius={[0, 6, 6, 0]} barSize={22}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={barColor || palette[i % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Skeleton */
export function ZoneBarChartSkeleton({ height = 360 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-2" />
      <div className="w-64 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

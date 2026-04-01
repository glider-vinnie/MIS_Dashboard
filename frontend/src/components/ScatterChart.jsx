import {
  ScatterChart as RechartsScatterChart,
  Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

/* ── Zone palette ──────────────────────────────────────── */
const ZONE_COLORS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#e879f9', '#38bdf8', '#4ade80', '#facc15',
]

/**
 * CostScatterChart — Reusable scatter plot for two numeric dimensions, grouped by zone.
 *
 * Props:
 *   data        — [{ zone, month, [xKey], [yKey] }]
 *   zones       — string[] of unique zone names
 *   xKey        — data key for X axis (default 'expenditure')
 *   yKey        — data key for Y axis (default 'performance')
 *   xLabel      — X axis label
 *   yLabel      — Y axis label
 *   xFormatter  — tick formatter for X axis
 *   title       — card title
 *   subtitle    — card subtitle
 *   height      — chart height (default 380)
 */

function ScatterTooltipContent({ active, payload, xKey, yKey, xLabel, yLabel, xFmt }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-text-primary text-sm font-semibold mb-1">{d.zone}</p>
      {d.month && <p className="text-text-secondary text-xs mb-0.5">{d.month}</p>}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-secondary">{xLabel || xKey}:</span>
        <span className="text-text-primary font-medium">{xFmt ? xFmt(d[xKey]) : d[xKey]?.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-secondary">{yLabel || yKey}:</span>
        <span className="text-text-primary font-medium">{d[yKey]?.toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}

export default function CostScatterChart({
  data = [],
  zones = [],
  xKey = 'expenditure',
  yKey = 'performance',
  xLabel = 'Expenditure',
  yLabel = 'Performance',
  xFormatter,
  title,
  subtitle,
  height = 380,
}) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-text-secondary mb-5">{subtitle}</p>}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" />
          <XAxis
            type="number"
            dataKey={xKey}
            name={xLabel}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(51,65,85,0.4)' }}
            tickLine={false}
            tickFormatter={xFormatter}
            label={{ value: xLabel, position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            name={yLabel}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 8, fill: '#64748b', fontSize: 11 }}
          />
          <ZAxis range={[50, 200]} />
          <Tooltip content={<ScatterTooltipContent xKey={xKey} yKey={yKey} xLabel={xLabel} yLabel={yLabel} xFmt={xFormatter} />} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} iconType="circle" iconSize={8} />
          {zones.map((z, i) => (
            <Scatter
              key={z}
              name={z}
              data={data.filter((d) => d.zone === z)}
              fill={ZONE_COLORS[i % ZONE_COLORS.length]}
            />
          ))}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Skeleton */
export function CostScatterChartSkeleton({ height = 380 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-52 h-6 rounded bg-surface-light mb-2" />
      <div className="w-72 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

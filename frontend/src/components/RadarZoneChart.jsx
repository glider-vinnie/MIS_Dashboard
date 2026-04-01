import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

/* ── Colour palette for zone polygons ──────────────────── */
const COLORS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#e879f9', '#38bdf8', '#4ade80', '#facc15',
]

/* ── Dark tooltip ──────────────────────────────────────── */
function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
          <span className="text-text-secondary">{e.name}:</span>
          <span className="text-text-primary font-medium">{e.value}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * RadarZoneChart — Reusable radar/spider chart for multi-zone comparisons.
 *
 * Props:
 *   data      — [{ axis: string, [zoneName]: number, … }]
 *   zones     — string[] of zone keys present in data
 *   title     — card title
 *   subtitle  — card subtitle
 *   height    — chart height (default 380)
 */
export default function RadarZoneChart({
  data = [],
  zones = [],
  title,
  subtitle,
  height = 380,
}) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
      {title && <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>}
      {subtitle && <p className="text-xs text-text-secondary mb-5">{subtitle}</p>}

      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="rgba(51,65,85,0.5)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
          />
          {zones.map((z, i) => (
            <Radar
              key={z}
              name={z}
              dataKey={z}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Tooltip content={<RadarTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
            iconType="circle"
            iconSize={8}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* Skeleton */
export function RadarZoneChartSkeleton({ height = 380 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-2" />
      <div className="w-64 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

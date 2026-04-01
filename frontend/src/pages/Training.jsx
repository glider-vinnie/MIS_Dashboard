import { useState, useEffect } from 'react'
import {
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'
import KPICard, { KPICardSkeleton } from '../components/KPICard'
import RadarZoneChart, { RadarZoneChartSkeleton } from '../components/RadarZoneChart'
import HeatmapTable, { HeatmapTableSkeleton } from '../components/HeatmapTable'
import useIsMobile from '../hooks/useIsMobile'

/* ── KPI meta ──────────────────────────────────────────── */
const kpiMeta = [
  { icon: '👥', color: '#818cf8' },
  { icon: '💪', color: '#60a5fa' },
  { icon: '📊', color: '#34d399' },
  { icon: '📉', color: '#f87171' },
  { icon: '🎓', color: '#a78bfa' },
]

/* ── Multi-line colors ─────────────────────────────────── */
const LINE_COLORS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#e879f9', '#38bdf8', '#4ade80', '#facc15',
]

/* ── Shared dark tooltip ───────────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-text-primary text-sm font-semibold mb-1.5">{label}</p>
      {payload.map((e) => (
        <div key={e.name || e.dataKey} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color || e.stroke }} />
          <span className="text-text-secondary">{e.name}:</span>
          <span className="text-text-primary font-medium">{e.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Skeletons ─────────────────────────────────────────── */
function ChartSkeleton({ height = 320 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-2" />
      <div className="w-64 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Training & Learning Page
   ══════════════════════════════════════════════════════════ */
export default function Training() {
  const zone  = useFilterStore((s) => s.zone)
  const month = useFilterStore((s) => s.month)
  const isMobile = useIsMobile()

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .get('/training', { params: { zone, month } })
      .then((res) => { if (!cancelled) setData(res.data) })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [zone, month])

  /* ── Error ───────────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load training data</h3>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    )
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading || !data) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="w-52 h-7 rounded bg-surface-light mb-2" />
          <div className="w-80 h-4 rounded bg-surface-light" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
          {Array.from({ length: 5 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <RadarZoneChartSkeleton />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <HeatmapTableSkeleton />
      </div>
    )
  }

  const {
    kpis = [],
    radarData = [],
    radarZones = [],
    monthlyTrend = [],
    dropoutTrend = [],
    dropoutZones = [],
    volunteerKpis = [],
    heatmapData = [],
    heatmapType = 'Academic Performance',
  } = data

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Training & Learning</h1>
        <p className="text-text-secondary text-sm mt-1">
          Student performance & volunteer metrics for{' '}
          <span className="text-accent-400 font-medium">{zone === 'All' ? 'All Zones' : zone}</span>
          {' · '}
          <span className="text-accent-400 font-medium">{month}</span>
        </p>
      </div>

      {/* ── ROW 1 — KPI Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
        {kpis.map((kpi, i) => {
          const meta = kpiMeta[i] || kpiMeta[0]
          return (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              icon={meta.icon}
              color={meta.color}
            />
          )
        })}
      </div>

      {/* ── ROW 2 — Radar Chart ──────────────────────────── */}
      <div className="mb-8">
        <RadarZoneChart
          data={radarData}
          zones={radarZones}
          title="Performance Radar"
          subtitle="Multi-axis comparison: Attendance, Academic, Values, Volunteer Attendance, Syllabus & Test Completion"
          height={isMobile ? 260 : 380}
        />
      </div>

      {/* ── ROW 3 — Area + Line charts ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Left: Student Count vs Strength (stacked area) */}
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Student Count vs Strength</h3>
          <p className="text-xs text-text-secondary mb-5">Monthly trend (stacked area)</p>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradStrength" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(51,65,85,0.4)' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="studentCount" name="Student Count" stroke="#818cf8" fill="url(#gradCount)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="avgStrength"  name="Avg Strength"  stroke="#2dd4bf" fill="url(#gradStrength)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Dropout Rate per zone (multi-line) */}
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Dropout Rate Trend</h3>
          <p className="text-xs text-text-secondary mb-5">Monthly dropout % per zone</p>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
            <LineChart data={dropoutTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(51,65,85,0.4)' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 'auto']} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} iconType="circle" iconSize={8} />
              {dropoutZones.map((z, i) => (
                <Line
                  key={z}
                  type="monotone"
                  dataKey={z}
                  name={z}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: LINE_COLORS[i % LINE_COLORS.length], stroke: '#0f1724', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 4 — Volunteer Metric Cards ───────────────── */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Volunteer Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {volunteerKpis.map((kpi, i) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              icon={['🤝', '📋', '🌍', '🚶'][i] || '📊'}
              color={['#818cf8', '#34d399', '#fbbf24', '#60a5fa'][i] || '#818cf8'}
            />
          ))}
        </div>
      </div>

      {/* ── ROW 5 — Academic + Values Heatmap Table ──────── */}
      <HeatmapTable
        data={heatmapData}
        title={`${heatmapType} Heatmap`}
        subtitle="Zone × Month — gradient green (high) → red (low)"
      />
    </div>
  )
}

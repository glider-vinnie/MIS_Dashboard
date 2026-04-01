import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'
import KPICard, { KPICardSkeleton } from '../components/KPICard'
import useIsMobile from '../hooks/useIsMobile'

/* ── KPI icon + color configs ──────────────────────────── */
const kpiConfig = {
  'Total Students':              { color: '#818cf8', icon: '👥' },
  'Avg Attendance %':            { color: '#34d399', icon: '📊' },
  'Dropout Rate':                { color: '#f87171', icon: '📉' },
  'Avg Academic Performance':    { color: '#60a5fa', icon: '🎓' },
  'Monthly Expenditure (INR)':   { color: '#fbbf24', icon: '💰' },
  'Performance Score':           { color: '#a78bfa', icon: '⭐' },
}

/* ── Skeleton ──────────────────────────────────────────── */
function ChartSkeleton({ height = 320 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-2" />
      <div className="w-64 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

/* ── Custom Recharts Tooltip ───────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-text-primary text-sm font-semibold mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="text-text-primary font-medium">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Dashboard — Overview Page
   ══════════════════════════════════════════════════════════ */
export default function Dashboard() {
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
      .get('/dashboard/overview', { params: { zone, month } })
      .then((res) => {
        if (!cancelled) setData(res.data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [zone, month])

  /* ── Error state ─────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load overview</h3>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    )
  }

  /* ── Loading state ───────────────────────────────────── */
  if (loading || !data) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="w-52 h-7 rounded bg-surface-light mb-2" />
          <div className="w-80 h-4 rounded bg-surface-light" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  const { kpis = [], zoneComparison = [], trendData = [] } = data

  return (
    <div>
      {/* ── Page header ──────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard Overview</h1>
        <p className="text-text-secondary text-sm mt-1">
          Performance summary for <span className="text-accent-400 font-medium">{zone === 'All' ? 'All Zones' : zone}</span>
          {' · '}<span className="text-accent-400 font-medium">{month}</span>
        </p>
      </div>

      {/* ── SECTION 1 — KPI Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {kpis.map((kpi) => {
          const cfg = kpiConfig[kpi.label] || { color: '#818cf8', icon: '📊' }
          return (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              icon={cfg.icon}
              color={cfg.color}
            />
          )
        })}
      </div>

      {/* ── Charts Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SECTION 2 — Zone Comparison Bar Chart */}
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Zone Comparison</h3>
          <p className="text-xs text-text-secondary mb-5">Monthly student count vs average strength by zone</p>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
            <BarChart data={zoneComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
              <XAxis
                dataKey="zone"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(51,65,85,0.4)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="studentCount" name="Monthly Student Count" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar dataKey="avgStrength"  name="Monthly Avg Strength"  fill="#34d399" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SECTION 3 — Trend Line Chart */}
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Performance Trends</h3>
          <p className="text-xs text-text-secondary mb-5">Attendance, dropout & academic performance (Apr – Dec 2025)</p>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(51,65,85,0.4)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                name="Avg Attendance %"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#818cf8', stroke: '#0f1724', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="dropout"
                name="Dropout Rate"
                stroke="#fbbf24"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#fbbf24', stroke: '#0f1724', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="academic"
                name="Academic Performance %"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#34d399', stroke: '#0f1724', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

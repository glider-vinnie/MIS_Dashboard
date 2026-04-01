import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'
import KPICard, { KPICardSkeleton } from '../components/KPICard'
import ZoneBarChart, { ZoneBarChartSkeleton } from '../components/ZoneBarChart'
import useIsMobile from '../hooks/useIsMobile'

/* ── KPI icon / colour config ──────────────────────────── */
const kpiMeta = [
  { key: 'workingDays',       icon: '📅', color: '#818cf8' },
  { key: 'operatingTime',     icon: '⏱️', color: '#34d399' },
  { key: 'studentTeacher',    icon: '👩‍🏫', color: '#60a5fa' },
  { key: 'centerVisits',      icon: '🏢', color: '#fbbf24' },
]

/* ── Pie palette ───────────────────────────────────────── */
const PIE_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f87171']

/* ── Activity table months ─────────────────────────────── */
const TABLE_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* helper: cell bg by value */
function cellColor(v) {
  if (v == null || v === '') return ''
  const n = typeof v === 'string' ? parseFloat(v) : v
  if (n >= 80) return 'bg-emerald-500/20 text-emerald-400'
  if (n >= 60) return 'bg-amber-500/20 text-amber-400'
  return 'bg-red-500/20 text-red-400'
}

/* ── Shared tooltip ────────────────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-text-primary text-sm font-semibold mb-1.5">{label}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color || e.fill }} />
          <span className="text-text-secondary">{e.name}:</span>
          <span className="text-text-primary font-medium">{e.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Custom pie label ──────────────────────────────────── */
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="#f1f5f9" textAnchor="middle" dominantBaseline="central" className="text-xs font-semibold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/* ── Skeleton helpers ──────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-52 h-6 rounded bg-surface-light mb-2" />
      <div className="w-80 h-4 rounded bg-surface-light mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-surface-light" />
        ))}
      </div>
    </div>
  )
}

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
   Operations Page
   ══════════════════════════════════════════════════════════ */
export default function Operations() {
  const zone  = useFilterStore((s) => s.zone)
  const month = useFilterStore((s) => s.month)
  const isMobile = useIsMobile()

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  /* ── Transform backend response to frontend shape ────── */
  const STAT_LABELS = {
    working_days:   { label: 'Working Days',          unit: 'days', fmt: (v) => v.toFixed(1) },
    center_hours:   { label: 'Center Operating Time', unit: 'hrs',  fmt: (v) => v.toFixed(1) },
    teacher_ratio:  { label: 'Student:Teacher Ratio', unit: '',     fmt: (v) => v.toFixed(1) },
    center_visits:  { label: 'Center Visits',         unit: '',     fmt: (v) => Math.round(v).toLocaleString() },
  }

  const SHORT_MONTHS = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const MONTH_KEY_MAP = {}  // built dynamically from backend months

  function transformResponse(raw) {
    // kpis
    const kpis = Object.entries(raw.stats || {}).map(([k, v]) => {
      const c = STAT_LABELS[k] || { label: k, unit: '', fmt: (x) => x }
      return { label: c.label, value: c.fmt(v), unit: c.unit }
    })

    // centerOperatingTime
    const centerOperatingTime = (raw.center_hours_by_zone || []).map((z) => ({
      zone: z.zone,
      hours: z.hours,
    }))

    // activityCompletion - flatten monthly_values to short month keys
    const activityCompletion = (raw.activity_completion || []).map((row) => {
      const flat = { activity: row.activity, avg: row.avg != null ? +(row.avg * 100).toFixed(1) : null }
      // Map backend month keys to short names
      if (row.monthly_values) {
        Object.entries(row.monthly_values).forEach(([monthKey, val]) => {
          const lower = monthKey.toLowerCase()
          const short = SHORT_MONTHS.find((s) => lower.startsWith(s))
          if (short) flat[short] = val != null ? +(val * 100).toFixed(1) : null
        })
      }
      return flat
    })

    // quarterlyImprovement
    const quarterlyImprovement = (raw.quarterly_improvement || []).map((q) => ({
      zone: q.zone,
      q1: q.q1_improvement,
      q2: q.q2_improvement,
      q3: q.q3_improvement || 0,
    }))

    return { kpis, centerOperatingTime, visitDistribution: [], activityCompletion, quarterlyImprovement }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .get('/operations', { params: { zone, month } })
      .then((res) => { if (!cancelled) setData(transformResponse(res.data)) })
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
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load operations data</h3>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    )
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading || !data) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="w-44 h-7 rounded bg-surface-light mb-2" />
          <div className="w-72 h-4 rounded bg-surface-light" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <ZoneBarChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  const {
    kpis = [],
    centerOperatingTime = [],
    visitDistribution = [],
    activityCompletion = [],
    quarterlyImprovement = [],
  } = data

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Operations</h1>
        <p className="text-text-secondary text-sm mt-1">
          Operational metrics for{' '}
          <span className="text-accent-400 font-medium">{zone === 'All' ? 'All Zones' : zone}</span>
          {' · '}
          <span className="text-accent-400 font-medium">{month}</span>
        </p>
      </div>

      {/* ── ROW 1 — KPI Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
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

      {/* ── ROW 2 — Charts ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Left: Horizontal bar — Center Operating Time per zone */}
        <ZoneBarChart
          data={centerOperatingTime}
          dataKey="hours"
          title="Center Operating Time"
          subtitle="Total hours per zone (sorted by highest)"
          unit="hrs"
          height={360}
        />

        {/* Right: Pie — Visit distribution */}
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Center Visit Distribution</h3>
          <p className="text-xs text-text-secondary mb-5">External vs Internal member visits</p>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
            <PieChart>
              <Pie
                data={visitDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={3}
                labelLine={false}
                label={renderPieLabel}
                strokeWidth={0}
              >
                {visitDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 3 — Activity Completion Table ────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 mb-8 overflow-x-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Activity Completion</h3>
        <p className="text-xs text-text-secondary mb-5">Monthly completion rates — colour-coded by performance</p>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-lighter/20">
              <th className="text-left py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider whitespace-nowrap">Activity</th>
              {TABLE_MONTHS.map((m) => (
                <th key={m} className="text-center py-3 px-2 text-text-secondary font-medium text-xs uppercase tracking-wider">{m}</th>
              ))}
              <th className="text-center py-3 px-2 text-text-secondary font-medium text-xs uppercase tracking-wider">Avg</th>
            </tr>
          </thead>
          <tbody>
            {activityCompletion.map((row, ri) => (
              <tr key={ri} className="border-b border-surface-lighter/10 hover:bg-surface-light/30 transition-colors">
                <td className="py-2.5 px-3 text-text-primary font-medium whitespace-nowrap">{row.activity}</td>
                {TABLE_MONTHS.map((m) => {
                  const val = row[m.toLowerCase()]
                  return (
                    <td key={m} className="text-center py-2.5 px-2">
                      <span className={`inline-block min-w-[42px] px-2 py-1 rounded-lg text-xs font-semibold ${cellColor(val)}`}>
                        {val != null ? `${val}%` : '—'}
                      </span>
                    </td>
                  )
                })}
                <td className="text-center py-2.5 px-2">
                  <span className={`inline-block min-w-[42px] px-2 py-1 rounded-lg text-xs font-bold ${cellColor(row.avg)}`}>
                    {row.avg != null ? `${row.avg}%` : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ROW 4 — Quarterly Improvement ────────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Quarterly Improvement</h3>
        <p className="text-xs text-text-secondary mb-5">Improvement percentage across zones</p>
        <ResponsiveContainer width="100%" height={isMobile ? 220 : 320}>
          <BarChart data={quarterlyImprovement} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              unit="%"
            />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="q1" name="Q1" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="q2" name="Q2" fill="#34d399" radius={[6, 6, 0, 0]} barSize={20} />
            <Bar dataKey="q3" name="Q3" fill="#fbbf24" radius={[6, 6, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

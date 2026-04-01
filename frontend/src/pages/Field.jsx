import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'
import KPICard, { KPICardSkeleton } from '../components/KPICard'

/* ── KPI meta for ROW 1 ───────────────────────────────── */
const statMeta = [
  { icon: '🎓', color: '#818cf8' },
  { icon: '🚸', color: '#f87171' },
  { icon: '🏫', color: '#34d399' },
  { icon: '🏥', color: '#60a5fa' },
  { icon: '🍽️', color: '#fbbf24' },
  { icon: '🩹', color: '#a78bfa' },
]

/* ── Achievement card meta ─────────────────────────────── */
const achieveMeta = [
  { icon: '🤝', color: '#818cf8' },
  { icon: '💼', color: '#34d399' },
  { icon: '🏆', color: '#fbbf24' },
  { icon: '📚', color: '#60a5fa' },
  { icon: '🔟', color: '#a78bfa' },
  { icon: '1️⃣2️⃣', color: '#f87171' },
]

/* ── Progress bar colour by % ──────────────────────────── */
function barGradient(v) {
  if (v >= 80) return 'from-emerald-500 to-emerald-400'
  if (v >= 60) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

/* ── Dark tooltip ──────────────────────────────────────── */
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

/* ── Skeletons ─────────────────────────────────────────── */
function ChartSkeleton({ height = 300 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-2" />
      <div className="w-64 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

function ProgressSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-52 h-6 rounded bg-surface-light mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-40 h-4 rounded bg-surface-light" />
            <div className="flex-1 h-6 rounded-full bg-surface-light" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 rounded bg-surface-light" />)}
      </div>
    </div>
  )
}

/* Funnel bar colours */
const FUNNEL_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309']

/* ══════════════════════════════════════════════════════════
   Field Activities Page
   ══════════════════════════════════════════════════════════ */
export default function FieldActivities() {
  const zone  = useFilterStore((s) => s.zone)
  const month = useFilterStore((s) => s.month)

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  /* ── Transform backend response to frontend shape ────── */
  const STAT_MAP = {
    nios_enrolled_pct:   { label: 'NIOS Enrolled',           unit: '%', fmt: (v) => (v * 100).toFixed(1) },
    out_of_school_pct:   { label: 'Out of School',           unit: '%', fmt: (v) => (v * 100).toFixed(1) },
    formal_school_pct:   { label: 'Formal School',           unit: '%', fmt: (v) => (v * 100).toFixed(1) },
    health_camps:        { label: 'Health Camps',             unit: '',  fmt: (v) => Math.round(v).toLocaleString() },
    meals:               { label: 'Meals Served',             unit: '',  fmt: (v) => Math.round(v).toLocaleString() },
    sanitary_pads:       { label: 'Sanitary Pads Distributed',unit: '',  fmt: (v) => Math.round(v).toLocaleString() },
  }

  const ACHIEVE_MAP = {
    self_help_groups:    { label: 'Self Help Groups',  unit: '' },
    students_placed:     { label: 'Students Placed',   unit: '' },
    scholarships:        { label: 'Scholarships',      unit: '' },
    pursuing_graduation: { label: 'Pursuing Graduation',unit: '' },
    scored_60_10th:      { label: 'Scored 60%+ (10th)', unit: '' },
    scored_60_12th:      { label: 'Scored 60%+ (12th)', unit: '' },
  }

  const CAREER_MAP = {
    counselling:         { label: 'Career Counselling' },
    career_courses:      { label: 'Career Courses' },
    library:             { label: 'Library Usage' },
    competitive_cleared: { label: 'Competitive Exams Cleared' },
    sports_reps:         { label: 'Sports Representatives' },
  }

  function transformResponse(raw) {
    // kpis
    const kpis = Object.entries(raw.stats || {}).map(([k, v]) => {
      const c = STAT_MAP[k] || { label: k, unit: '', fmt: (x) => x }
      return { label: c.label, value: c.fmt(v), unit: c.unit }
    })

    // funnel — add percent relative to first stage
    const rawFunnel = raw.inclusion_funnel || []
    const maxFunnel = rawFunnel.length ? Math.max(...rawFunnel.map((f) => f.value), 1) : 1
    const funnel = rawFunnel.map((f) => ({
      stage: f.stage,
      value: +(f.value * 100).toFixed(1),
      percent: +((f.value / maxFunnel) * 100).toFixed(0),
    }))

    // achievements
    const achievements = Object.entries(raw.achievements || {}).map(([k, v]) => {
      const c = ACHIEVE_MAP[k] || { label: k, unit: '' }
      return { label: c.label, value: Math.round(v).toLocaleString(), unit: c.unit }
    })

    // activities
    const activities = (raw.activities_progress || []).map((a) => ({
      label: a.activity,
      value: +(a.value_pct * 100).toFixed(1),
    }))

    // careerTable
    const careerTable = Object.entries(raw.career || {}).map(([k, v]) => {
      const c = CAREER_MAP[k] || { label: k }
      return { label: c.label, value: Math.round(v).toLocaleString() }
    })

    return { kpis, funnel, achievements, activities, careerTable }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .get('/field', { params: { zone, month } })
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
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load field data</h3>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    )
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading || !data) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="w-48 h-7 rounded bg-surface-light mb-2" />
          <div className="w-72 h-4 rounded bg-surface-light" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <ChartSkeleton height={240} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 my-8">
          {Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <ProgressSkeleton />
        <div className="mt-8"><TableSkeleton /></div>
      </div>
    )
  }

  const {
    kpis = [],
    funnel = [],
    achievements = [],
    activities = [],
    careerTable = [],
  } = data

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Field Activities</h1>
        <p className="text-text-secondary text-sm mt-1">
          Community outreach & inclusion metrics for{' '}
          <span className="text-accent-400 font-medium">{zone === 'All' ? 'All Zones' : zone}</span>
          {' · '}
          <span className="text-accent-400 font-medium">{month}</span>
        </p>
      </div>

      {/* ── ROW 1 — 6 Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {kpis.map((kpi, i) => {
          const m = statMeta[i] || statMeta[0]
          return (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              icon={m.icon}
              color={m.color}
            />
          )
        })}
      </div>

      {/* ── ROW 2 — Inclusion Funnel (horizontal bars) ──── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Inclusion Funnel</h3>
        <p className="text-xs text-text-secondary mb-5">
          Progression: Out of School → Enrolled in NGO → Enrolled Formal School → NIOS
        </p>
        <ResponsiveContainer width="100%" height={Math.max(200, funnel.length * 56)}>
          <BarChart
            data={funnel}
            layout="vertical"
            margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
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
              dataKey="stage"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={180}
            />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]} barSize={28}>
              {funnel.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
              ))}
              <LabelList
                dataKey="percent"
                position="right"
                style={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                formatter={(v) => `${v}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── ROW 3 — Achievement Cards ────────────────────── */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {achievements.map((kpi, i) => {
            const m = achieveMeta[i] || achieveMeta[0]
            return (
              <KPICard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                unit={kpi.unit}
                trend={kpi.trend}
                trendValue={kpi.trendValue}
                icon={m.icon}
                color={m.color}
              />
            )
          })}
        </div>
      </div>

      {/* ── ROW 4 — Activities Progress Bars ─────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Activities Progress</h3>
        <p className="text-xs text-text-secondary mb-6">Completion rates across key field activities</p>

        <div className="space-y-4">
          {activities.map((act) => {
            const pct = typeof act.value === 'string' ? parseFloat(act.value) : act.value
            return (
              <div key={act.label} className="flex items-center gap-4">
                <span className="w-48 text-sm text-text-secondary truncate flex-shrink-0">{act.label}</span>
                <div className="flex-1 h-7 rounded-full bg-surface-light/60 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient(pct)} transition-all duration-700`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-12 text-right flex-shrink-0 ${
                  pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {pct}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ROW 5 — Career & Competitive Table ───────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 overflow-x-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Career & Competitive</h3>
        <p className="text-xs text-text-secondary mb-5">Key career and competitive achievement metrics</p>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-lighter/20">
              <th className="text-left py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Metric</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Value</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Change</th>
            </tr>
          </thead>
          <tbody>
            {careerTable.map((row, ri) => (
              <tr key={ri} className="border-b border-surface-lighter/10 hover:bg-surface-light/30 transition-colors">
                <td className="py-3 px-3 text-text-primary font-medium">{row.label}</td>
                <td className="py-3 px-3 text-right text-text-primary font-semibold">{row.value}</td>
                <td className="py-3 px-3 text-right">
                  {row.trend === 'up' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                      {row.trendValue}
                    </span>
                  ) : row.trend === 'down' ? (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                      </svg>
                      {row.trendValue}
                    </span>
                  ) : (
                    <span className="text-text-muted text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

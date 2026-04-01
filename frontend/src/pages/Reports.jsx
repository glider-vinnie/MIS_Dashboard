import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'
import { KPICardSkeleton } from '../components/KPICard'

/* ── Zone palette ──────────────────────────────────────── */
const ZONE_COLORS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#e879f9', '#38bdf8', '#4ade80',
]

/* ── Insight icons ─────────────────────────────────────── */
const INSIGHT_ICONS = ['💡', '📊', '🎯', '🔍']
const INSIGHT_COLORS = [
  { bg: 'rgba(129,140,248,0.12)', border: 'border-accent-500/20' },
  { bg: 'rgba(52,211,153,0.12)',  border: 'border-emerald-500/20' },
  { bg: 'rgba(251,191,36,0.12)', border: 'border-amber-500/20' },
  { bg: 'rgba(96,165,250,0.12)',  border: 'border-blue-500/20' },
]

/* ── Medal icons ───────────────────────────────────────── */
const MEDALS = ['🥇', '🥈', '🥉']

/* ── Metric toggle options ─────────────────────────────── */
const METRIC_OPTIONS = [
  { key: 'performanceScore', label: 'Performance Score' },
  { key: 'attendance',       label: 'Attendance' },
  { key: 'academic',         label: 'Academic Performance' },
]

/* ── INR formatter ─────────────────────────────────────── */
const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 1,
})

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
function ChartSkeleton({ height = 320 }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-48 h-6 rounded bg-surface-light mb-2" />
      <div className="w-64 h-4 rounded bg-surface-light mb-6" />
      <div className="rounded-xl bg-surface-light" style={{ height }} />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
      <div className="w-52 h-6 rounded bg-surface-light mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-10 rounded bg-surface-light" />)}
      </div>
    </div>
  )
}

/* ── Download helper ───────────────────────────────────── */
async function handleExport(format, zone, month) {
  try {
    const res = await api.get('/reports/export', {
      params: { format, zone, month },
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `ngo-mis-report-${zone}-${month}.${format}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    // silently fail — toast can be added later
  }
}

/* ══════════════════════════════════════════════════════════
   Reports Page
   ══════════════════════════════════════════════════════════ */
export default function Reports() {
  const zone  = useFilterStore((s) => s.zone)
  const month = useFilterStore((s) => s.month)

  const [data, setData]             = useState(null)
  const [insights, setInsights]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [activeMetric, setMetric]   = useState('performanceScore')
  const [exporting, setExporting]   = useState(null) // 'csv' | 'pdf' | null

  /* Fetch summary + insights in parallel */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      api.get('/reports/summary', { params: { zone, month } }),
      api.get('/reports/insights', { params: { zone, month } }),
    ])
      .then(([summaryRes, insightsRes]) => {
        if (!cancelled) {
          setData(summaryRes.data)
          setInsights(insightsRes.data?.insights ?? [])
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [zone, month])

  /* export wrapper */
  const doExport = async (fmt) => {
    setExporting(fmt)
    await handleExport(fmt, zone, month)
    setExporting(null)
  }

  /* ── Error ───────────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load reports</h3>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    )
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading || !data) {
    return (
      <div>
        <div className="mb-8 animate-pulse">
          <div className="w-56 h-7 rounded bg-surface-light mb-2" />
          <div className="w-80 h-4 rounded bg-surface-light" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
        </div>
        <TableSkeleton />
        <div className="mt-8"><ChartSkeleton /></div>
      </div>
    )
  }

  const {
    leaderboard = [],
    quarterData = [],
  } = data

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Reports</h1>
        <p className="text-text-secondary text-sm mt-1">
          Strategic analysis for{' '}
          <span className="text-accent-400 font-medium">{zone === 'All' ? 'All Zones' : zone}</span>
          {' · '}
          <span className="text-accent-400 font-medium">{month}</span>
        </p>
      </div>

      {/* ── SECTION 1 — Data-Driven Insights ─────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Data-Driven Strategic Insights</h3>
            <p className="text-xs text-text-secondary">Auto-generated from your program data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(insights ?? []).slice(0, 4).map((ins, i) => {
            const style = INSIGHT_COLORS[i % INSIGHT_COLORS.length]
            return (
              <div key={i} className={`rounded-xl p-4 border ${style.border} bg-surface-light/30 hover:bg-surface-light/50 transition-colors`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: style.bg }}>
                    {INSIGHT_ICONS[i % INSIGHT_ICONS.length]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary mb-1">{ins.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{ins.text}</p>
                    {ins.metric && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-bold">
                        {ins.metric}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SECTION 2 — Zone Performance Leaderboard ────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 mb-8 overflow-x-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Zone Performance Leaderboard</h3>
        <p className="text-xs text-text-secondary mb-5">Ranked by overall Performance Score</p>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-lighter/20">
              <th className="text-center py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider w-16">Rank</th>
              <th className="text-left  py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Zone</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Score</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Attendance %</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Dropout %</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Academic %</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Expenditure</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => {
              const rank = i + 1
              const isMedal = rank <= 3
              return (
                <tr key={row.zone}
                  className={`border-b border-surface-lighter/10 hover:bg-surface-light/30 transition-colors ${
                    isMedal ? 'bg-surface-light/15' : ''
                  }`}
                >
                  <td className="text-center py-3 px-3">
                    {isMedal ? (
                      <span className="text-lg">{MEDALS[rank - 1]}</span>
                    ) : (
                      <span className="text-text-muted font-medium">{rank}</span>
                    )}
                  </td>
                  <td className={`py-3 px-3 font-semibold ${isMedal ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {row.zone}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-bold ${
                      row.performanceScore >= 80 ? 'bg-emerald-500/15 text-emerald-400'
                        : row.performanceScore >= 60 ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}>
                      {row.performanceScore}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-text-primary font-medium">{row.attendance}%</td>
                  <td className="py-3 px-3 text-right text-text-primary font-medium">{row.dropout}%</td>
                  <td className="py-3 px-3 text-right text-text-primary font-medium">{row.academic}%</td>
                  <td className="py-3 px-3 text-right text-text-secondary text-xs">{row.expenditure != null ? inrCompact.format(row.expenditure) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── SECTION 3 — Quarter-wise Summary ─────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Quarter-wise Comparison</h3>
            <p className="text-xs text-text-secondary">Q1 vs Q2 grouped bars per zone</p>
          </div>
          {/* Metric toggle */}
          <div className="flex bg-surface-light/60 rounded-xl p-1 gap-0.5">
            {METRIC_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMetric(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeMetric === opt.key
                    ? 'bg-accent-500 text-white shadow-md shadow-accent-500/25'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={quarterData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
            <XAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: 'rgba(51,65,85,0.4)' }} tickLine={false} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} iconType="circle" iconSize={8} />
            <Bar dataKey={`q1_${activeMetric}`} name="Q1" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey={`q2_${activeMetric}`} name="Q2" fill="#34d399" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── SECTION 4 — Export Options ────────────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Export Reports</h3>
        <p className="text-xs text-text-secondary mb-5">Download data for offline analysis</p>

        <div className="flex flex-wrap gap-4">
          {/* CSV */}
          <button
            onClick={() => doExport('csv')}
            disabled={exporting === 'csv'}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
              hover:bg-emerald-500/20 active:bg-emerald-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-sm font-semibold">
              {exporting === 'csv' ? 'Downloading…' : 'Download CSV'}
            </span>
          </button>

          {/* PDF */}
          <button
            onClick={() => doExport('pdf')}
            disabled={exporting === 'pdf'}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400
              hover:bg-accent-500/20 active:bg-accent-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-sm font-semibold">
              {exporting === 'pdf' ? 'Downloading…' : 'Download PDF Summary'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

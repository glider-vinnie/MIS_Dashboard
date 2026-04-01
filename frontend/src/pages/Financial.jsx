import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'
import { KPICardSkeleton } from '../components/KPICard'
import CostScatterChart, { CostScatterChartSkeleton } from '../components/ScatterChart'
import ExceptionTracker from '../components/ExceptionTracker'

/* ── INR formatter ─────────────────────────────────────── */
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/* ── Zone palette ──────────────────────────────────────── */
const ZONE_COLORS = [
  '#818cf8', '#34d399', '#fbbf24', '#f87171', '#60a5fa',
  '#a78bfa', '#fb923c', '#e879f9', '#38bdf8', '#4ade80', '#facc15',
]

/* ── Dark tooltip ──────────────────────────────────────── */
function DarkTooltip({ active, payload, label, isCurrency }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a2535] border border-surface-lighter/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      {label && <p className="text-text-primary text-sm font-semibold mb-1.5">{label}</p>}
      {payload.map((e) => (
        <div key={e.name || e.dataKey} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color || e.fill || e.stroke }} />
          <span className="text-text-secondary">{e.name}:</span>
          <span className="text-text-primary font-medium">
            {isCurrency ? inr.format(e.value) : e.value?.toLocaleString('en-IN')}
          </span>
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
        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-9 rounded bg-surface-light" />)}
      </div>
    </div>
  )
}

/* ── Table columns ─────────────────────────────────────── */
const TABLE_COLS = ['Apr', 'May', 'Jun', 'Q1', 'Jul', 'Aug', 'Sep', 'Q2', 'Oct', 'Nov', 'Dec', 'Total']

/* ══════════════════════════════════════════════════════════
   Financial — Transparency & Oversight Page
   ══════════════════════════════════════════════════════════ */
export default function Financial() {
  const zone  = useFilterStore((s) => s.zone)
  const month = useFilterStore((s) => s.month)

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const SHORT = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    function transformResponse(raw) {
      // summary
      const s = raw.summary || {}
      const summary = {
        totalExpenditure: s.total_expenditure,
        highestZone: s.highest_zone,
        highestAmount: null,
        lowestZone: s.lowest_zone,
        lowestAmount: null,
        momChange: s.mom_change_pct,
      }

      // zoneExpenditure
      const zoneExpenditure = (raw.by_zone || []).map((z) => ({
        zone: z.zone,
        amount: z.expenditure,
      }))

      // fill highestAmount / lowestAmount
      const sorted = [...zoneExpenditure].sort((a, b) => b.amount - a.amount)
      if (sorted.length) {
        summary.highestAmount = sorted[0].amount
        summary.lowestAmount = sorted[sorted.length - 1].amount
      }

      // monthlyTrend + trendZones
      const monthlyTrend = raw.trends || []
      const sampleTrend = monthlyTrend[0] || {}
      const trendZones = Object.keys(sampleTrend).filter((k) => k !== 'month')

      // scatterData + scatterZones
      const scatterData = (raw.scatter || []).map((pt) => ({
        zone: pt.zone,
        month: pt.month,
        expenditure: pt.expenditure,
        performance: pt.performance_score,
      }))
      const scatterZones = [...new Set(scatterData.map((p) => p.zone))]

      // expenditureTable – flatten monthly_values to {zone, apr, may, ..., q1, q2, total}
      const expenditureTable = (raw.zone_table || []).map((row) => {
        const flat = { zone: row.zone, total: row.total }
        const mvArr = Object.entries(row.monthly_values || {})
        let q1Sum = 0, q2Sum = 0
        mvArr.forEach(([monthKey, val]) => {
          const lower = monthKey.toLowerCase()
          const short = SHORT.find((s) => lower.startsWith(s))
          if (short) {
            flat[short] = val
            const idx = SHORT.indexOf(short)
            if (idx < 3) q1Sum += (val || 0)
            else if (idx < 6) q2Sum += (val || 0)
          }
        })
        flat.q1 = Math.round(q1Sum)
        flat.q2 = Math.round(q2Sum)
        return flat
      })

      return { summary, zoneExpenditure, monthlyTrend, trendZones, scatterData, scatterZones, expenditureTable }
    }

    api
      .get('/financial', { params: { zone, month } })
      .then((res) => { if (!cancelled) setData(transformResponse(res.data)) })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [zone, month])

  const { sortedRows, top3, bottom3 } = useMemo(() => {
    if (!data?.expenditureTable?.length) return { sortedRows: [], top3: new Set(), bottom3: new Set() }
    const rows = [...data.expenditureTable].sort((a, b) =>
      sortDir === 'desc' ? (b.total ?? 0) - (a.total ?? 0) : (a.total ?? 0) - (b.total ?? 0)
    )
    const byTotal = [...data.expenditureTable].sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
    return {
      sortedRows: rows,
      top3: new Set(byTotal.slice(0, 3).map((r) => r.zone)),
      bottom3: new Set(byTotal.slice(-3).map((r) => r.zone)),
    }
  }, [data?.expenditureTable, sortDir])

  /* ── Error ───────────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Failed to load financial data</h3>
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
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <CostScatterChartSkeleton />
        <div className="mt-8"><TableSkeleton /></div>
      </div>
    )
  }

  const {
    summary = {},
    zoneExpenditure = [],
    monthlyTrend = [],
    trendZones = [],
    scatterData = [],
    scatterZones = [],
  } = data

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Financial</h1>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-accent-500/15 text-accent-400 border border-accent-500/20">
            Transparency & Oversight
          </span>
        </div>
        <p className="text-text-secondary text-sm">
          Expenditure analysis for{' '}
          <span className="text-accent-400 font-medium">{zone === 'All' ? 'All Zones' : zone}</span>
          {' · '}
          <span className="text-accent-400 font-medium">{month}</span>
        </p>
      </div>

      {/* ── ROW 1 — Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'rgba(129,140,248,0.12)' }}>💰</div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">
            {summary.totalExpenditure != null ? inr.format(summary.totalExpenditure) : '—'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Total Monthly Expenditure</p>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'rgba(248,113,113,0.12)' }}>📈</div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{summary.highestZone || '—'}</p>
          <p className="text-xs text-text-secondary mt-1">
            Highest Spending Zone
            {summary.highestAmount != null && <span className="text-red-400 font-medium ml-1">({inrCompact.format(summary.highestAmount)})</span>}
          </p>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'rgba(52,211,153,0.12)' }}>📉</div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">{summary.lowestZone || '—'}</p>
          <p className="text-xs text-text-secondary mt-1">
            Lowest Spending Zone
            {summary.lowestAmount != null && <span className="text-emerald-400 font-medium ml-1">({inrCompact.format(summary.lowestAmount)})</span>}
          </p>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-surface-lighter/20">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(251,191,36,0.12)' }}>📊</div>
            {summary.momChange != null && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${summary.momChange >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {summary.momChange >= 0 ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                  </svg>
                )}
                {Math.abs(summary.momChange)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-text-primary tracking-tight">
            {summary.momChange != null ? `${summary.momChange >= 0 ? '+' : ''}${summary.momChange}%` : '—'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Month-on-Month Change</p>
        </div>
      </div>

      {/* ── ROW 2 — Expenditure Charts ───────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Zone Expenditure</h3>
          <p className="text-xs text-text-secondary mb-5">Monthly expenditure per zone (INR)</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={zoneExpenditure} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
              <XAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: 'rgba(51,65,85,0.4)' }} tickLine={false} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => inrCompact.format(v)} />
              <Tooltip content={<DarkTooltip isCurrency />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="amount" name="Expenditure" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Expenditure Trend</h3>
          <p className="text-xs text-text-secondary mb-5">Monthly spending per zone (Apr–Dec 2025)</p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(51,65,85,0.4)' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => inrCompact.format(v)} />
              <Tooltip content={<DarkTooltip isCurrency />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} iconType="circle" iconSize={8} />
              {trendZones.map((z, i) => (
                <Line key={z} type="monotone" dataKey={z} name={z} stroke={ZONE_COLORS[i % ZONE_COLORS.length]} strokeWidth={2}
                  dot={{ r: 3, fill: ZONE_COLORS[i % ZONE_COLORS.length], stroke: '#0f1724', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROW 3 — Scatter Chart ────────────────────────── */}
      <div className="mb-8">
        <CostScatterChart
          data={scatterData}
          zones={scatterZones}
          xKey="expenditure"
          yKey="performance"
          xLabel="Monthly Expenditure (INR)"
          yLabel="Performance Score"
          xFormatter={(v) => inrCompact.format(v)}
          title="Cost Efficiency: Expenditure vs Performance Score"
          subtitle="Each point = one zone × one month"
        />
      </div>

      {/* ── ROW 4 — Zone Expenditure Detail Table ────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 overflow-x-auto mb-10">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-text-primary mb-1">Zone Expenditure Detail</h3>
          <p className="text-xs text-text-secondary">
            Top 3 spenders in <span className="text-red-400 font-medium">red</span>, bottom 3 in <span className="text-emerald-400 font-medium">green</span>
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-lighter/20">
              <th className="text-left py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider whitespace-nowrap">Zone</th>
              {TABLE_COLS.map((col) => (
                <th key={col}
                  className={`text-right py-3 px-2 text-text-secondary font-medium text-xs uppercase tracking-wider whitespace-nowrap ${
                    col === 'Total' ? 'cursor-pointer hover:text-text-primary select-none' : ''
                  } ${['Q1', 'Q2'].includes(col) ? 'bg-surface-light/30' : ''}`}
                  onClick={col === 'Total' ? () => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc')) : undefined}
                >
                  {col}{col === 'Total' && <span className="ml-1 text-accent-400">{sortDir === 'desc' ? '↓' : '↑'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const isTop = top3.has(row.zone)
              const isBot = bottom3.has(row.zone)
              const rowAccent = isTop ? 'text-red-400' : isBot ? 'text-emerald-400' : 'text-text-primary'
              return (
                <tr key={row.zone} className="border-b border-surface-lighter/10 hover:bg-surface-light/30 transition-colors">
                  <td className={`py-2.5 px-3 font-semibold whitespace-nowrap ${rowAccent}`}>
                    {row.zone}
                    {isTop && <span className="ml-1.5 text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-full">High</span>}
                    {isBot && <span className="ml-1.5 text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full">Low</span>}
                  </td>
                  {TABLE_COLS.map((col) => {
                    const key = col.toLowerCase()
                    const val = row[key]
                    const isQuarter = ['q1', 'q2'].includes(key)
                    return (
                      <td key={col} className={`text-right py-2.5 px-2 text-text-primary text-xs font-medium whitespace-nowrap ${
                        isQuarter ? 'bg-surface-light/30 font-bold' : ''} ${col === 'Total' ? 'font-bold' : ''}`}>
                        {val != null ? numFmt.format(val) : '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── ROW 5 — Exception & Compliance Tracker ───────── */}
      <div className="border-t border-surface-lighter/15 pt-10">
        <ExceptionTracker />
      </div>
    </div>
  )
}

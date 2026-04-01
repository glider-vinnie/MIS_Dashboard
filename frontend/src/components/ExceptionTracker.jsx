import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '../services/api'
import { useFilterStore } from '../store/filterStore'

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

/* ── Progress bar colour ───────────────────────────────── */
function rateGradient(v) {
  if (v >= 80) return 'from-emerald-500 to-emerald-400'
  if (v >= 50) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}
function rateText(v) {
  if (v >= 80) return 'text-emerald-400'
  if (v >= 50) return 'text-amber-400'
  return 'text-red-400'
}

/* ── Status badge ──────────────────────────────────────── */
function StatusBadge({ rate }) {
  if (rate >= 80)
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">On Track</span>
  if (rate >= 50)
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">At Risk</span>
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Critical</span>
}

/* ── Skeleton ──────────────────────────────────────────── */
function PanelSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 border border-surface-lighter/20">
            <div className="w-10 h-10 rounded-xl bg-surface-light mb-3" />
            <div className="w-20 h-7 rounded bg-surface-light mb-1" />
            <div className="w-32 h-4 rounded bg-surface-light" />
          </div>
        ))}
      </div>
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
        <div className="w-48 h-6 rounded bg-surface-light mb-6" />
        <div className="h-72 rounded-xl bg-surface-light" />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ExceptionTracker — Compliance panel
   ══════════════════════════════════════════════════════════ */
export default function ExceptionTracker() {
  const zone  = useFilterStore((s) => s.zone)
  const month = useFilterStore((s) => s.month)

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    function transformResponse(raw) {
      const s = raw.summary || {}
      const summary = {
        totalRaised: s.total_raised,
        totalResolved: s.total_resolved,
        avgResolutionRate: s.avg_resolution_rate != null ? +(s.avg_resolution_rate * 100).toFixed(1) : 0,
      }

      const zones = (raw.by_zone || []).map((z) => ({
        zone: z.zone,
        exceptions_raised: z.raised,
        exceptions_resolved: z.resolved,
        resolution_rate: z.resolution_rate != null ? +(z.resolution_rate * 100).toFixed(1) : 0,
      }))

      return { summary, zones }
    }

    api
      .get('/financial/exceptions', { params: { zone, month } })
      .then((res) => { if (!cancelled) setData(transformResponse(res.data)) })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [zone, month])

  /* ── Error ───────────────────────────────────────────── */
  if (error) {
    return (
      <div className="bg-surface rounded-2xl p-6 border border-red-500/20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading || !data) return <PanelSkeleton />

  const {
    summary = {},
    zones: zoneData = [],
  } = data

  /* Build stacked chart data: resolved (green) + unresolved (red) */
  const chartData = zoneData.map((z) => ({
    zone: z.zone,
    resolved: z.exceptions_resolved,
    unresolved: z.exceptions_raised - z.exceptions_resolved,
  }))

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Exception & Compliance Tracker</h3>
          <p className="text-xs text-text-secondary">Cumulative exception status across zones</p>
        </div>
      </div>

      {/* ── (2) Summary Cards ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface-light/40 rounded-2xl p-5 border border-surface-lighter/15">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'rgba(248,113,113,0.12)' }}>🚨</div>
          <p className="text-2xl font-bold text-text-primary">{summary.totalRaised?.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-text-secondary mt-1">Total Raised</p>
        </div>
        <div className="bg-surface-light/40 rounded-2xl p-5 border border-surface-lighter/15">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'rgba(52,211,153,0.12)' }}>✅</div>
          <p className="text-2xl font-bold text-text-primary">{summary.totalResolved?.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-text-secondary mt-1">Total Resolved</p>
        </div>
        <div className="bg-surface-light/40 rounded-2xl p-5 border border-surface-lighter/15">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3" style={{ background: 'rgba(129,140,248,0.12)' }}>📈</div>
          <p className={`text-2xl font-bold ${rateText(summary.avgResolutionRate ?? 0)}`}>
            {summary.avgResolutionRate != null ? `${summary.avgResolutionRate}%` : '—'}
          </p>
          <p className="text-xs text-text-secondary mt-1">Avg Resolution Rate</p>
        </div>
      </div>

      {/* ── (3) Stacked Bar Chart ────────────────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Exceptions by Zone</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
            <XAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: 'rgba(51,65,85,0.4)' }} tickLine={false} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }} iconType="circle" iconSize={8} />
            <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} barSize={28} />
            <Bar dataKey="unresolved" name="Unresolved" stackId="a" fill="#f87171" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── (4) Resolution Rate Gauges ───────────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Resolution Rate by Zone</h4>
        <div className="space-y-3">
          {zoneData.map((z) => {
            const rate = z.resolution_rate ?? 0
            return (
              <div key={z.zone} className="flex items-center gap-4">
                <span className="w-28 text-sm text-text-secondary truncate flex-shrink-0">{z.zone}</span>
                <div className="flex-1 h-6 rounded-full bg-surface-light/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${rateGradient(rate)} transition-all duration-700`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-12 text-right flex-shrink-0 ${rateText(rate)}`}>
                  {rate}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── (5) Detail Table ─────────────────────────────── */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 overflow-x-auto">
        <h4 className="text-sm font-semibold text-text-primary mb-4">Zone Detail</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-lighter/20">
              <th className="text-left py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Zone</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Raised</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Resolved</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Unresolved</th>
              <th className="text-right py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Rate %</th>
              <th className="text-center py-3 px-3 text-text-secondary font-medium text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {zoneData.map((z) => {
              const unresolved = z.exceptions_raised - z.exceptions_resolved
              return (
                <tr key={z.zone} className="border-b border-surface-lighter/10 hover:bg-surface-light/30 transition-colors">
                  <td className="py-2.5 px-3 text-text-primary font-medium">{z.zone}</td>
                  <td className="py-2.5 px-3 text-right text-text-primary">{z.exceptions_raised}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{z.exceptions_resolved}</td>
                  <td className="py-2.5 px-3 text-right text-red-400 font-medium">{unresolved}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${rateText(z.resolution_rate)}`}>{z.resolution_rate}%</td>
                  <td className="py-2.5 px-3 text-center"><StatusBadge rate={z.resolution_rate} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

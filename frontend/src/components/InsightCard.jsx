/**
 * InsightCard — Amber-bordered card for strategic insight display.
 *
 * Props:
 *   icon   — emoji string or ReactNode
 *   title  — insight title
 *   text   — 1-sentence insight description
 *   metric — supporting metric badge text (e.g. "28% → 13%")
 *   trend  — 'up' | 'down' | 'neutral' (optional, tints the metric badge)
 */
export default function InsightCard({ icon = '💡', title, text, metric, trend }) {
  const trendBadge = {
    up:   'bg-emerald-500/10 text-emerald-400',
    down: 'bg-red-500/10 text-red-400',
  }
  const badgeCls = trendBadge[trend] || 'bg-accent-500/10 text-accent-400'

  return (
    <div className="rounded-xl p-4 border border-amber-500/20 bg-surface-light/30 hover:bg-surface-light/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-amber-500/12">
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-text-primary mb-1">{title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">{text}</p>
          {metric && (
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeCls}`}>
              {metric}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * EmptyState — Shown when API returns empty data sets.
 *
 * Props:
 *   title       — main message (default "No data available")
 *   message     — suggestion text
 *   icon        — optional emoji (default 📭)
 *   actionLabel — optional button text
 *   onAction    — optional button click handler
 */
export default function EmptyState({
  title = 'No data available',
  message = 'Try adjusting your filters or check back later.',
  icon = '📭',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Illustration placeholder */}
      <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mb-5 border border-surface-lighter/20">
        <span className="text-4xl">{icon}</span>
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm leading-relaxed mb-6">{message}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-500/10 border border-accent-500/20
            text-accent-400 text-sm font-semibold hover:bg-accent-500/20 transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

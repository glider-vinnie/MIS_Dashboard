/**
 * ProgressBar — Horizontal progress bar with label and value.
 *
 * Props:
 *   value       — current value (number)
 *   max         — maximum value (default 100)
 *   label       — text label on the left
 *   colorScheme — 'performance' (green>=80, amber>=60, red<60) | 'neutral' (indigo)
 */

function getGradient(scheme, pct) {
  if (scheme === 'neutral') return 'from-indigo-500 to-indigo-400'
  if (pct >= 80) return 'from-emerald-500 to-emerald-400'
  if (pct >= 60) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

function getValueColor(scheme, pct) {
  if (scheme === 'neutral') return 'text-indigo-400'
  if (pct >= 80) return 'text-emerald-400'
  if (pct >= 60) return 'text-amber-400'
  return 'text-red-400'
}

export default function ProgressBar({ value = 0, max = 100, label, colorScheme = 'performance' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const clampedPct = Math.min(pct, 100)

  return (
    <div className="flex items-center gap-4">
      {label && (
        <span className="w-48 text-sm text-text-secondary truncate flex-shrink-0">{label}</span>
      )}
      <div className="flex-1 h-7 rounded-full bg-surface-light/60 overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(colorScheme, pct)} transition-all duration-700 ease-out`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      <span className={`text-sm font-bold w-12 text-right flex-shrink-0 ${getValueColor(colorScheme, pct)}`}>
        {pct}%
      </span>
    </div>
  )
}

/**
 * PerformanceGauge — Circular SVG gauge for scores 0–100.
 *
 * Props:
 *   score   — number 0-100
 *   size    — diameter in px (default 120)
 *   label   — text below the value (default "Performance")
 */
export default function PerformanceGauge({ score = 0, size = 120, label = 'Performance' }) {
  const clamp = Math.max(0, Math.min(100, score))
  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamp / 100) * circumference

  /* Color by range */
  let strokeColor, textColor, bgGlow
  if (clamp >= 80) {
    strokeColor = '#34d399'
    textColor = 'text-emerald-400'
    bgGlow = 'rgba(52,211,153,0.08)'
  } else if (clamp >= 60) {
    strokeColor = '#fbbf24'
    textColor = 'text-amber-400'
    bgGlow = 'rgba(251,191,36,0.08)'
  } else if (clamp >= 40) {
    strokeColor = '#fb923c'
    textColor = 'text-orange-400'
    bgGlow = 'rgba(251,146,60,0.08)'
  } else {
    strokeColor = '#f87171'
    textColor = 'text-red-400'
    bgGlow = 'rgba(248,113,113,0.08)'
  }

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(51,65,85,0.3)"
            strokeWidth={strokeWidth}
          />
          {/* Value arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.4s ease',
              filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
            }}
          />
        </svg>
        {/* Center value */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: `radial-gradient(circle, ${bgGlow} 0%, transparent 70%)` }}
        >
          <span className={`font-bold ${textColor}`} style={{ fontSize: size * 0.28 }}>
            {clamp}
          </span>
        </div>
      </div>
      <span className="text-text-secondary text-xs font-medium">{label}</span>
    </div>
  )
}

/* ── Skeleton ──────────────────────────────────────────── */
export function PerformanceGaugeSkeleton({ size = 120 }) {
  return (
    <div className="flex flex-col items-center gap-1 animate-pulse" style={{ width: size }}>
      <div className="rounded-full bg-surface-light" style={{ width: size, height: size }} />
      <div className="w-16 h-4 rounded bg-surface-light mt-1" />
    </div>
  )
}

/**
 * LoadingSkeleton — Animated gray pulse placeholder.
 *
 * Props:
 *   type  — 'card' | 'chart' | 'table'
 *   count — number of skeleton items to render (default 1, relevant for 'card')
 */
export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 border border-surface-lighter/20 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-surface-light" />
              <div className="w-16 h-5 rounded-full bg-surface-light" />
            </div>
            <div className="w-24 h-8 rounded bg-surface-light mb-1" />
            <div className="w-32 h-4 rounded bg-surface-light" />
          </div>
        ))}
      </>
    )
  }

  if (type === 'chart') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
            <div className="w-48 h-6 rounded bg-surface-light mb-2" />
            <div className="w-64 h-4 rounded bg-surface-light mb-6" />
            <div className="rounded-xl bg-surface-light h-72" />
          </div>
        ))}
      </>
    )
  }

  // type === 'table'
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl p-6 border border-surface-lighter/20 animate-pulse">
          <div className="w-52 h-6 rounded bg-surface-light mb-2" />
          <div className="w-80 h-4 rounded bg-surface-light mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-9 rounded bg-surface-light" />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

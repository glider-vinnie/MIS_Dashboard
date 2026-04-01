import { useState, useEffect, useCallback } from 'react'

/**
 * HelpButton — Floating "?" button that opens a modal with keyboard shortcuts
 * and filter usage tips.
 */
export default function HelpButton() {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((p) => !p), [])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      {/* ── Floating button ────────────────────────────────── */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
          bg-accent-500 text-white shadow-xl shadow-accent-500/30
          flex items-center justify-center
          hover:bg-accent-600 hover:scale-110 active:scale-95
          transition-all duration-200 cursor-pointer"
        aria-label="Help & Shortcuts"
        title="Help & Shortcuts"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 0v.75m0-2.577c0-.828.705-1.466 1.45-1.827.24-.116.467-.263.67-.442 1.172-1.025 1.172-2.687 0-3.712-1.171-1.025-3.071-1.025-4.242 0-1.172 1.025-1.172 2.687 0 3.712.203.179.43.326.67.442M12 18h.01" />
        </svg>
      </button>

      {/* ── Modal overlay ──────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggle} />

          {/* Modal card */}
          <div className="relative bg-sidebar-bg border border-surface-lighter/20 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl shadow-black/50">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-lighter/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827m0 0v.75m0-2.577c0-.828.705-1.466 1.45-1.827.24-.116.467-.263.67-.442 1.172-1.025 1.172-2.687 0-3.712-1.171-1.025-3.071-1.025-4.242 0-1.172 1.025-1.172 2.687 0 3.712.203.179.43.326.67.442M12 18h.01" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-text-primary">Help & Shortcuts</h2>
              </div>
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {/* Keyboard Shortcuts */}
              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-base">⌨️</span> Keyboard Shortcuts
                </h3>
                <div className="space-y-2">
                  {[
                    ['Esc', 'Close modals & sidebars'],
                    ['Ctrl + K', 'Focus zone filter'],
                    ['Ctrl + M', 'Focus month filter'],
                    ['Ctrl + 1-6', 'Navigate to page (1=Overview … 6=Reports)'],
                    ['?', 'Toggle this help panel'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">{desc}</span>
                      <kbd className="px-2 py-0.5 rounded-md bg-surface text-text-primary text-[11px] font-mono font-semibold border border-surface-lighter/30">
                        {key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </section>

              {/* Filter Tips */}
              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-base">🔍</span> Filter Tips
                </h3>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex gap-2">
                    <span className="text-accent-400 flex-shrink-0">•</span>
                    <span><strong className="text-text-primary">Zone = "All"</strong> shows aggregated data across all 10 zones.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-400 flex-shrink-0">•</span>
                    <span>Select a <strong className="text-text-primary">specific zone</strong> to drill down into that zone's data only.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-400 flex-shrink-0">•</span>
                    <span>The <strong className="text-text-primary">Month filter</strong> controls the primary reporting period. Trend charts always show Apr–Dec.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-400 flex-shrink-0">•</span>
                    <span>Filters persist across pages — change once, applied everywhere.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-400 flex-shrink-0">•</span>
                    <span>Tables with a <strong className="text-text-primary">sort arrow (↑↓)</strong> in the header can be sorted by clicking the column.</span>
                  </li>
                </ul>
              </section>

              {/* Data Legend */}
              <section>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <span className="text-base">🎨</span> Color Legend
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-text-secondary">≥ 80% — Good</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-text-secondary">≥ 60% — Fair</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-text-secondary">&lt; 60% — Low</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-surface-lighter/15 text-center">
              <p className="text-[10px] text-text-muted">NGO MIS Dashboard v1.0 · Built for Social Impact</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

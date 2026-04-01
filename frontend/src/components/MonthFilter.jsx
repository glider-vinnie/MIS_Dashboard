/**
 * MonthFilter — Dark pill dropdown for month selection (Apr'25 – Dec'25).
 *
 * Props:
 *   value    — currently selected month string (e.g. "Apr'25")
 *   onChange — callback(newMonthString)
 */

import { MONTHS } from '../store/filterStore'

export default function MonthFilter({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-surface border border-surface-lighter/30 text-text-primary text-sm font-medium
          rounded-full pl-4 pr-9 py-2 cursor-pointer
          hover:border-accent-500/40 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30
          outline-none transition-all"
      >
        {MONTHS.map((m) => (
          <option key={m} value={m} className="bg-surface text-text-primary">
            {m}
          </option>
        ))}
      </select>

      {/* Calendar icon */}
      <svg
        className="w-4 h-4 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    </div>
  )
}

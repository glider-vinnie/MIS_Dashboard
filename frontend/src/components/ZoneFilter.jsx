/**
 * ZoneFilter — Dark pill dropdown for zone selection.
 *
 * Props:
 *   value    — currently selected zone string
 *   onChange — callback(newZoneString)
 */

const ZONES = [
  'All', 'Delhi', 'Gurgaon', 'Pune', 'Nagpur',
  'Mauda', 'Gadarwara', 'Bangalore', 'Kolkata', 'Garo', 'UPAY',
]

export default function ZoneFilter({ value, onChange }) {
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
        {ZONES.map((z) => (
          <option key={z} value={z} className="bg-surface text-text-primary">
            {z === 'All' ? '🌐  All Zones' : z}
          </option>
        ))}
      </select>

      {/* Chevron icon */}
      <svg
        className="w-4 h-4 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </div>
  )
}

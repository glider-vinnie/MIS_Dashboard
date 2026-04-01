import { useState, useMemo } from 'react'

/**
 * DataTable — Sortable dark table with sticky header and alternating rows.
 *
 * Props:
 *   columns  — [{ key: string, label: string, align?: 'left'|'right'|'center',
 *                  colorFn?: (value, row) => className, format?: (value, row) => ReactNode }]
 *   rows     — [{ [key]: any }]
 *   sortable — boolean (default true)
 */
export default function DataTable({ columns = [], rows = [], sortable = true }) {
  const [sortKey, setSortKey]   = useState(null)
  const [sortDir, setSortDir]   = useState('asc')

  const handleSort = (key) => {
    if (!sortable) return
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [rows, sortKey, sortDir])

  const alignClass = (a) => {
    if (a === 'right')  return 'text-right'
    if (a === 'center') return 'text-center'
    return 'text-left'
  }

  return (
    <div className="bg-surface rounded-2xl border border-surface-lighter/20 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-surface-lighter/20">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-text-secondary font-medium text-xs uppercase tracking-wider whitespace-nowrap
                  ${alignClass(col.align)}
                  ${sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''}
                `}
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortable && sortKey === col.key && (
                  <span className="ml-1 text-accent-400">
                    {sortDir === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr
              key={ri}
              className={`border-b border-surface-lighter/10 hover:bg-surface-light/30 transition-colors
                ${ri % 2 === 1 ? 'bg-surface-light/10' : ''}
              `}
            >
              {columns.map((col) => {
                const val = row[col.key]
                const colorCls = col.colorFn ? col.colorFn(val, row) : 'text-text-primary'
                const display  = col.format ? col.format(val, row) : val

                return (
                  <td
                    key={col.key}
                    className={`py-2.5 px-4 font-medium whitespace-nowrap ${alignClass(col.align)} ${colorCls}`}
                  >
                    {display ?? '—'}
                  </td>
                )
              })}
            </tr>
          ))}

          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-text-muted text-sm">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

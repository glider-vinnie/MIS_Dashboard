import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ZONES = [
  'All',
  'Delhi',
  'Gurgaon',
  'Pune',
  'Nagpur',
  'Mauda',
  'Gadarwara',
  'Bangalore',
  'Kolkata',
  'Garo',
  'UPAY',
]

export const MONTHS = [
  "Apr'25",
  "May'25",
  "Jun'25",
  "July'25",
  "Aug'25",
  "Sep'25",
  "Oct'25",
  "Nov'25",
  "Dec'25",
]

export const useFilterStore = create(
  persist(
    (set) => ({
      zone: 'All',
      month: "Apr'25",

      setZone: (zone) => set({ zone }),
      setMonth: (month) => set({ month }),
    }),
    {
      name: 'ngo-mis-filters',
      version: 1,
      migrate: (persisted, version) => {
        // v0 → v1: month format changed from "Apr 2025" to "Apr'25"
        if (version === 0 || !MONTHS.includes(persisted.month)) {
          persisted.month = MONTHS[0]
        }
        return persisted
      },
      partialize: (state) => ({
        zone: state.zone,
        month: state.month,
      }),
    }
  )
)

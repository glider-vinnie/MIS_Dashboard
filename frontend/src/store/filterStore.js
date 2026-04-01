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
  'Apr 2025',
  'May 2025',
  'Jun 2025',
  'Jul 2025',
  'Aug 2025',
  'Sep 2025',
  'Oct 2025',
  'Nov 2025',
  'Dec 2025',
]

export const useFilterStore = create(
  persist(
    (set) => ({
      zone: 'All',
      month: 'Apr 2025',

      setZone: (zone) => set({ zone }),
      setMonth: (month) => set({ month }),
    }),
    {
      name: 'ngo-mis-filters',
      partialize: (state) => ({
        zone: state.zone,
        month: state.month,
      }),
    }
  )
)

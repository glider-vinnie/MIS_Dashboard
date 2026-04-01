import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,    // { name, role, zones[] }
      isAuthenticated: false,

      /**
       * Store auth payload after successful login.
       * @param {{ token: string, user: { name: string, role: string, zones: string[] } }} payload
       */
      login: ({ token, user }) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      /** Clear all auth state (logout). */
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      /** Convenience getters */
      getRole: () => get().user?.role ?? null,
      getZones: () => get().user?.zones ?? [],
      isAdmin: () => get().user?.role === 'admin',
      isZoneManager: () => get().user?.role === 'zone_manager',
      isViewer: () => get().user?.role === 'viewer',
    }),
    {
      name: 'ngo-mis-auth',          // localStorage key
      partialize: (state) => ({      // only persist these fields
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

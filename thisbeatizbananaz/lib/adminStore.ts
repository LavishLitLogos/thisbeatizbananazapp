import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminState {
  isAdmin: boolean
  login: (code: string) => boolean
  logout: () => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      login: (code: string) => {
        if (code === '88064') {
          set({ isAdmin: true })
          return true
        }
        return false
      },
      logout: () => set({ isAdmin: false }),
    }),
    { name: 'tbib-admin' }
  )
)

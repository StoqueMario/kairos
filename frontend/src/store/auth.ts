import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (token) => {
        localStorage.setItem('kairos_token', token)
        set({ token })
      },
      logout: () => {
        localStorage.removeItem('kairos_token')
        set({ token: null })
      },
      isAuthenticated: () => {
        const token = get().token
        if (!token) return false
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.exp * 1000 > Date.now()
        } catch {
          return false
        }
      },
    }),
    { name: 'kairos-auth', partialize: (s) => ({ token: s.token }) },
  ),
)

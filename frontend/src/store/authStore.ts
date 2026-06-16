/**
 * AURA — Store de autenticación con Zustand
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../types'

interface AuthState {
  token: string | null
  user: Usuario | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  setUser: (user: Usuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) => {
        localStorage.setItem('aura_token', token)
        set({ token, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('aura_token')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'aura-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

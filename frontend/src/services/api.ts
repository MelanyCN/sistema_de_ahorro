/**
 * AURA — Cliente HTTP Axios con interceptores JWT
 */
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ─── Request: adjuntar JWT ────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response: manejar 401 ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aura_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

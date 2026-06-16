/**
 * AURA — Funciones de servicio para todos los endpoints
 */
import { api } from './api'
import type {
  Token, Usuario, UsuarioCreate, UsuarioUpdate,
  Ingreso, IngresoCreate, IngresoUpdate,
  Gasto, GastoCreate, GastoUpdate,
  Meta, MetaCreate, MetaUpdate,
  Analisis, Recomendacion, PerfilFinanciero,
  Notificacion,
} from '../types'

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string): Promise<Token> => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const res = await api.post<Token>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data
  },

  register: async (data: UsuarioCreate): Promise<Usuario> => {
    const res = await api.post<Usuario>('/auth/register', data)
    return res.data
  },

  getMe: async (): Promise<Usuario> => {
    const res = await api.get<Usuario>('/auth/me')
    return res.data
  },

  updateMe: async (data: UsuarioUpdate): Promise<Usuario> => {
    const res = await api.put<Usuario>('/auth/me', data)
    return res.data
  },

  changePassword: async (data: {
    password_actual: string
    password_nuevo: string
    password_confirm: string
  }): Promise<void> => {
    await api.post('/auth/change-password', data)
  },
}

// ─── Ingresos ──────────────────────────────────────────────────────────────
export const ingresosService = {
  list: async (params?: { fecha_desde?: string; fecha_hasta?: string; tipo?: string }): Promise<Ingreso[]> => {
    const res = await api.get<Ingreso[]>('/ingresos/', { params })
    return res.data
  },
  create: async (data: IngresoCreate): Promise<Ingreso> => {
    const res = await api.post<Ingreso>('/ingresos/', data)
    return res.data
  },
  update: async (id: number, data: IngresoUpdate): Promise<Ingreso> => {
    const res = await api.put<Ingreso>(`/ingresos/${id}`, data)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ingresos/${id}`)
  },
}

// ─── Gastos ────────────────────────────────────────────────────────────────
export const gastosService = {
  list: async (params?: { fecha_desde?: string; fecha_hasta?: string; categoria?: string }): Promise<Gasto[]> => {
    const res = await api.get<Gasto[]>('/gastos/', { params })
    return res.data
  },
  create: async (data: GastoCreate): Promise<Gasto> => {
    const res = await api.post<Gasto>('/gastos/', data)
    return res.data
  },
  update: async (id: number, data: GastoUpdate): Promise<Gasto> => {
    const res = await api.put<Gasto>(`/gastos/${id}`, data)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/gastos/${id}`)
  },
}

// ─── Metas ─────────────────────────────────────────────────────────────────
export const metasService = {
  list: async (): Promise<Meta[]> => {
    const res = await api.get<Meta[]>('/metas/')
    return res.data
  },
  create: async (data: MetaCreate): Promise<Meta> => {
    const res = await api.post<Meta>('/metas/', data)
    return res.data
  },
  update: async (id: number, data: MetaUpdate): Promise<Meta> => {
    const res = await api.put<Meta>(`/metas/${id}`, data)
    return res.data
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/metas/${id}`)
  },
}

// ─── Análisis ──────────────────────────────────────────────────────────────
export const analisisService = {
  getAnalisis: async (params?: { mes?: number; anio?: number }): Promise<Analisis> => {
    const res = await api.get<Analisis>('/analisis/', { params })
    return res.data
  },
  getRecomendaciones: async (params?: { mes?: number; anio?: number }): Promise<Recomendacion[]> => {
    const res = await api.get<Recomendacion[]>('/analisis/recomendaciones', { params })
    return res.data
  },
  getPerfilFinanciero: async (): Promise<PerfilFinanciero> => {
    const res = await api.get<PerfilFinanciero>('/analisis/perfil-financiero')
    return res.data
  },
}

// ─── Notificaciones ────────────────────────────────────────────────────────
export const notificacionesService = {
  list: async (soloNoLeidas = false): Promise<Notificacion[]> => {
    const res = await api.get<Notificacion[]>('/notificaciones/', {
      params: { solo_no_leidas: soloNoLeidas },
    })
    return res.data
  },
  marcarLeida: async (id: number): Promise<void> => {
    await api.put(`/notificaciones/${id}/leer`)
  },
  marcarTodasLeidas: async (): Promise<void> => {
    await api.put('/notificaciones/leer-todas')
  },
}

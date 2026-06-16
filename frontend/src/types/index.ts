// ─── Auth ──────────────────────────────────────────────────────────────────
export interface Token {
  access_token: string
  token_type: string
}

// ─── Usuario ───────────────────────────────────────────────────────────────
export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  edad?: number
  ingreso_mensual: number
  is_active: boolean
  created_at: string
}

export interface UsuarioCreate {
  nombre: string
  apellido: string
  email: string
  edad?: number
  ingreso_mensual?: number
  password: string
  password_confirm: string
}

export interface UsuarioUpdate {
  nombre?: string
  apellido?: string
  edad?: number
  ingreso_mensual?: number
}

// ─── Ingreso ───────────────────────────────────────────────────────────────
export type TipoIngreso = 'Sueldo' | 'Freelance' | 'Propina' | 'Negocio' | 'Otros'

export interface Ingreso {
  id: number
  usuario_id: number
  monto: number
  fecha: string
  tipo: TipoIngreso
  descripcion?: string
  created_at: string
}

export interface IngresoCreate {
  monto: number
  fecha: string
  tipo: TipoIngreso
  descripcion?: string
}

export interface IngresoUpdate extends Partial<IngresoCreate> {}

// ─── Gasto ─────────────────────────────────────────────────────────────────
export type CategoriaGasto =
  | 'Alimentación' | 'Transporte' | 'Entretenimiento'
  | 'Educación' | 'Salud' | 'Servicios' | 'Compras' | 'Otros'

export interface Gasto {
  id: number
  usuario_id: number
  monto: number
  fecha: string
  categoria: CategoriaGasto
  descripcion?: string
  created_at: string
}

export interface GastoCreate {
  monto: number
  fecha: string
  categoria: CategoriaGasto
  descripcion?: string
}

export interface GastoUpdate extends Partial<GastoCreate> {}

// ─── Meta ──────────────────────────────────────────────────────────────────
export type EstadoMeta = 'activa' | 'completada' | 'cancelada'

export interface Meta {
  id: number
  usuario_id: number
  nombre: string
  monto_objetivo: number
  monto_actual: number
  fecha_objetivo?: string
  estado: EstadoMeta
  progreso_porcentaje: number
  monto_restante: number
  dias_restantes: number
  created_at: string
}

export interface MetaCreate {
  nombre: string
  monto_objetivo: number
  monto_actual?: number
  fecha_objetivo?: string
}

export interface MetaUpdate extends Partial<MetaCreate> {
  estado?: EstadoMeta
}

// ─── Análisis ──────────────────────────────────────────────────────────────
export interface GastoHormiga {
  descripcion: string
  categoria: string
  cantidad_veces: number
  total_acumulado: number
  promedio_por_vez: number
  impacto_mensual_estimado: number
  impacto_anual_estimado: number
}

export interface Analisis {
  ingreso_total: number
  gasto_total: number
  balance: number
  promedio_diario: number
  promedio_semanal: number
  promedio_mensual: number
  categoria_mas_costosa?: string
  porcentaje_ahorro: number
  gastos_por_categoria: Record<string, number>
  gastos_hormiga: GastoHormiga[]
}

export interface Recomendacion {
  tipo: 'warn' | 'info' | 'success'
  icono: string
  titulo: string
  mensaje: string
}

export interface PerfilFinanciero {
  tipo: 'AHORRADOR' | 'MODERADO' | 'EN_RIESGO' | 'GASTADOR'
  descripcion: string
  color: string
  porcentaje_ahorro: number
  ingreso_total: number
  gasto_total: number
  balance: number
}

// ─── Notificacion ──────────────────────────────────────────────────────────
export interface Notificacion {
  id: number
  mensaje: string
  leida: boolean
  fecha: string
}

"""
Schemas Pydantic: Ingreso, Gasto, Meta, Analisis, Notificacion
"""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ─── Ingreso ──────────────────────────────────────────────────────────────────
class IngresoBase(BaseModel):
    monto: float = Field(..., gt=0)
    fecha: date
    tipo: str = Field(..., pattern="^(Sueldo|Freelance|Propina|Negocio|Otros)$")
    descripcion: Optional[str] = Field(None, max_length=255)


class IngresoCreate(IngresoBase):
    pass


class IngresoUpdate(BaseModel):
    monto: Optional[float] = Field(None, gt=0)
    fecha: Optional[date] = None
    tipo: Optional[str] = Field(None, pattern="^(Sueldo|Freelance|Propina|Negocio|Otros)$")
    descripcion: Optional[str] = Field(None, max_length=255)


class IngresoResponse(IngresoBase):
    id: int
    usuario_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Gasto ────────────────────────────────────────────────────────────────────
CATEGORIAS = "^(Alimentación|Transporte|Entretenimiento|Educación|Salud|Servicios|Compras|Otros)$"


class GastoBase(BaseModel):
    monto: float = Field(..., gt=0)
    fecha: date
    categoria: str = Field(..., pattern=CATEGORIAS)
    descripcion: Optional[str] = Field(None, max_length=255)


class GastoCreate(GastoBase):
    pass


class GastoUpdate(BaseModel):
    monto: Optional[float] = Field(None, gt=0)
    fecha: Optional[date] = None
    categoria: Optional[str] = Field(None, pattern=CATEGORIAS)
    descripcion: Optional[str] = Field(None, max_length=255)


class GastoResponse(GastoBase):
    id: int
    usuario_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Meta ─────────────────────────────────────────────────────────────────────
class MetaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=200)
    monto_objetivo: float = Field(..., gt=0)
    monto_actual: Optional[float] = Field(0.0, ge=0)
    fecha_objetivo: Optional[date] = None


class MetaCreate(MetaBase):
    pass


class MetaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=200)
    monto_objetivo: Optional[float] = Field(None, gt=0)
    monto_actual: Optional[float] = Field(None, ge=0)
    fecha_objetivo: Optional[date] = None
    estado: Optional[str] = Field(None, pattern="^(activa|completada|cancelada)$")


class MetaResponse(MetaBase):
    id: int
    usuario_id: int
    estado: str
    progreso_porcentaje: float
    monto_restante: float
    dias_restantes: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Análisis ─────────────────────────────────────────────────────────────────
class GastoHormiga(BaseModel):
    descripcion: str
    categoria: str
    cantidad_veces: int
    total_acumulado: float
    promedio_por_vez: float
    impacto_mensual_estimado: float
    impacto_anual_estimado: float


class AnalisisResponse(BaseModel):
    ingreso_total: float
    gasto_total: float
    balance: float
    promedio_diario: float
    promedio_semanal: float
    promedio_mensual: float
    categoria_mas_costosa: Optional[str]
    porcentaje_ahorro: float
    gastos_por_categoria: dict
    gastos_hormiga: List[GastoHormiga]


# ─── Presupuesto ─────────────────────────────────────────────────────────────
class PresupuestoCreate(BaseModel):
    categoria: str = Field(..., pattern=CATEGORIAS)
    monto_limite: float = Field(..., gt=0)
    mes: int = Field(..., ge=1, le=12)
    anio: int = Field(..., ge=2020)


class PresupuestoUpdate(BaseModel):
    monto_limite: float = Field(..., gt=0)


class PresupuestoResponse(BaseModel):
    id: int
    categoria: str
    monto_limite: float
    mes: int
    anio: int
    gasto_actual: float
    porcentaje_usado: float
    disponible: float
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Aporte Meta ──────────────────────────────────────────────────────────────
class AporteMetaCreate(BaseModel):
    monto: float = Field(..., gt=0)
    fecha: date
    descripcion: Optional[str] = Field(None, max_length=255)


class AporteMetaResponse(BaseModel):
    id: int
    meta_id: int
    monto: float
    fecha: date
    descripcion: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Comparativa mensual ──────────────────────────────────────────────────────
class ComparativaMes(BaseModel):
    mes: int
    anio: int
    label: str
    ingreso_total: float
    gasto_total: float
    balance: float
    porcentaje_ahorro: float
    gastos_por_categoria: dict


# ─── Recomendacion ────────────────────────────────────────────────────────────
class RecomendacionResponse(BaseModel):
    id: int
    mensaje: str
    tipo: str
    fecha: datetime

    class Config:
        from_attributes = True


# ─── Notificacion ─────────────────────────────────────────────────────────────
class NotificacionResponse(BaseModel):
    id: int
    mensaje: str
    leida: bool
    fecha: datetime

    class Config:
        from_attributes = True

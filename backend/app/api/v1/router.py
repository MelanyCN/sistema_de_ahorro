"""
Router principal API v1 — registra todos los endpoints
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    ingresos,
    gastos,
    metas,
    analisis,
    notificaciones,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(ingresos.router, prefix="/ingresos", tags=["Ingresos"])
api_router.include_router(gastos.router, prefix="/gastos", tags=["Gastos"])
api_router.include_router(metas.router, prefix="/metas", tags=["Metas de Ahorro"])
api_router.include_router(analisis.router, prefix="/analisis", tags=["Análisis Financiero"])
api_router.include_router(notificaciones.router, prefix="/notificaciones", tags=["Notificaciones"])

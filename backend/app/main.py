"""
AURA - Asistente Útil para el Rendimiento y Ahorro
Backend principal FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.db.session import engine
from app.db import base  # noqa: F401 – importa todos los modelos para Alembic
from app.api.v1.router import api_router

# ─── Crear tablas (desarrollo) ────────────────────────────────────────────────
from app.db.base import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AURA API",
    description="API para la aplicación financiera personal AURA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rutas ────────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "AURA API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}


# ─── OpenAPI personalizado ────────────────────────────────────────────────────
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title="AURA API",
        version="1.0.0",
        description="API REST para gestión financiera personal. JWT Authentication requerido en la mayoría de endpoints.",
        routes=app.routes,
    )
    schema["info"]["x-logo"] = {"url": "https://aura.pe/logo.png"}
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi

"""
Modelo SQLAlchemy: Usuario
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    edad = Column(Integer, nullable=True)
    ingreso_mensual = Column(Float, default=0.0)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    ingresos = relationship("Ingreso", back_populates="usuario", cascade="all, delete-orphan")
    gastos = relationship("Gasto", back_populates="usuario", cascade="all, delete-orphan")
    metas = relationship("Meta", back_populates="usuario", cascade="all, delete-orphan")
    recomendaciones = relationship("Recomendacion", back_populates="usuario", cascade="all, delete-orphan")
    notificaciones = relationship("Notificacion", back_populates="usuario", cascade="all, delete-orphan")

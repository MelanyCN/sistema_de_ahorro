"""
Modelo SQLAlchemy: Gasto
"""
from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class CategoriaGasto(str, enum.Enum):
    alimentacion = "Alimentación"
    transporte = "Transporte"
    entretenimiento = "Entretenimiento"
    educacion = "Educación"
    salud = "Salud"
    servicios = "Servicios"
    compras = "Compras"
    otros = "Otros"


class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(Date, nullable=False, default=date.today)
    categoria = Column(Enum(CategoriaGasto), nullable=False, default=CategoriaGasto.otros)
    descripcion = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="gastos")

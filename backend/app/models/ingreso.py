"""
Modelo SQLAlchemy: Ingreso
"""
from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class TipoIngreso(str, enum.Enum):
    sueldo = "Sueldo"
    freelance = "Freelance"
    propina = "Propina"
    negocio = "Negocio"
    otros = "Otros"


class Ingreso(Base):
    __tablename__ = "ingresos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(Date, nullable=False, default=date.today)
    tipo = Column(Enum(TipoIngreso, values_callable=lambda x: [e.value for e in x]), nullable=False, default=TipoIngreso.sueldo)
    descripcion = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="ingresos")

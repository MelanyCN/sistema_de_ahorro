"""
Modelo SQLAlchemy: Presupuesto mensual por categoría
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Presupuesto(Base):
    __tablename__ = "presupuestos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    categoria = Column(String(50), nullable=False)
    monto_limite = Column(Float, nullable=False)
    mes = Column(Integer, nullable=False)
    anio = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="presupuestos")

    __table_args__ = (
        UniqueConstraint("usuario_id", "categoria", "mes", "anio", name="uq_presupuesto"),
    )

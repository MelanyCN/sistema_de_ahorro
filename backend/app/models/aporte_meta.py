"""
Modelo SQLAlchemy: Aporte a Meta de Ahorro
"""
from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AporteMeta(Base):
    __tablename__ = "aportes_meta"

    id = Column(Integer, primary_key=True, index=True)
    meta_id = Column(Integer, ForeignKey("metas.id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(Date, nullable=False, default=date.today)
    descripcion = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meta = relationship("Meta", back_populates="aportes")
    usuario = relationship("Usuario", back_populates="aportes_meta")

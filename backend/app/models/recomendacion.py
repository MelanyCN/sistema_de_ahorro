"""
Modelo SQLAlchemy: Recomendacion
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class TipoRecomendacion(str, enum.Enum):
    warn = "warn"
    info = "info"
    success = "success"


class Recomendacion(Base):
    __tablename__ = "recomendaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    mensaje = Column(String(500), nullable=False)
    tipo = Column(Enum(TipoRecomendacion), default=TipoRecomendacion.info)
    fecha = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="recomendaciones")

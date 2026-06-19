"""
Modelo SQLAlchemy: Meta de Ahorro
"""
from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class EstadoMeta(str, enum.Enum):
    activa = "activa"
    completada = "completada"
    cancelada = "cancelada"


class Meta(Base):
    __tablename__ = "metas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(200), nullable=False)
    monto_objetivo = Column(Float, nullable=False)
    monto_actual = Column(Float, default=0.0)
    fecha_objetivo = Column(Date, nullable=True)
    estado = Column(Enum(EstadoMeta), default=EstadoMeta.activa)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="metas")
    aportes = relationship("AporteMeta", back_populates="meta", cascade="all, delete-orphan")

    @property
    def progreso_porcentaje(self) -> float:
        if self.monto_objetivo <= 0:
            return 0.0
        return min(100.0, (self.monto_actual / self.monto_objetivo) * 100)

    @property
    def monto_restante(self) -> float:
        return max(0.0, self.monto_objetivo - self.monto_actual)

    @property
    def dias_restantes(self) -> int:
        if not self.fecha_objetivo:
            return -1
        delta = self.fecha_objetivo - date.today()
        return max(0, delta.days)

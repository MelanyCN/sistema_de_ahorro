"""
Importa todos los modelos para que Alembic los detecte en las migraciones.
"""
from app.db.base_class import Base  # noqa: F401
from app.models.usuario import Usuario  # noqa: F401
from app.models.ingreso import Ingreso  # noqa: F401
from app.models.gasto import Gasto  # noqa: F401
from app.models.meta import Meta  # noqa: F401
from app.models.recomendacion import Recomendacion  # noqa: F401
from app.models.notificacion import Notificacion  # noqa: F401
from app.models.presupuesto import Presupuesto  # noqa: F401
from app.models.aporte_meta import AporteMeta  # noqa: F401

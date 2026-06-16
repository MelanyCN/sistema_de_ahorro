"""
Sesión SQLAlchemy y engine de base de datos
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # reconecta si la conexión murió
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependencia FastAPI: provee sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

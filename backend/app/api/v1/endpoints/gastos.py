"""
Endpoints CRUD: Gastos
"""
from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.gasto import Gasto
from app.schemas.schemas import GastoCreate, GastoUpdate, GastoResponse

router = APIRouter()


@router.get("/", response_model=List[GastoResponse])
def list_gastos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    categoria: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista gastos del usuario con filtros opcionales."""
    query = db.query(Gasto).filter(Gasto.usuario_id == current_user.id)

    if fecha_desde:
        query = query.filter(Gasto.fecha >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Gasto.fecha <= fecha_hasta)
    if categoria:
        query = query.filter(Gasto.categoria == categoria)

    return query.order_by(Gasto.fecha.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=GastoResponse, status_code=status.HTTP_201_CREATED)
def create_gasto(
    gasto_in: GastoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Registra un nuevo gasto."""
    gasto = Gasto(**gasto_in.model_dump(), usuario_id=current_user.id)
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.get("/{gasto_id}", response_model=GastoResponse)
def get_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.usuario_id == current_user.id,
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return gasto


@router.put("/{gasto_id}", response_model=GastoResponse)
def update_gasto(
    gasto_id: int,
    gasto_in: GastoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.usuario_id == current_user.id,
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    for field, value in gasto_in.model_dump(exclude_unset=True).items():
        setattr(gasto, field, value)
    db.commit()
    db.refresh(gasto)
    return gasto


@router.delete("/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.usuario_id == current_user.id,
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    db.delete(gasto)
    db.commit()

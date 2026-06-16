"""
Endpoints CRUD: Ingresos
"""
from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.ingreso import Ingreso
from app.schemas.schemas import IngresoCreate, IngresoUpdate, IngresoResponse

router = APIRouter()


@router.get("/", response_model=List[IngresoResponse])
def list_ingresos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista ingresos del usuario con filtros opcionales."""
    query = db.query(Ingreso).filter(Ingreso.usuario_id == current_user.id)

    if fecha_desde:
        query = query.filter(Ingreso.fecha >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Ingreso.fecha <= fecha_hasta)
    if tipo:
        query = query.filter(Ingreso.tipo == tipo)

    return query.order_by(Ingreso.fecha.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=IngresoResponse, status_code=status.HTTP_201_CREATED)
def create_ingreso(
    ingreso_in: IngresoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea un nuevo ingreso."""
    ingreso = Ingreso(**ingreso_in.model_dump(), usuario_id=current_user.id)
    db.add(ingreso)
    db.commit()
    db.refresh(ingreso)
    return ingreso


@router.get("/{ingreso_id}", response_model=IngresoResponse)
def get_ingreso(
    ingreso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Obtiene un ingreso por ID."""
    ingreso = db.query(Ingreso).filter(
        Ingreso.id == ingreso_id,
        Ingreso.usuario_id == current_user.id,
    ).first()
    if not ingreso:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    return ingreso


@router.put("/{ingreso_id}", response_model=IngresoResponse)
def update_ingreso(
    ingreso_id: int,
    ingreso_in: IngresoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza un ingreso existente."""
    ingreso = db.query(Ingreso).filter(
        Ingreso.id == ingreso_id,
        Ingreso.usuario_id == current_user.id,
    ).first()
    if not ingreso:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")

    for field, value in ingreso_in.model_dump(exclude_unset=True).items():
        setattr(ingreso, field, value)
    db.commit()
    db.refresh(ingreso)
    return ingreso


@router.delete("/{ingreso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingreso(
    ingreso_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Elimina un ingreso."""
    ingreso = db.query(Ingreso).filter(
        Ingreso.id == ingreso_id,
        Ingreso.usuario_id == current_user.id,
    ).first()
    if not ingreso:
        raise HTTPException(status_code=404, detail="Ingreso no encontrado")
    db.delete(ingreso)
    db.commit()

"""
Endpoints CRUD: Metas de Ahorro
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.meta import Meta
from app.schemas.schemas import MetaCreate, MetaUpdate, MetaResponse

router = APIRouter()


@router.get("/", response_model=List[MetaResponse])
def list_metas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todas las metas del usuario."""
    return (
        db.query(Meta)
        .filter(Meta.usuario_id == current_user.id)
        .order_by(Meta.created_at.desc())
        .all()
    )


@router.post("/", response_model=MetaResponse, status_code=status.HTTP_201_CREATED)
def create_meta(
    meta_in: MetaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Crea una nueva meta de ahorro."""
    meta = Meta(**meta_in.model_dump(), usuario_id=current_user.id)
    db.add(meta)
    db.commit()
    db.refresh(meta)
    return meta


@router.get("/{meta_id}", response_model=MetaResponse)
def get_meta(
    meta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    meta = db.query(Meta).filter(
        Meta.id == meta_id, Meta.usuario_id == current_user.id
    ).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    return meta


@router.put("/{meta_id}", response_model=MetaResponse)
def update_meta(
    meta_id: int,
    meta_in: MetaUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Actualiza una meta. Si monto_actual >= monto_objetivo, marca como completada."""
    meta = db.query(Meta).filter(
        Meta.id == meta_id, Meta.usuario_id == current_user.id
    ).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Meta no encontrada")

    for field, value in meta_in.model_dump(exclude_unset=True).items():
        setattr(meta, field, value)

    # Auto-completar si se alcanzó el objetivo
    if meta.monto_actual >= meta.monto_objetivo:
        meta.estado = "completada"

    db.commit()
    db.refresh(meta)
    return meta


@router.delete("/{meta_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meta(
    meta_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    meta = db.query(Meta).filter(
        Meta.id == meta_id, Meta.usuario_id == current_user.id
    ).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    db.delete(meta)
    db.commit()

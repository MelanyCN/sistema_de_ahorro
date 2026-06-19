"""
Endpoints CRUD: Presupuestos mensuales por categoría
"""
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.gasto import Gasto
from app.models.presupuesto import Presupuesto
from app.models.usuario import Usuario
from app.schemas.schemas import PresupuestoCreate, PresupuestoUpdate, PresupuestoResponse

router = APIRouter()


def _enriquecer(p: Presupuesto, db: Session, usuario_id: int) -> PresupuestoResponse:
    """Agrega gasto_actual, porcentaje_usado y disponible al presupuesto."""
    gasto_actual = db.query(func.sum(Gasto.monto)).filter(
        Gasto.usuario_id == usuario_id,
        extract("month", Gasto.fecha) == p.mes,
        extract("year", Gasto.fecha) == p.anio,
        Gasto.categoria == p.categoria,
    ).scalar() or 0.0

    porcentaje_usado = min(100.0, gasto_actual / p.monto_limite * 100) if p.monto_limite > 0 else 0.0
    disponible = max(0.0, p.monto_limite - gasto_actual)

    return PresupuestoResponse(
        id=p.id,
        categoria=p.categoria,
        monto_limite=round(p.monto_limite, 2),
        mes=p.mes,
        anio=p.anio,
        gasto_actual=round(gasto_actual, 2),
        porcentaje_usado=round(porcentaje_usado, 2),
        disponible=round(disponible, 2),
        created_at=p.created_at,
    )


@router.get("/", response_model=List[PresupuestoResponse])
def list_presupuestos(
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = Query(None, ge=2020),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    today = date.today()
    mes = mes or today.month
    anio = anio or today.year

    presupuestos = db.query(Presupuesto).filter(
        Presupuesto.usuario_id == current_user.id,
        Presupuesto.mes == mes,
        Presupuesto.anio == anio,
    ).order_by(Presupuesto.categoria).all()

    return [_enriquecer(p, db, current_user.id) for p in presupuestos]


@router.post("/", response_model=PresupuestoResponse, status_code=status.HTTP_201_CREATED)
def create_presupuesto(
    data: PresupuestoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    existe = db.query(Presupuesto).filter(
        Presupuesto.usuario_id == current_user.id,
        Presupuesto.categoria == data.categoria,
        Presupuesto.mes == data.mes,
        Presupuesto.anio == data.anio,
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un presupuesto para {data.categoria} en {data.mes}/{data.anio}",
        )

    p = Presupuesto(**data.model_dump(), usuario_id=current_user.id)
    db.add(p)
    db.commit()
    db.refresh(p)
    return _enriquecer(p, db, current_user.id)


@router.put("/{presupuesto_id}", response_model=PresupuestoResponse)
def update_presupuesto(
    presupuesto_id: int,
    data: PresupuestoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    p = db.query(Presupuesto).filter(
        Presupuesto.id == presupuesto_id,
        Presupuesto.usuario_id == current_user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")

    p.monto_limite = data.monto_limite
    db.commit()
    db.refresh(p)
    return _enriquecer(p, db, current_user.id)


@router.delete("/{presupuesto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_presupuesto(
    presupuesto_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    p = db.query(Presupuesto).filter(
        Presupuesto.id == presupuesto_id,
        Presupuesto.usuario_id == current_user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    db.delete(p)
    db.commit()

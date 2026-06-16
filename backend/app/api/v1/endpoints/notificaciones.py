"""
Endpoints: Notificaciones
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.notificacion import Notificacion
from app.schemas.schemas import NotificacionResponse

router = APIRouter()


@router.get("/", response_model=List[NotificacionResponse])
def list_notificaciones(
    solo_no_leidas: bool = False,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista notificaciones del usuario."""
    query = db.query(Notificacion).filter(Notificacion.usuario_id == current_user.id)
    if solo_no_leidas:
        query = query.filter(Notificacion.leida == False)  # noqa: E712
    return query.order_by(Notificacion.fecha.desc()).limit(50).all()


@router.put("/{notif_id}/leer")
def marcar_leida(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Marca una notificación como leída."""
    notif = db.query(Notificacion).filter(
        Notificacion.id == notif_id,
        Notificacion.usuario_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    notif.leida = True
    db.commit()
    return {"message": "Notificación marcada como leída"}


@router.put("/leer-todas")
def marcar_todas_leidas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Marca todas las notificaciones como leídas."""
    db.query(Notificacion).filter(
        Notificacion.usuario_id == current_user.id,
        Notificacion.leida == False,  # noqa: E712
    ).update({"leida": True})
    db.commit()
    return {"message": "Todas las notificaciones marcadas como leídas"}

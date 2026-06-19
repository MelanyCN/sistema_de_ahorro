"""
Endpoint de Análisis Financiero + motor de Recomendaciones + Gastos Hormiga
"""
from collections import defaultdict
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.usuario import Usuario
from app.models.ingreso import Ingreso
from app.models.gasto import Gasto
from app.schemas.schemas import AnalisisResponse, GastoHormiga, RecomendacionResponse, ComparativaMes

router = APIRouter()


def _calcular_analisis(
    gastos: List[Gasto],
    ingresos: List[Ingreso],
) -> dict:
    """Motor de análisis financiero."""
    total_ingresos = sum(i.monto for i in ingresos)
    total_gastos = sum(g.monto for g in gastos)
    balance = total_ingresos - total_gastos

    # Promedios
    fechas = [g.fecha for g in gastos]
    if fechas:
        dias = max(1, (max(fechas) - min(fechas)).days + 1)
        semanas = max(1, dias / 7)
    else:
        dias, semanas = 1, 1

    prom_diario = total_gastos / dias
    prom_semanal = total_gastos / semanas
    porcentaje_ahorro = (balance / total_ingresos * 100) if total_ingresos > 0 else 0.0

    # Gastos por categoría
    gastos_por_cat: dict = defaultdict(float)
    for g in gastos:
        cat = g.categoria.value if hasattr(g.categoria, "value") else str(g.categoria)
        gastos_por_cat[cat] += g.monto

    categoria_mas_costosa = (
        max(gastos_por_cat, key=gastos_por_cat.get) if gastos_por_cat else None
    )

    # Detección de gastos hormiga
    grupos: dict = defaultdict(lambda: {"count": 0, "total": 0.0, "categoria": ""})
    for g in gastos:
        key = (g.descripcion or "").strip().lower()
        if not key:
            continue
        cat = g.categoria.value if hasattr(g.categoria, "value") else str(g.categoria)
        grupos[key]["count"] += 1
        grupos[key]["total"] += g.monto
        grupos[key]["categoria"] = cat
        grupos[key]["descripcion"] = (g.descripcion or "").strip()

    hormiga_list = []
    for datos in grupos.values():
        if datos["count"] >= 2:
            hormiga_list.append(
                GastoHormiga(
                    descripcion=datos["descripcion"],
                    categoria=datos["categoria"],
                    cantidad_veces=datos["count"],
                    total_acumulado=round(datos["total"], 2),
                    promedio_por_vez=round(datos["total"] / datos["count"], 2),
                    impacto_mensual_estimado=round(datos["total"], 2),
                    impacto_anual_estimado=round(datos["total"] * 12, 2),
                )
            )
    hormiga_list.sort(key=lambda h: h.total_acumulado, reverse=True)

    return {
        "ingreso_total": round(total_ingresos, 2),
        "gasto_total": round(total_gastos, 2),
        "balance": round(balance, 2),
        "promedio_diario": round(prom_diario, 2),
        "promedio_semanal": round(prom_semanal, 2),
        "promedio_mensual": round(total_gastos, 2),
        "categoria_mas_costosa": categoria_mas_costosa,
        "porcentaje_ahorro": round(porcentaje_ahorro, 2),
        "gastos_por_categoria": {k: round(v, 2) for k, v in gastos_por_cat.items()},
        "gastos_hormiga": hormiga_list,
    }


@router.get("/", response_model=AnalisisResponse)
def get_analisis(
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = Query(None, ge=2020),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Análisis financiero completo del usuario.
    Filtra por mes/año si se proveen, si no usa todos los registros.
    """
    g_query = db.query(Gasto).filter(Gasto.usuario_id == current_user.id)
    i_query = db.query(Ingreso).filter(Ingreso.usuario_id == current_user.id)

    if mes and anio:
        from sqlalchemy import extract
        g_query = g_query.filter(
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio,
        )
        i_query = i_query.filter(
            extract("month", Ingreso.fecha) == mes,
            extract("year", Ingreso.fecha) == anio,
        )

    gastos = g_query.all()
    ingresos = i_query.all()

    return _calcular_analisis(gastos, ingresos)


@router.get("/recomendaciones", response_model=List[dict])
def get_recomendaciones(
    mes: Optional[int] = Query(None, ge=1, le=12),
    anio: Optional[int] = Query(None, ge=2020),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Motor de recomendaciones basado en reglas.
    No usa IA generativa — aplica reglas fijas sobre los datos del usuario.
    """
    g_query = db.query(Gasto).filter(Gasto.usuario_id == current_user.id)
    i_query = db.query(Ingreso).filter(Ingreso.usuario_id == current_user.id)

    if mes and anio:
        from sqlalchemy import extract
        g_query = g_query.filter(
            extract("month", Gasto.fecha) == mes,
            extract("year", Gasto.fecha) == anio,
        )
        i_query = i_query.filter(
            extract("month", Ingreso.fecha) == mes,
            extract("year", Ingreso.fecha) == anio,
        )

    gastos = g_query.all()
    ingresos = i_query.all()
    data = _calcular_analisis(gastos, ingresos)

    total_i = data["ingreso_total"]
    total_g = data["gasto_total"]
    ahorro_pct = data["porcentaje_ahorro"]
    por_cat = data["gastos_por_categoria"]
    hormiga_total = sum(h.total_acumulado for h in data["gastos_hormiga"])

    def pct_cat(cat: str) -> float:
        return (por_cat.get(cat, 0) / total_i * 100) if total_i > 0 else 0

    rules = []

    # Regla 1: Entretenimiento > 25%
    if pct_cat("Entretenimiento") > 25:
        rules.append({
            "tipo": "warn",
            "icono": "🎬",
            "titulo": "Entretenimiento elevado",
            "mensaje": f"Tu gasto en entretenimiento es {pct_cat('Entretenimiento'):.1f}% de tus ingresos. Considera reducirlo un 10%.",
        })

    # Regla 2: Ahorro < 10%
    if ahorro_pct < 10:
        rules.append({
            "tipo": "warn",
            "icono": "💰",
            "titulo": "Ahorro bajo",
            "mensaje": f"Tu porcentaje de ahorro es {ahorro_pct:.1f}%. Intenta reservar al menos el 10% de tus ingresos.",
        })

    # Regla 3: Alimentación > 40%
    if pct_cat("Alimentación") > 40:
        rules.append({
            "tipo": "warn",
            "icono": "🍔",
            "titulo": "Alto gasto en alimentación",
            "mensaje": f"El {pct_cat('Alimentación'):.1f}% de tus ingresos se destina a alimentación. Cocinar en casa puede reducirlo significativamente.",
        })

    # Regla 4: Gastos hormiga detectados
    if hormiga_total > 0:
        ahorro_posible = round(hormiga_total * 0.5, 2)
        rules.append({
            "tipo": "info",
            "icono": "🐜",
            "titulo": "Gastos hormiga detectados",
            "mensaje": f"Reduciendo tus gastos hormiga podrías ahorrar aproximadamente S/{ahorro_posible:.2f} mensuales (S/{ahorro_posible * 12:.2f} al año).",
        })

    # Regla 5: Excelente ahorro
    if ahorro_pct >= 20:
        rules.append({
            "tipo": "success",
            "icono": "🏆",
            "titulo": "¡Excelente ahorro!",
            "mensaje": f"Estás ahorrando el {ahorro_pct:.1f}% de tus ingresos. Considera invertir el excedente.",
        })
    elif 10 <= ahorro_pct < 20:
        rules.append({
            "tipo": "success",
            "icono": "📈",
            "titulo": "Buen progreso",
            "mensaje": f"Ahorras el {ahorro_pct:.1f}%. Vas bien, intenta llegar al 20%.",
        })

    # Regla 6: Gastos > ingresos
    if total_g > total_i:
        rules.append({
            "tipo": "warn",
            "icono": "⚠️",
            "titulo": "Gastos superan ingresos",
            "mensaje": f"Tus gastos (S/{total_g:.2f}) superan tus ingresos (S/{total_i:.2f}). Revisa urgentemente tu presupuesto.",
        })

    return rules


_MESES_ES = {
    1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr",
    5: "May", 6: "Jun", 7: "Jul", 8: "Ago",
    9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
}


@router.get("/comparativa", response_model=List[ComparativaMes])
def get_comparativa(
    meses: int = Query(3, ge=2, le=12),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Devuelve el resumen financiero de los últimos N meses (incluye el actual)."""
    today = date.today()
    resultado = []

    for i in range(meses - 1, -1, -1):
        mes = today.month - i
        anio = today.year
        while mes <= 0:
            mes += 12
            anio -= 1

        from sqlalchemy import extract as sa_extract
        gastos = db.query(Gasto).filter(
            Gasto.usuario_id == current_user.id,
            sa_extract("month", Gasto.fecha) == mes,
            sa_extract("year", Gasto.fecha) == anio,
        ).all()

        ingresos = db.query(Ingreso).filter(
            Ingreso.usuario_id == current_user.id,
            sa_extract("month", Ingreso.fecha) == mes,
            sa_extract("year", Ingreso.fecha) == anio,
        ).all()

        data = _calcular_analisis(gastos, ingresos)
        resultado.append(ComparativaMes(
            mes=mes,
            anio=anio,
            label=f"{_MESES_ES[mes]} {anio}",
            ingreso_total=data["ingreso_total"],
            gasto_total=data["gasto_total"],
            balance=data["balance"],
            porcentaje_ahorro=data["porcentaje_ahorro"],
            gastos_por_categoria=data["gastos_por_categoria"],
        ))

    return resultado


@router.get("/perfil-financiero")
def get_perfil_financiero(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Clasifica al usuario: AHORRADOR / MODERADO / EN_RIESGO / GASTADOR."""
    gastos = db.query(Gasto).filter(Gasto.usuario_id == current_user.id).all()
    ingresos = db.query(Ingreso).filter(Ingreso.usuario_id == current_user.id).all()
    data = _calcular_analisis(gastos, ingresos)

    total_i = data["ingreso_total"]
    total_g = data["gasto_total"]
    ahorro_pct = data["porcentaje_ahorro"]

    if total_g > total_i:
        tipo = "GASTADOR"
        descripcion = "Tus gastos superan tus ingresos. Toma acción urgente."
        color = "danger"
    elif ahorro_pct < 10:
        tipo = "EN_RIESGO"
        descripcion = "Tu ahorro es menor al 10%. Necesitas ajustar tus hábitos."
        color = "warn"
    elif ahorro_pct < 20:
        tipo = "MODERADO"
        descripcion = "Ahorras entre el 10% y 20%. Vas bien, pero puedes mejorar."
        color = "info"
    else:
        tipo = "AHORRADOR"
        descripcion = "Ahorras más del 20% de tus ingresos. ¡Excelente gestión!"
        color = "success"

    return {
        "tipo": tipo,
        "descripcion": descripcion,
        "color": color,
        "porcentaje_ahorro": round(ahorro_pct, 2),
        "ingreso_total": data["ingreso_total"],
        "gasto_total": data["gasto_total"],
        "balance": data["balance"],
    }

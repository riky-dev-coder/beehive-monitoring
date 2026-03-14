# services/recommendation_engine.py
"""
Motor de ventanas de tiempo para generar recomendaciones automáticas.

- Alertas CRITICAL  → ventana de  2 minutos  → recomendación IA
- Alertas WARNING   → ventana de 15 minutos  → recomendación IA

El motor se invoca desde alert_engine.py cada vez que se crea una alerta.
Internamente mantiene en memoria las ventanas activas y escribe en Supabase
cuando se cumple la condición.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from app.core.database import get_supabase_client
from app.models.alert import Alert
import logging

logger = logging.getLogger(__name__)

# ── Configuración de ventanas ────────────────────────────────────────────────
WINDOW_CONFIG = {
    "critical": timedelta(minutes=2),
    "warning":  timedelta(minutes=15),
}

# ── Estado en memoria de ventanas activas ────────────────────────────────────
# Estructura: { severidad: { "start": datetime, "alerts": [Alert] } }
_active_windows: Dict[str, Optional[dict]] = {
    "critical": None,
    "warning":  None,
}


# ── Punto de entrada principal ───────────────────────────────────────────────

async def process_alert_for_recommendation(alert: Alert):
    """
    Llamar desde alert_engine.create_alert() justo después de insertar la alerta.
    Actualiza la ventana correspondiente y dispara la recomendación si se cumple
    la duración mínima.
    """
    severidad = alert.severidad
    if severidad not in WINDOW_CONFIG:
        return  # 'info' y otros niveles no disparan recomendaciones

    now = datetime.now(timezone.utc)
    window = _active_windows[severidad]

    if window is None:
        # Abrir nueva ventana
        _active_windows[severidad] = {
            "start":  now,
            "alerts": [alert],
        }
        logger.debug(f"Ventana '{severidad}' abierta a las {now.isoformat()}")
        return

    # Ventana ya abierta → agregar alerta
    window["alerts"].append(alert)
    elapsed = now - window["start"]

    if elapsed >= WINDOW_CONFIG[severidad]:
        # Condición cumplida → generar recomendación y cerrar ventana
        logger.info(
            f"Ventana '{severidad}' completada ({elapsed}). "
            f"Generando recomendación con {len(window['alerts'])} alertas."
        )
        await _trigger_recommendation(
            severidad=severidad,
            ventana_inicio=window["start"],
            ventana_fin=now,
            alerts=window["alerts"],
        )
        _active_windows[severidad] = None  # cerrar ventana


def reset_window(severidad: str):
    """Cierra manualmente una ventana (útil para tests o reinicio del servicio)."""
    _active_windows[severidad] = None


# ── Generación y persistencia ────────────────────────────────────────────────

async def _trigger_recommendation(
    severidad: str,
    ventana_inicio: datetime,
    ventana_fin: datetime,
    alerts: List[Alert],
):
    from app.services.ai_recommendation import generate_recommendation_from_alerts

    # 1. Obtener contexto histórico de comentarios aceptados
    historical = _get_historical_context()

    # 2. Llamar al LLM
    titulo, texto = await generate_recommendation_from_alerts(
        alerts=alerts,
        severidad=severidad,
        historical_context=historical,
    )

    # 3. Persistir en Supabase
    supabase = get_supabase_client()

    rec_data = {
        "tipo_trigger":    severidad,
        "ventana_inicio":  ventana_inicio.isoformat(),
        "ventana_fin":     ventana_fin.isoformat(),
        "titulo":          titulo,
        "recomendacion":   texto,
        "contexto_usado":  _build_context_summary(alerts),
        "estado":          "pendiente",
        "generada_en":     datetime.now(timezone.utc).isoformat(),
        "actualizada_en":  datetime.now(timezone.utc).isoformat(),
    }

    res = supabase.table("recommendations").insert(rec_data).execute()
    if not res.data:
        logger.error("Error al insertar recomendación en Supabase")
        return

    rec_id = res.data[0]["id"]

    # 4. Relacionar alertas con la recomendación
    alert_links = [
        {"recommendation_id": rec_id, "alert_id": a.id}
        for a in alerts
        if a.id is not None
    ]
    if alert_links:
        supabase.table("recommendation_alerts").insert(alert_links).execute()

    logger.info(f"Recomendación #{rec_id} guardada correctamente.")


def _build_context_summary(alerts: List[Alert]) -> str:
    lines = [f"[{a.severidad.upper()}] {a.sensor_asociado}: {a.mensaje}" for a in alerts]
    return "\n".join(lines)


def _get_historical_context(limit: int = 8) -> str:
    """
    Recupera comentarios de recomendaciones aceptadas para enriquecer el prompt.
    """
    try:
        supabase = get_supabase_client()
        res = supabase.rpc("get_historical_context", {"p_limit": limit}).execute()
        if not res.data:
            return ""
        lines = []
        for row in res.data:
            lines.append(
                f"- Recomendación previa ({row['generada_en'][:10]}): {row['recomendacion']}\n"
                f"  Comentario del apicultor: {row['comentario']}"
            )
        return "\n".join(lines)
    except Exception as e:
        logger.warning(f"No se pudo obtener contexto histórico: {e}")
        return ""


# ── Operaciones CRUD sobre recomendaciones ───────────────────────────────────

async def get_recommendations(estado: Optional[str] = None, limit: int = 50):
    supabase = get_supabase_client()
    query = supabase.table("v_recommendations_summary").select("*")
    if estado:
        query = query.eq("estado", estado)
    res = query.order("generada_en", desc=True).limit(limit).execute()
    return res.data or []


async def update_recommendation_status(rec_id: int, estado: str) -> Optional[dict]:
    """Acepta o rechaza una recomendación."""
    from datetime import datetime, timezone
    supabase = get_supabase_client()
    res = (
        supabase.table("recommendations")
        .update({"estado": estado, "actualizada_en": datetime.now(timezone.utc).isoformat()})
        .eq("id", rec_id)
        .execute()
    )
    return res.data[0] if res.data else None


async def save_beekeeper_comment(rec_id: int, comentario: str) -> Optional[dict]:
    """
    Guarda / actualiza el comentario en la tabla principal Y
    registra una entrada inmutable en recommendation_comments.
    """
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    supabase = get_supabase_client()

    # Actualizar campo rápido en recommendations
    supabase.table("recommendations").update(
        {"comentario_apicultor": comentario, "comentado_en": now, "actualizada_en": now}
    ).eq("id", rec_id).execute()

    # Insertar en historial inmutable
    res = supabase.table("recommendation_comments").insert(
        {"recommendation_id": rec_id, "comentario": comentario, "creado_en": now}
    ).execute()

    return res.data[0] if res.data else None
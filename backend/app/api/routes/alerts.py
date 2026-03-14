from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

# Modelos y servicios
from app.models.alert import Alert, AlertCreate, AlertUpdate
from app.services.alert_engine import get_alerts, update_alert, create_alert

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[Alert])
async def get_all_alerts(
    active_only: bool = Query(False, description="Filtrar solo alertas activas"),
    limit: int = Query(50, le=200)
):
    """
    Obtiene todas las alertas, opcionalmente solo las activas.
    """
    try:
        alerts = await get_alerts(active_only=active_only, limit=limit)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{alert_id}", response_model=Alert)
async def update_alert_status(alert_id: int, alert_update: AlertUpdate):
    """
    Actualiza el estado de una alerta (ej. marcarla como leída/resuelta).
    """
    try:
        updated = await update_alert(alert_id, alert_update)
        if not updated:
            raise HTTPException(status_code=404, detail="Alerta no encontrada")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Alert)
async def create_new_alert(alert: AlertCreate):
    """
    Crea una alerta manualmente (útil para pruebas).
    """
    try:
        new_alert = await create_alert(alert)
        return new_alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
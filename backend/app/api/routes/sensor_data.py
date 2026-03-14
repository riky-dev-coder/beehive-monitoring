from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta

# Modelos y servicios (a implementar)
from app.models.sensor import SensorData, SensorType
from app.services.data_fetcher import get_latest_readings, get_historical_readings

router = APIRouter(prefix="/sensors", tags=["sensors"])

@router.get("/latest", response_model=List[SensorData])
async def get_latest_sensor_data():
    """
    Retorna los valores más recientes de cada sensor (5 sensores).
    Se actualiza cada 20 segundos desde el frontend.
    """
    try:
        data = await get_latest_readings()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[SensorData])
async def get_sensor_history(
    sensor_type: Optional[SensorType] = None,
    start_date: Optional[datetime] = Query(None, description="Inicio del período (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Fin del período (ISO format)"),
    limit: int = Query(100, le=1000),  # ✅ Aumentado para 'all'
    all_time: bool = Query(False, description="Ignorar fechas y traer todo el histórico")
):
    """
    Obtiene datos históricos filtrados por tipo de sensor y rango de fechas.
    Por defecto devuelve los últimos 7 días.
    """
    try:
        # ✅ Si all_time=True, no aplicar filtros de fecha
        if all_time:
            start_date = None
            end_date = None
        else:
            # Defaults solo cuando NO es all_time
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=7)
            if not end_date:
                end_date = datetime.utcnow()
        
        data = await get_historical_readings(
            sensor_type=sensor_type,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/harvest-readiness")
async def get_harvest_readiness():
    from app.services.prediction import get_harvest_readiness
    return await get_harvest_readiness()
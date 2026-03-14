from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class AlertBase(BaseModel):
    """Campos base de una alerta."""
    tipo: str = Field(..., description="Tipo de alerta (temperatura, humedad, peso, etc.)")
    severidad: str = Field(..., description="severidad: info, warning, critical")
    mensaje: str = Field(..., description="Descripción de la alerta")
    sensor_asociado: Optional[str] = Field(None, description="Tipo de sensor relacionado (opcional)")

class AlertCreate(AlertBase):
    """Datos necesarios para crear una alerta (sin id ni timestamp)."""
    pass

class AlertUpdate(BaseModel):
    """Datos actualizables de una alerta (marcar como leída/resuelta)."""
    leida: Optional[bool] = Field(None, description="Indica si el usuario ha visto la alerta")
    resuelta: Optional[bool] = Field(None, description="Indica si la condición ya se normalizó")

class Alert(AlertBase):
    """Alerta completa con campos de sistema."""
    id: int = Field(..., description="Identificador único de la alerta")
    timestamp: datetime = Field(..., description="Momento en que se generó la alerta")
    leida: bool = Field(False, description="Indica si el usuario ha visto la alerta")
    resuelta: bool = Field(False, description="Indica si la condición ya se normalizó")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "timestamp": "2025-03-15T10:35:00Z",
                "tipo": "temperatura",
                "severidad": "warning",
                "mensaje": "Temperatura en cámara de cría fuera de rango (34-36°C): 32.1°C",
                "sensor_asociado": "temp_cria",
                "leida": False,
                "resuelta": False
            }
        }
# models/recommendation.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class RecommendationBase(BaseModel):
    tipo_trigger:   str = Field(..., description="'critical' o 'warning'")
    ventana_inicio: datetime
    ventana_fin:    datetime
    titulo:         str
    recomendacion:  str
    contexto_usado: Optional[str] = None


class Recommendation(RecommendationBase):
    id:                   int
    estado:               str = Field(default="pendiente", description="pendiente | aceptada | rechazada")
    comentario_apicultor: Optional[str] = None
    comentado_en:         Optional[datetime] = None
    generada_en:          datetime
    actualizada_en:       datetime
    total_alertas:        Optional[int] = None  # viene de la vista v_recommendations_summary

    class Config:
        from_attributes = True


class RecommendationStatusUpdate(BaseModel):
    estado: str = Field(..., description="'aceptada' o 'rechazada'")


class RecommendationCommentUpdate(BaseModel):
    comentario: str = Field(..., min_length=1, description="Comentario del apicultor")


class RecommendationComment(BaseModel):
    id:                int
    recommendation_id: int
    comentario:        str
    creado_en:         datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    """Un turno de la conversación."""
    role: str     # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    """
    Cuerpo del POST /recommendations/chat
    - message: último mensaje del apicultor
    - history: historial previo (sin incluir el mensaje actual)
    """
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    """Respuesta del asistente apícola."""
    response: str
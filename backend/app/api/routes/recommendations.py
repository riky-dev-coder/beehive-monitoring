# routes/recommendations.py
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.recommendation import (
    Recommendation,
    RecommendationStatusUpdate,
    RecommendationCommentUpdate,
    RecommendationCommentUpdate,
    RecommendationComment,
    ChatRequest,
    ChatResponse,
)
from app.services.recommendation_engine import (
    get_recommendations,
    update_recommendation_status,
    save_beekeeper_comment,
)
from app.services.ai_recommendation import chat_with_beekeeper_ai

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


# ── GET /recommendations/ ────────────────────────────────────────────────────

@router.get("/", response_model=List[dict])
async def list_recommendations(
    estado: Optional[str] = Query(None, description="Filtrar por estado: pendiente | aceptada | rechazada"),
    limit:  int           = Query(50, le=200),
):
    """
    Lista recomendaciones generadas por la IA.
    Usa la vista v_recommendations_summary (incluye total_alertas).
    """
    try:
        return await get_recommendations(estado=estado, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── PATCH /recommendations/{id}/status ──────────────────────────────────────

@router.patch("/{rec_id}/status", response_model=dict)
async def set_recommendation_status(rec_id: int, body: RecommendationStatusUpdate):
    """
    Acepta o rechaza una recomendación.
    body: { "estado": "aceptada" | "rechazada" }
    """
    if body.estado not in ("aceptada", "rechazada"):
        raise HTTPException(status_code=422, detail="estado debe ser 'aceptada' o 'rechazada'")
    try:
        updated = await update_recommendation_status(rec_id, body.estado)
        if not updated:
            raise HTTPException(status_code=404, detail="Recomendación no encontrada")
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── PATCH /recommendations/{id}/comment ─────────────────────────────────────

@router.patch("/{rec_id}/comment", response_model=dict)
async def add_beekeeper_comment(rec_id: int, body: RecommendationCommentUpdate):
    """
    Guarda o actualiza el comentario del apicultor.
    El historial completo queda en recommendation_comments.
    body: { "comentario": "texto libre..." }
    """
    try:
        result = await save_beekeeper_comment(rec_id, body.comentario)
        if not result:
            raise HTTPException(status_code=404, detail="Recomendación no encontrada")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /recommendations/chat ───────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def beekeeper_chat(body: ChatRequest):
    """
    Chat conversacional con el asistente apícola IA.
    """
    try:
        # 🔧 Convertir ChatMessage Pydantic a dict antes de pasar al chat
        history_dicts = [msg.model_dump() for msg in body.history]
        
        response = await chat_with_beekeeper_ai(
            message=body.message,
            history=history_dicts,  # ✅ Ahora son diccionarios
        )
        return ChatResponse(response=response)
    except Exception as e:
        logger.exception("Error en beekeeper_chat")
        raise HTTPException(status_code=500, detail=str(e))
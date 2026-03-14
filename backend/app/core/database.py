from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Client = None

def get_supabase_client() -> Client:
    """Retorna una instancia singleton del cliente de Supabase con permisos de servicio."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url, 
            settings.supabase_service_key
        )
    return _supabase_client
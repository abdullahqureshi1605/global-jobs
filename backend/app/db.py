from typing import Any

from app.config import settings


def database_status() -> dict[str, Any]:
    """
    Check Supabase configuration.

    This does not perform a database query yet.
    """
    return {
        "configured": settings.database_configured,
        "supabase_configured": settings.supabase_configured,
    }
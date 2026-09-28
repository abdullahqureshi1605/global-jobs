from fastapi import APIRouter

from app.db import database_status

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/db")
def database_health():
    return {
        "status": "ok",
        "database": database_status(),
    }

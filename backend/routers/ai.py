from fastapi import APIRouter, Depends, HTTPException

from pydantic import BaseModel, Field

from services.auth_service import get_current_user
from services.gemini_service import generate_text


router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)


class AIRequest(BaseModel):
    prompt: str = Field(
        min_length=3,
        max_length=10000,
    )


@router.post("/generate")
def ai_generate(
    payload: AIRequest,
    user=Depends(get_current_user),
):
    try:
        result = generate_text(payload.prompt)

        return {
            "status": "ok",
            "model": "gemini-2.5-flash",
            "text": result,
        }

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI generation failed.",
        )

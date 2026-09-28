from functools import lru_cache

from google import genai

from app.config import settings


@lru_cache(maxsize=1)
def get_gemini_client():
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    return genai.Client(
        api_key=settings.gemini_api_key
    )


def generate_text(
    prompt: str,
    model: str = "gemini-2.5-flash",
) -> str:
    client = get_gemini_client()

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    text = getattr(response, "text", None)

    if not text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return text

from fastapi import HTTPException, Header

from services.supabase_service import get_supabase


def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header required",
        )

    if not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=401,
            detail="Bearer token required",
        )

    token = authorization.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Access token required",
        )

    client = get_supabase()

    try:
        response = client.auth.get_user(token)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token",
        )

    user = getattr(response, "user", None)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token",
        )

    return user


def get_profile(user_id: str):
    client = get_supabase()

    result = (
        client
        .table("profiles")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )

    return result.data[0] if result.data else None


def require_role(user, role: str):
    profile = get_profile(user.id)

    if not profile:
        raise HTTPException(
            status_code=403,
            detail="User profile not found",
        )

    if profile.get("role") != role:
        raise HTTPException(
            status_code=403,
            detail=f"{role} role required",
        )

    return profile

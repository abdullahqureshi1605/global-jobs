from fastapi import HTTPException

from services.supabase_service import get_supabase


def get_user_profile(user_id: str):
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


def require_employer(user):
    profile = get_user_profile(user.id)

    if not profile:
        raise HTTPException(
            status_code=403,
            detail="User profile not found",
        )

    if profile.get("role") not in ("employer", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Employer account required",
        )

    return profile


def get_company_member(company_id: str, user_id: str):
    client = get_supabase()

    result = (
        client
        .table("company_members")
        .select("*")
        .eq("company_id", company_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    return result.data[0] if result.data else None


def require_company_access(
    company_id: str,
    user,
    allowed_roles=("owner", "admin", "member"),
):
    member = get_company_member(
        company_id,
        user.id,
    )

    if not member:
        raise HTTPException(
            status_code=403,
            detail="Company access required",
        )

    if member.get("role") not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Insufficient company permissions",
        )

    return member

from fastapi import APIRouter, Depends, HTTPException

from models.auth import ProfileUpdate, RoleUpdate
from services.auth_service import (
    get_current_user,
    get_profile,
)
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.get("/me")
def me(user=Depends(get_current_user)):
    profile = get_profile(user.id)

    return {
        "id": user.id,
        "email": getattr(user, "email", None),
        "role": profile.get("role") if profile else None,
        "profile": profile,
    }


@router.get("/profile")
def get_my_profile(user=Depends(get_current_user)):
    profile = get_profile(user.id)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return profile


@router.patch("/profile")
def update_my_profile(
    payload: ProfileUpdate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    data = payload.model_dump(
        exclude_none=True,
    )

    if not data:
        raise HTTPException(
            status_code=400,
            detail="No fields supplied for update",
        )

    result = (
        client
        .table("profiles")
        .update(data)
        .eq("id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    return result.data[0]


@router.patch("/role")
def update_my_role(
    payload: RoleUpdate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    existing = get_profile(user.id)

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    current_role = existing.get("role")

    if current_role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin role cannot be changed here",
        )

    if payload.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin role cannot be assigned here",
        )

    result = (
        client
        .table("profiles")
        .update({
            "role": payload.role,
        })
        .eq("id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Role could not be updated",
        )

    return result.data[0]

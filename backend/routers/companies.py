from fastapi import APIRouter, Depends, HTTPException

from models.companies import (
    CompanyCreate,
    CompanyUpdate,
    CompanyMemberCreate,
)
from services.auth_service import get_current_user
from services.company_service import (
    require_employer,
    require_company_access,
)
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/companies",
    tags=["companies"],
)


@router.get("")
def list_my_companies(
    user=Depends(get_current_user),
):
    client = get_supabase()

    members = (
        client
        .table("company_members")
        .select("company_id,role")
        .eq("user_id", user.id)
        .execute()
    )

    rows = members.data or []

    if not rows:
        return {
            "data": [],
            "count": 0,
        }

    company_ids = [
        row["company_id"]
        for row in rows
        if row.get("company_id")
    ]

    result = (
        client
        .table("companies")
        .select("*")
        .in_("id", company_ids)
        .order("name")
        .execute()
    )

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.get("/{company_id}")
def get_company(
    company_id: str,
    user=Depends(get_current_user),
):
    require_company_access(
        company_id,
        user,
    )

    client = get_supabase()

    result = (
        client
        .table("companies")
        .select("*")
        .eq("id", company_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return result.data[0]


@router.post("")
def create_company(
    payload: CompanyCreate,
    user=Depends(get_current_user),
):
    require_employer(user)

    client = get_supabase()

    data = payload.model_dump(
        exclude_none=True,
    )

    result = (
        client
        .table("companies")
        .insert(data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Company could not be created",
        )

    company = result.data[0]

    member_data = {
        "company_id": company["id"],
        "user_id": user.id,
        "role": "owner",
    }

    member_result = (
        client
        .table("company_members")
        .insert(member_data)
        .execute()
    )

    if not member_result.data:
        client.table("companies").delete().eq(
            "id",
            company["id"],
        ).execute()

        raise HTTPException(
            status_code=500,
            detail="Company owner could not be created",
        )

    return company


@router.patch("/{company_id}")
def update_company(
    company_id: str,
    payload: CompanyUpdate,
    user=Depends(get_current_user),
):
    require_company_access(
        company_id,
        user,
        allowed_roles=("owner", "admin"),
    )

    data = payload.model_dump(
        exclude_none=True,
    )

    if not data:
        raise HTTPException(
            status_code=400,
            detail="No fields supplied for update",
        )

    client = get_supabase()

    result = (
        client
        .table("companies")
        .update(data)
        .eq("id", company_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return result.data[0]


@router.get("/{company_id}/members")
def list_company_members(
    company_id: str,
    user=Depends(get_current_user),
):
    require_company_access(
        company_id,
        user,
    )

    client = get_supabase()

    result = (
        client
        .table("company_members")
        .select("*")
        .eq("company_id", company_id)
        .order("created_at")
        .execute()
    )

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.post("/{company_id}/members")
def add_company_member(
    company_id: str,
    payload: CompanyMemberCreate,
    user=Depends(get_current_user),
):
    require_company_access(
        company_id,
        user,
        allowed_roles=("owner", "admin"),
    )

    client = get_supabase()

    existing = (
        client
        .table("company_members")
        .select("id")
        .eq("company_id", company_id)
        .eq("user_id", payload.user_id)
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=409,
            detail="User is already a company member",
        )

    data = {
        "company_id": company_id,
        "user_id": payload.user_id,
        "role": payload.role,
    }

    result = (
        client
        .table("company_members")
        .insert(data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Company member could not be added",
        )

    return result.data[0]


@router.delete("/{company_id}/members/{user_id}")
def remove_company_member(
    company_id: str,
    user_id: str,
    user=Depends(get_current_user),
):
    current_member = require_company_access(
        company_id,
        user,
        allowed_roles=("owner", "admin"),
    )

    client = get_supabase()

    target = (
        client
        .table("company_members")
        .select("*")
        .eq("company_id", company_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not target.data:
        raise HTTPException(
            status_code=404,
            detail="Company member not found",
        )

    target_member = target.data[0]

    if (
        target_member.get("role") == "owner"
        and current_member.get("role") != "owner"
    ):
        raise HTTPException(
            status_code=403,
            detail="Only the owner can remove the owner",
        )

    result = (
        client
        .table("company_members")
        .delete()
        .eq("company_id", company_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Company member could not be removed",
        )

    return {
        "status": "ok",
        "message": "Company member removed",
    }

from fastapi import APIRouter, Depends, HTTPException, Query

from models.applications import (
    ApplicationCreate,
    ApplicationUpdate,
)
from services.auth_service import get_current_user
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/applications",
    tags=["applications"],
)


@router.get("")
def list_my_applications(
    user=Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    client = get_supabase()

    start = (page - 1) * limit
    end = start + limit - 1

    result = (
        client
        .table("applications")
        .select("*")
        .eq("candidate_id", user.id)
        .order("created_at", desc=True)
        .range(start, end)
        .execute()
    )

    return {
        "data": result.data or [],
        "page": page,
        "limit": limit,
        "count": len(result.data or []),
    }


@router.get("/{application_id}")
def get_application(
    application_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("applications")
        .select("*")
        .eq("id", application_id)
        .eq("candidate_id", user.id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return result.data[0]


@router.post("")
def create_application(
    payload: ApplicationCreate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    profile = (
        client
        .table("profiles")
        .select("role")
        .eq("id", user.id)
        .limit(1)
        .execute()
    )

    if not profile.data:
        raise HTTPException(
            status_code=403,
            detail="User profile not found",
        )

    if profile.data[0].get("role") != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Candidate account required",
        )

    job = (
        client
        .table("jobs")
        .select("id,status")
        .eq("id", payload.job_id)
        .limit(1)
        .execute()
    )

    if not job.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    if job.data[0].get("status") != "published":
        raise HTTPException(
            status_code=400,
            detail="Applications are only allowed for published jobs",
        )

    existing = (
        client
        .table("applications")
        .select("id")
        .eq("job_id", payload.job_id)
        .eq("candidate_id", user.id)
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=409,
            detail="You have already applied for this job",
        )

    data = payload.model_dump(exclude_none=True)

    data["candidate_id"] = user.id
    data["status"] = "submitted"

    result = (
        client
        .table("applications")
        .insert(data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Application could not be created",
        )

    return result.data[0]


@router.patch("/{application_id}")
def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    existing = (
        client
        .table("applications")
        .select("*")
        .eq("id", application_id)
        .eq("candidate_id", user.id)
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    data = payload.model_dump(exclude_none=True)

    if not data:
        raise HTTPException(
            status_code=400,
            detail="No fields supplied for update",
        )

    result = (
        client
        .table("applications")
        .update(data)
        .eq("id", application_id)
        .eq("candidate_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Application could not be updated",
        )

    return result.data[0]


@router.post("/{application_id}/withdraw")
def withdraw_application(
    application_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("applications")
        .update({"status": "withdrawn"})
        .eq("id", application_id)
        .eq("candidate_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    return {
        "status": "ok",
        "application": result.data[0],
    }

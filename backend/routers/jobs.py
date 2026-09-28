import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from models.jobs import JobCreate, JobUpdate
from services.supabase_service import get_supabase
from services.auth_service import get_current_user, get_profile


router = APIRouter(prefix="/jobs", tags=["jobs"])


def make_slug(title: str) -> str:
    base = re.sub(
        r"[^a-z0-9]+",
        "-",
        title.lower(),
    ).strip("-")

    return base or "job"


def unique_slug(client, base_slug: str) -> str:
    slug = base_slug
    counter = 2

    while True:
        result = (
            client
            .table("jobs")
            .select("id")
            .eq("slug", slug)
            .limit(1)
            .execute()
        )

        if not result.data:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("")
def list_jobs(
    search: Optional[str] = Query(default=None),
    country_id: Optional[str] = Query(default=None),
    category_id: Optional[str] = Query(default=None),
    work_mode: Optional[str] = Query(default=None),
    employment_type: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    client = get_supabase()

    query = (
        client
        .table("jobs")
        .select("*")
        .eq("status", "published")
    )

    if search:
        query = query.ilike(
            "title",
            f"%{search}%",
        )

    if country_id:
        query = query.eq(
            "country_id",
            country_id,
        )

    if category_id:
        query = query.eq(
            "category_id",
            category_id,
        )

    if work_mode:
        query = query.eq(
            "work_mode",
            work_mode,
        )

    if employment_type:
        query = query.eq(
            "employment_type",
            employment_type,
        )

    start = (page - 1) * limit
    end = start + limit - 1

    result = (
        query
        .order("posted_at", desc=True)
        .range(start, end)
        .execute()
    )

    return {
        "data": result.data or [],
        "page": page,
        "limit": limit,
        "count": len(result.data or []),
    }


@router.get("/{job_id}")
def get_job(job_id: str):
    client = get_supabase()

    result = (
        client
        .table("jobs")
        .select("*")
        .eq("id", job_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return result.data[0]


@router.post("")
def create_job(
    payload: JobCreate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    profile = get_profile(user.id)

    if not profile:
        raise HTTPException(
            status_code=403,
            detail="User profile not found",
        )

    if profile.get("role") not in (
        "employer",
        "admin",
    ):
        raise HTTPException(
            status_code=403,
            detail="Employer account required",
        )

    base_slug = make_slug(payload.title)
    slug = unique_slug(client, base_slug)

    data = payload.model_dump(
        exclude_none=True,
    )

    data["slug"] = slug
    data["source"] = "manual"
    data["status"] = "pending_review"

    result = (
        client
        .table("jobs")
        .insert(data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Job could not be created",
        )

    return result.data[0]


@router.patch("/{job_id}")
def update_job(
    job_id: str,
    payload: JobUpdate,
    user=Depends(get_current_user),
):
    client = get_supabase()
    profile = get_profile(user.id)

    if not profile:
        raise HTTPException(
            status_code=403,
            detail="User profile not found",
        )

    if profile.get("role") not in (
        "employer",
        "admin",
    ):
        raise HTTPException(
            status_code=403,
            detail="Employer account required",
        )

    existing = (
        client
        .table("jobs")
        .select("*")
        .eq("id", job_id)
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

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
        .table("jobs")
        .update(data)
        .eq("id", job_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Job could not be updated",
        )

    return result.data[0]


@router.post("/{job_id}/close")
def close_job(
    job_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()
    profile = get_profile(user.id)

    if not profile:
        raise HTTPException(
            status_code=403,
            detail="User profile not found",
        )

    if profile.get("role") not in (
        "employer",
        "admin",
    ):
        raise HTTPException(
            status_code=403,
            detail="Employer account required",
        )

    result = (
        client
        .table("jobs")
        .update({"status": "closed"})
        .eq("id", job_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return {
        "status": "ok",
        "job": result.data[0],
    }

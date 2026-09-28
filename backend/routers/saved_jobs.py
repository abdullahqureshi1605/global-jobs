from fastapi import APIRouter, Depends, HTTPException

from models.saved_jobs import SavedJobCreate
from services.auth_service import get_current_user
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/saved-jobs",
    tags=["saved-jobs"],
)


@router.get("")
def list_saved_jobs(
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("saved_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.post("")
def save_job(
    payload: SavedJobCreate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    job = (
        client
        .table("jobs")
        .select("id")
        .eq("id", payload.job_id)
        .limit(1)
        .execute()
    )

    if not job.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    existing = (
        client
        .table("saved_jobs")
        .select("id")
        .eq("job_id", payload.job_id)
        .eq("user_id", user.id)
        .limit(1)
        .execute()
    )

    if existing.data:
        raise HTTPException(
            status_code=409,
            detail="Job already saved",
        )

    data = {
        "job_id": payload.job_id,
        "user_id": user.id,
    }

    result = (
        client
        .table("saved_jobs")
        .insert(data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Job could not be saved",
        )

    return result.data[0]


@router.delete("/{job_id}")
def remove_saved_job(
    job_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("saved_jobs")
        .delete()
        .eq("job_id", job_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Saved job not found",
        )

    return {
        "status": "ok",
        "message": "Job removed from saved jobs",
    }

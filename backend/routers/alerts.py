from fastapi import APIRouter, Depends, HTTPException

from models.alerts import JobAlertCreate, JobAlertUpdate
from services.auth_service import get_current_user
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/job-alerts",
    tags=["job-alerts"],
)


@router.get("")
def list_alerts(
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("job_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.get("/{alert_id}")
def get_alert(
    alert_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("job_alerts")
        .select("*")
        .eq("id", alert_id)
        .eq("user_id", user.id)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Job alert not found",
        )

    return result.data[0]


@router.post("")
def create_alert(
    payload: JobAlertCreate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    data = payload.model_dump(
        exclude_none=True,
    )

    data["user_id"] = user.id
    data["is_active"] = True

    result = (
        client
        .table("job_alerts")
        .insert(data)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Job alert could not be created",
        )

    return result.data[0]


@router.patch("/{alert_id}")
def update_alert(
    alert_id: str,
    payload: JobAlertUpdate,
    user=Depends(get_current_user),
):
    client = get_supabase()

    existing = (
        client
        .table("job_alerts")
        .select("id")
        .eq("id", alert_id)
        .eq("user_id", user.id)
        .limit(1)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="Job alert not found",
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
        .table("job_alerts")
        .update(data)
        .eq("id", alert_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Job alert could not be updated",
        )

    return result.data[0]


@router.post("/{alert_id}/pause")
def pause_alert(
    alert_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("job_alerts")
        .update({"is_active": False})
        .eq("id", alert_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Job alert not found",
        )

    return result.data[0]


@router.post("/{alert_id}/resume")
def resume_alert(
    alert_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("job_alerts")
        .update({"is_active": True})
        .eq("id", alert_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Job alert not found",
        )

    return result.data[0]


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("job_alerts")
        .delete()
        .eq("id", alert_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Job alert not found",
        )

    return {
        "status": "ok",
        "message": "Job alert deleted",
    }

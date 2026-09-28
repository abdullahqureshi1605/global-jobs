from fastapi import APIRouter, Depends, HTTPException, Query

from services.auth_service import get_current_user
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
)


@router.get("")
def list_notifications(
    unread_only: bool = Query(default=False),
    user=Depends(get_current_user),
):
    client = get_supabase()

    query = (
        client
        .table("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
    )

    if unread_only:
        query = query.eq(
            "is_read",
            False,
        )

    result = query.execute()

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.get("/unread-count")
def unread_count(
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_read", False)
        .execute()
    )

    return {
        "count": len(result.data or []),
    }


@router.post("/{notification_id}/read")
def mark_read(
    notification_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("notifications")
        .update({"is_read": True})
        .eq("id", notification_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return result.data[0]


@router.post("/read-all")
def mark_all_read(
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("notifications")
        .update({"is_read": True})
        .eq("user_id", user.id)
        .eq("is_read", False)
        .execute()
    )

    return {
        "status": "ok",
        "count": len(result.data or []),
    }


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    user=Depends(get_current_user),
):
    client = get_supabase()

    result = (
        client
        .table("notifications")
        .delete()
        .eq("id", notification_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    return {
        "status": "ok",
        "message": "Notification deleted",
    }

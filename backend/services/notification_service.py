from typing import Optional

from services.supabase_service import get_supabase


def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    link: Optional[str] = None,
):
    client = get_supabase()

    data = {
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "is_read": False,
    }

    if link:
        data["link"] = link

    result = (
        client
        .table("notifications")
        .insert(data)
        .execute()
    )

    return result.data[0] if result.data else None

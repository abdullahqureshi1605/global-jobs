from fastapi import APIRouter

from services.supabase_service import get_supabase


router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/categories")
def list_categories():
    client = get_supabase()

    result = (
        client
        .table("categories")
        .select("*")
        .order("name")
        .execute()
    )

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.get("/countries")
def list_countries():
    client = get_supabase()

    result = (
        client
        .table("countries")
        .select("*")
        .order("name")
        .execute()
    )

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.get("/categories/{category_id}")
def get_category(category_id: str):
    client = get_supabase()

    result = (
        client
        .table("categories")
        .select("*")
        .eq("id", category_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {
            "error": "Category not found"
        }

    return result.data[0]


@router.get("/countries/{country_id}")
def get_country(country_id: str):
    client = get_supabase()

    result = (
        client
        .table("countries")
        .select("*")
        .eq("id", country_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {
            "error": "Country not found"
        }

    return result.data[0]

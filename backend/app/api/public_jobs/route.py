from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv
import os

from supabase import create_client

load_dotenv()

router = APIRouter(tags=["Public Jobs"])


def get_supabase():
    url = (
        os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        or os.getenv("SUPABASE_URL")
        or ""
    ).strip()

    key = (
        os.getenv("SUPABASE_SECRET_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or ""
    ).strip()

    if not url:
        raise RuntimeError("Supabase URL is missing")

    if not key:
        raise RuntimeError("Supabase secret key is missing")

    return create_client(url, key)


@router.get("")
async def public_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
    country: str | None = Query(default=None),
):
    try:
        supabase = get_supabase()

        query = (
            supabase
            .table("job_content")
            .select(
                "id,raw_job_id,public_slug,title,summary,detailed_description,skills,"
                "company_name,category_label,category_tag,"
                "location_display,salary_min,salary_max,"
                "salary_is_predicted,contract_type,contract_time,"
                "latitude,longitude,source,redirect_url,published_at"
            )
            .eq("quality_status", "approved")
            .eq("publication_status", "published")
            .order("published_at", desc=True)
            .range(offset, offset + limit - 1)
        )

        if search:
            safe_search = search.strip()

            if safe_search:
                query = query.or_(
                    f"title.ilike.%{safe_search}%,"
                    f"company_name.ilike.%{safe_search}%,"
                    f"location_display.ilike.%{safe_search}%"
                )

        if country:
            raw_jobs = (
                supabase
                .table("adzuna_raw_jobs")
                .select("id")
                .eq("country_code", country.strip().lower())
                .execute()
            )

            raw_ids = [
                row["id"]
                for row in (raw_jobs.data or [])
            ]

            if not raw_ids:
                return {
                    "status": "ok",
                    "count": 0,
                    "offset": offset,
                    "limit": limit,
                    "jobs": [],
                }

            query = query.in_(
                "raw_job_id",
                raw_ids,
            )

        response = query.execute()
        jobs = response.data or []
        raw_job_ids = [job.get("raw_job_id") for job in jobs if job.get("raw_job_id")]
        country_by_raw_id = {}

        if raw_job_ids:
            raw_response = (
                supabase
                .table("adzuna_raw_jobs")
                .select("id,country_code")
                .in_("id", raw_job_ids)
                .execute()
            )

            country_by_raw_id = {
                row["id"]: row.get("country_code")
                for row in (raw_response.data or [])
            }

        jobs = [
            {
                **job,
                "country_code": country_by_raw_id.get(job.get("raw_job_id")),
            }
            for job in jobs
        ]

        return {
            "status": "ok",
            "count": len(jobs),
            "offset": offset,
            "limit": limit,
            "jobs": jobs,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/count")
async def published_job_count():
    try:
        supabase = get_supabase()

        response = (
            supabase
            .table("job_content")
            .select("id", count="exact")
            .eq("quality_status", "approved")
            .eq("publication_status", "published")
            .execute()
        )

        return {
            "status": "ok",
            "published": response.count or 0,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )




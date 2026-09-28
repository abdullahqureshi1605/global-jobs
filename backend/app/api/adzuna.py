from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.core.settings import ADZUNA_DEFAULT_COUNTRY
from app.core.supabase import get_supabase
from app.services.adzuna import AdzunaClient

router = APIRouter(tags=["Adzuna"])


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_job(job: dict[str, Any], country: str) -> dict[str, Any]:
    location = job.get("location") or {}
    category = job.get("category") or {}
    company = job.get("company") or {}

    predicted = job.get("salary_is_predicted")

    if isinstance(predicted, str):
        predicted = predicted == "1"

    return {
        "adzuna_id": str(job.get("id") or ""),
        "country_code": country,
        "title": job.get("title"),
        "description": job.get("description"),
        "company_name": company.get("display_name"),
        "category_label": category.get("label"),
        "category_tag": category.get("tag"),
        "location_display": location.get("display_name"),
        "location_area": location.get("area"),
        "salary_min": job.get("salary_min"),
        "salary_max": job.get("salary_max"),
        "salary_is_predicted": predicted,
        "contract_type": job.get("contract_type"),
        "contract_time": job.get("contract_time"),
        "latitude": job.get("latitude"),
        "longitude": job.get("longitude"),
        "redirect_url": job.get("redirect_url") or "",
        "source": "adzuna",
        "raw_payload": job,
        "processing_status": "pending",
    }


@router.get("/test")
async def test_adzuna(
    country: str = Query(default=ADZUNA_DEFAULT_COUNTRY),
):
    client = AdzunaClient()

    try:
        data = await client.search_jobs(
            country=country,
            page=1,
            results_per_page=1,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Adzuna test failed: {exc}",
        )

    results = data.get("results") or []

    return {
        "status": "ok",
        "country": country,
        "results_received": len(results),
        "sample": results[0] if results else None,
    }


@router.get("/stats")
async def adzuna_stats(
    country: str | None = Query(default=None),
):
    try:
        supabase = get_supabase()

        base_query = (
            supabase
            .table("adzuna_raw_jobs")
            .select("id,processing_status", count="exact")
        )

        if country:
            base_query = base_query.eq(
                "country_code",
                country.strip().lower()
            )

        total_response = base_query.execute()

        rows = total_response.data or []

        counts = {
            "total": total_response.count or len(rows),
            "pending": 0,
            "processed": 0,
            "needs_review": 0,
            "error": 0,
        }

        for row in rows:
            status = row.get("processing_status")

            if status == "pending":
                counts["pending"] += 1
            elif status == "processed":
                counts["processed"] += 1
            elif status == "needs_review":
                counts["needs_review"] += 1
            elif status == "error":
                counts["error"] += 1

        work_query = (
            supabase
            .table("adzuna_raw_jobs")
            .select(
                "id,adzuna_id,title,country_code,company_name,"
                "location_display,processing_status,first_seen_at,"
                "last_seen_at,created_at,updated_at"
            )
            .eq("processing_status", "pending")
            .order("created_at", desc=True)
            .limit(50)
        )

        if country:
            work_query = work_query.eq(
                "country_code",
                country.strip().lower()
            )

        work_response = work_query.execute()

        return {
            "status": "ok",
            "country": country,
            "counts": counts,
            "work_queue": work_response.data or [],
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/import")
async def import_adzuna_jobs(
    country: str = Query(default=ADZUNA_DEFAULT_COUNTRY),
    page: int = Query(default=1, ge=1),
    results_per_page: int = Query(default=20, ge=1, le=50),
    what: str | None = Query(default=None),
    where: str | None = Query(default=None),
):
    client = AdzunaClient()

    try:
        data = await client.search_jobs(
            country=country,
            page=page,
            results_per_page=results_per_page,
            what=what,
            where=where,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Adzuna request failed: {exc}",
        )

    results = data.get("results") or []

    rows: list[dict[str, Any]] = []

    for job in results:
        row = normalize_job(job, country)

        if row["adzuna_id"] and row["redirect_url"]:
            rows.append(row)

    if not rows:
        return {
            "status": "ok",
            "country": country,
            "received": len(results),
            "prepared": 0,
            "inserted": 0,
            "updated": 0,
            "failed": 0,
            "errors": [],
        }

    supabase = get_supabase()

    inserted = 0
    updated = 0
    failed = 0
    errors: list[dict[str, str]] = []

    timestamp = now_utc()

    for row in rows:
        try:
            existing_response = (
                supabase
                .table("adzuna_raw_jobs")
                .select("id,processing_status")
                .eq("source", "adzuna")
                .eq("country_code", row["country_code"])
                .eq("adzuna_id", row["adzuna_id"])
                .limit(1)
                .execute()
            )

            existing_rows = (
                existing_response.data
                if existing_response is not None
                else []
            )

            if existing_rows:
                existing_id = existing_rows[0]["id"]

                update_data = {
                    "title": row["title"],
                    "description": row["description"],
                    "company_name": row["company_name"],
                    "category_label": row["category_label"],
                    "category_tag": row["category_tag"],
                    "location_display": row["location_display"],
                    "location_area": row["location_area"],
                    "salary_min": row["salary_min"],
                    "salary_max": row["salary_max"],
                    "salary_is_predicted": row["salary_is_predicted"],
                    "contract_type": row["contract_type"],
                    "contract_time": row["contract_time"],
                    "latitude": row["latitude"],
                    "longitude": row["longitude"],
                    "redirect_url": row["redirect_url"],
                    "raw_payload": row["raw_payload"],
                    "last_seen_at": timestamp,
                    "updated_at": timestamp,
                }

                (
                    supabase
                    .table("adzuna_raw_jobs")
                    .update(update_data)
                    .eq("id", existing_id)
                    .execute()
                )

                updated += 1

            else:
                insert_data = {
                    "adzuna_id": row["adzuna_id"],
                    "country_code": row["country_code"],
                    "title": row["title"],
                    "description": row["description"],
                    "company_name": row["company_name"],
                    "category_label": row["category_label"],
                    "category_tag": row["category_tag"],
                    "location_display": row["location_display"],
                    "location_area": row["location_area"],
                    "salary_min": row["salary_min"],
                    "salary_max": row["salary_max"],
                    "salary_is_predicted": row["salary_is_predicted"],
                    "contract_type": row["contract_type"],
                    "contract_time": row["contract_time"],
                    "latitude": row["latitude"],
                    "longitude": row["longitude"],
                    "redirect_url": row["redirect_url"],
                    "source": "adzuna",
                    "raw_payload": row["raw_payload"],
                    "processing_status": "pending",
                    "first_seen_at": timestamp,
                    "last_seen_at": timestamp,
                    "created_at": timestamp,
                    "updated_at": timestamp,
                }

                (
                    supabase
                    .table("adzuna_raw_jobs")
                    .insert(insert_data)
                    .execute()
                )

                inserted += 1

        except Exception as exc:
            failed += 1
            errors.append({
                "adzuna_id": row["adzuna_id"],
                "error": str(exc)[:500],
            })

    return {
        "status": "ok" if failed == 0 else "partial",
        "country": country,
        "received": len(results),
        "prepared": len(rows),
        "inserted": inserted,
        "updated": updated,
        "failed": failed,
        "errors": errors[:10],
    }

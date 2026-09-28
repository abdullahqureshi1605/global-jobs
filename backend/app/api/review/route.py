from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

router = APIRouter(tags=["Job Review"])


def get_supabase() -> Client:
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


class ReviewRequest(BaseModel):
    notes: str | None = None
    reviewed_by: str = "admin"


def now_utc():
    return datetime.now(timezone.utc).isoformat()


@router.get("/stats")
def review_stats():
    try:
        supabase = get_supabase()

        response = (
            supabase
            .table("job_content")
            .select(
                "quality_status,publication_status,"
                "ad_eligibility_status,manual_review_required"
            )
            .execute()
        )

        rows = response.data or []

        stats = {
            "total": len(rows),
            "approved": 0,
            "needs_review": 0,
            "rejected": 0,
            "published": 0,
            "draft": 0,
            "unpublished": 0,
            "ad_eligible": 0,
            "manual_review_required": 0,
            "ready_to_publish": 0,
        }

        for row in rows:
            quality = row.get("quality_status")
            publication = row.get("publication_status")
            ad_status = row.get("ad_eligibility_status")

            if quality == "approved":
                stats["approved"] += 1
            elif quality == "needs_review":
                stats["needs_review"] += 1
            elif quality == "rejected":
                stats["rejected"] += 1

            if publication == "published":
                stats["published"] += 1
            elif publication == "draft":
                stats["draft"] += 1
            elif publication == "unpublished":
                stats["unpublished"] += 1

            if ad_status == "eligible":
                stats["ad_eligible"] += 1

            if row.get("manual_review_required"):
                stats["manual_review_required"] += 1

            if (
                quality == "approved"
                and publication == "draft"
                and ad_status == "eligible"
                and not row.get("manual_review_required")
            ):
                stats["ready_to_publish"] += 1

        return {
            "status": "ok",
            "stats": stats,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/queue")
def review_queue(
    status: str = Query("needs_review"),
    publication: str | None = Query(default=None),
    limit: int = Query(50, ge=1, le=200),
):
    try:
        supabase = get_supabase()

        query = (
            supabase
            .table("job_content")
            .select(
                "id,raw_job_id,title,summary,detailed_description,"
                "skills,company_name,category_label,category_tag,"
                "location_display,salary_min,salary_max,"
                "salary_is_predicted,contract_type,contract_time,"
                "latitude,longitude,source,redirect_url,"
                "source_description,quality_status,quality_score,"
                "originality_score,seo_score,adsense_score,"
                "content_value_score,source_coverage_score,"
                "policy_safety_score,manual_review_required,"
                "ad_eligibility_status,publication_status,"
                "processed_at,reviewed_at,reviewed_by,review_notes"
            )
            .eq("quality_status", status)
            .order("processed_at", desc=True)
            .limit(limit)
        )

        if publication:
            query = query.eq(
                "publication_status",
                publication,
            )

        response = query.execute()

        return {
            "status": "ok",
            "count": len(response.data or []),
            "jobs": response.data or [],
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{job_id}")
def get_job_detail(job_id: str):
    try:
        supabase = get_supabase()

        job_response = (
            supabase
            .table("job_content")
            .select("*")
            .eq("id", job_id)
            .limit(1)
            .execute()
        )

        if not job_response.data:
            raise HTTPException(
                status_code=404,
                detail="Job content not found",
            )

        job = job_response.data[0]

        raw_job = None

        if job.get("raw_job_id"):
            raw_response = (
                supabase
                .table("adzuna_raw_jobs")
                .select("*")
                .eq("id", job["raw_job_id"])
                .limit(1)
                .execute()
            )

            if raw_response.data:
                raw_job = raw_response.data[0]

        return {
            "status": "ok",
            "job": job,
            "raw_job": raw_job,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/{job_id}/approve")
@router.post("/{job_id}/approve")
def approve_job(
    job_id: str,
    payload: ReviewRequest,
):
    try:
        supabase = get_supabase()
        now = now_utc()

        existing = (
            supabase
            .table("job_content")
            .select(
                "id,"
                "quality_score,"
                "originality_score,"
                "seo_score,"
                "content_value_score,"
                "source_coverage_score,"
                "policy_safety_score,"
                "adsense_score"
            )
            .eq("id", job_id)
            .limit(1)
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Job content not found",
            )

        job = existing.data[0]

        scores = [
            job.get("quality_score") or 0,
            job.get("originality_score") or 0,
            job.get("seo_score") or 0,
            job.get("content_value_score") or 0,
            job.get("source_coverage_score") or 0,
            job.get("policy_safety_score") or 0,
        ]

        adsense_score = job.get(
            "adsense_score"
        ) or 0

        # Direct approval remains protected by the complete
        # six-score release gate.
        if min(
            *scores,
            adsense_score,
        ) < 90:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Job does not meet the 90/100 "
                    "internal release gate. "
                    "All six editorial scores and the "
                    "internal readiness score must be at least 90."
                ),
            )

        updated = (
            supabase
            .table("job_content")
            .update(
                {
                    "quality_status":
                        "approved",

                    "ad_eligibility_status":
                        "eligible",

                    "manual_review_required":
                        False,

                    # ADMIN APPROVE = DIRECT PUBLISH
                    "publication_status":
                        "published",

                    "published_at":
                        now,

                    "reviewed_at":
                        now,

                    "reviewed_by":
                        payload.reviewed_by,

                    "review_notes":
                        payload.notes,
                }
            )
            .eq("id", job_id)
            .execute()
        )

        if not updated.data:
            raise HTTPException(
                status_code=500,
                detail="Job approval update failed",
            )

        return {
            "status": "ok",
            "action": "approved_and_published",
            "message":
                "Job approved and published successfully.",
            "job":
                updated.data[0],
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.post("/{job_id}/reject")
def reject_job(
    job_id: str,
    payload: ReviewRequest,
):
    try:
        supabase = get_supabase()
        now = now_utc()

        existing = (
            supabase
            .table("job_content")
            .select("id")
            .eq("id", job_id)
            .limit(1)
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Job content not found",
            )

        updated = (
            supabase
            .table("job_content")
            .update(
                {
                    "quality_status": "rejected",
                    "ad_eligibility_status": "ineligible",
                    "manual_review_required": False,
                    "publication_status": "unpublished",
                    "reviewed_at": now,
                    "reviewed_by": payload.reviewed_by,
                    "review_notes": payload.notes,
                }
            )
            .eq("id", job_id)
            .execute()
        )

        return {
            "status": "ok",
            "action": "rejected",
            "job": updated.data[0] if updated.data else None,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/{job_id}/publish")
@router.post("/{job_id}/publish")
def publish_job(
    job_id: str,
    payload: ReviewRequest,
):
    try:
        supabase = get_supabase()
        now = now_utc()

        existing = (
            supabase
            .table("job_content")
            .select(
                "id,"
                "quality_status,"
                "publication_status,"
                "ad_eligibility_status,"
                "manual_review_required,"
                "adsense_score,"
                "quality_score,"
                "originality_score,"
                "seo_score,"
                "content_value_score,"
                "source_coverage_score,"
                "policy_safety_score"
            )
            .eq("id", job_id)
            .limit(1)
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Job content not found",
            )

        job = existing.data[0]

        if (
            job.get("publication_status")
            == "published"
        ):
            raise HTTPException(
                status_code=409,
                detail="Job is already published.",
            )

        scores = [
            job.get("quality_score") or 0,
            job.get("originality_score") or 0,
            job.get("seo_score") or 0,
            job.get("content_value_score") or 0,
            job.get("source_coverage_score") or 0,
            job.get("policy_safety_score") or 0,
        ]

        adsense_score = (
            job.get("adsense_score") or 0
        )

        # Publishing is allowed only after the complete
        # editorial gate has passed.
        if min(
            *scores,
            adsense_score,
        ) < 90:
            weak = []

            score_names = [
                "quality_score",
                "originality_score",
                "seo_score",
                "content_value_score",
                "source_coverage_score",
                "policy_safety_score",
                "adsense_score",
            ]

            values = scores + [adsense_score]

            for name, value in zip(
                score_names,
                values,
            ):
                if value < 90:
                    weak.append(
                        f"{name}: {value}"
                    )

            raise HTTPException(
                status_code=409,
                detail=(
                    "Publishing is blocked because "
                    "the internal release gate has not passed. "
                    "Weak scores: "
                    + ", ".join(weak)
                ),
            )

        if (
            job.get("ad_eligibility_status")
            not in {
                "eligible",
                None,
            }
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Publishing is blocked because "
                    "ad eligibility is not eligible."
                ),
            )

        updated = (
            supabase
            .table("job_content")
            .update(
                {
                    # Final human publication decision.
                    "quality_status":
                        "approved",

                    "ad_eligibility_status":
                        "eligible",

                    "manual_review_required":
                        False,

                    "publication_status":
                        "published",

                    "published_at":
                        now,

                    "reviewed_at":
                        now,

                    "reviewed_by":
                        payload.reviewed_by,

                    "review_notes":
                        payload.notes
                        or
                        "Final human publication decision completed.",
                }
            )
            .eq(
                "id",
                job_id,
            )
            .execute()
        )

        if not updated.data:
            raise HTTPException(
                status_code=500,
                detail="Job publication update failed.",
            )

        return {
            "status": "ok",
            "action":
                "published",
            "message":
                "Job published successfully.",
            "job":
                updated.data[0],
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.post("/{job_id}/unpublish")
def unpublish_job(
    job_id: str,
    payload: ReviewRequest,
):
    try:
        supabase = get_supabase()
        now = now_utc()

        existing = (
            supabase
            .table("job_content")
            .select("id")
            .eq("id", job_id)
            .limit(1)
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Job content not found",
            )

        updated = (
            supabase
            .table("job_content")
            .update(
                {
                    "publication_status": "unpublished",
                    "reviewed_at": now,
                    "reviewed_by": payload.reviewed_by,
                    "review_notes": payload.notes,
                }
            )
            .eq("id", job_id)
            .execute()
        )

        return {
            "status": "ok",
            "action": "unpublished",
            "job": updated.data[0] if updated.data else None,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


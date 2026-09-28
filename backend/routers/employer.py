from fastapi import APIRouter, Depends, HTTPException, Query

from services.auth_service import get_current_user
from services.company_service import require_company_access
from services.supabase_service import get_supabase


router = APIRouter(
    prefix="/employer",
    tags=["employer"],
)


@router.get("/companies/{company_id}/applications")
def list_company_applications(
    company_id: str,
    status: str | None = Query(default=None),
    user=Depends(get_current_user),
):
    require_company_access(
        company_id,
        user,
        allowed_roles=("owner", "admin", "member"),
    )

    client = get_supabase()

    jobs = (
        client
        .table("jobs")
        .select("id,title")
        .eq("company_id", company_id)
        .execute()
    )

    job_rows = jobs.data or []

    if not job_rows:
        return {
            "data": [],
            "count": 0,
        }

    job_ids = [
        job["id"]
        for job in job_rows
        if job.get("id")
    ]

    query = (
        client
        .table("applications")
        .select("*")
        .in_("job_id", job_ids)
        .order("created_at", desc=True)
    )

    if status:
        query = query.eq(
            "status",
            status,
        )

    result = query.execute()

    return {
        "data": result.data or [],
        "count": len(result.data or []),
    }


@router.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    status: str,
    user=Depends(get_current_user),
):
    allowed = {
        "submitted",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
        "withdrawn",
    }

    if status not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status",
        )

    client = get_supabase()

    application = (
        client
        .table("applications")
        .select("id,job_id")
        .eq("id", application_id)
        .limit(1)
        .execute()
    )

    if not application.data:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    job_id = application.data[0]["job_id"]

    job = (
        client
        .table("jobs")
        .select("company_id")
        .eq("id", job_id)
        .limit(1)
        .execute()
    )

    if not job.data:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    company_id = job.data[0].get("company_id")

    if not company_id:
        raise HTTPException(
            status_code=400,
            detail="Job is not linked to a company",
        )

    require_company_access(
        company_id,
        user,
        allowed_roles=("owner", "admin", "member"),
    )

    result = (
        client
        .table("applications")
        .update({"status": status})
        .eq("id", application_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Application status could not be updated",
        )

    return result.data[0]

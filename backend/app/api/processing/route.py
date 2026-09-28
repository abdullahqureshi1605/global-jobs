import json
import os
import re
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from google import genai
from supabase import create_client

load_dotenv()

router = APIRouter(tags=["Job Processing"])


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


def get_gemini():
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()

    model = (
        os.getenv("GEMINI_MODEL")
        or "gemini-3.5-flash-lite"
    ).strip()

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing")

    return genai.Client(api_key=api_key), model


def clean_encoding(value: Any) -> str:
    if value is None:
        return ""

    text = str(value)

    replacements = {
        "Ã‚Â£": "Â£",
        "Ã‚â‚¬": "â‚¬",
        "Ã‚Â¥": "Â¥",
        "Ã‚Â©": "Â©",
        "Ã‚Â®": "Â®",
        "Ã¢â‚¬â„¢": "â€™",
        "Ã¢â‚¬Å“": "â€œ",
        "Ã¢â‚¬": "â€",
        "Ã¢â‚¬â€œ": "â€“",
        "Ã¢â‚¬â€": "â€”",
        "Ã¢â‚¬Â¦": "â€¦",
        "Ã¢â‚¬Â¢": "â€¢",
        "Ã‚ ": " ",
    }

    for bad, good in replacements.items():
        text = text.replace(bad, good)

    text = text.replace("\r", " ")
    text = text.replace("\n", " ")

    return re.sub(r"\s+", " ", text).strip()



def make_public_slug(title: str, raw_job_id: str) -> str:
    """Create a readable, collision-resistant public job slug."""
    import re

    base = clean_text(title).lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")

    suffix = clean_text(raw_job_id).lower().replace("-", "")[:12]

    return f"{base}-{suffix}" if base else f"job-{suffix}"
def clean_text(value: Any) -> str:
    return clean_encoding(value)


def normalize_skills(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    result: list[str] = []

    for item in value:
        skill = clean_text(item)

        if not skill:
            continue

        if skill.lower() in {
            existing.lower()
            for existing in result
        }:
            continue

        result.append(skill)

    return result[:30]


def normalize_points(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    result: list[str] = []

    for item in value:
        point = clean_text(item)

        if not point:
            continue

        if point.lower() in {
            existing.lower()
            for existing in result
        }:
            continue

        result.append(point)

    return result[:20]


def clamp_score(value: Any) -> int:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0

    # Gemini may occasionally return a 0-10 score
    # even when the prompt requests 0-100.
    if 0 <= number <= 10:
        number *= 10

    return max(0, min(100, round(number)))


def extract_json(text: str) -> dict[str, Any]:
    text = text.strip()

    if text.startswith("```"):
        text = re.sub(
            r"^```(?:json)?",
            "",
            text,
        )

        text = re.sub(
            r"```$",
            "",
            text,
        ).strip()

    start = text.find("{")
    end = text.rfind("}")

    if start < 0 or end < 0 or end <= start:
        raise ValueError("Gemini returned no valid JSON object")

    value = json.loads(text[start:end + 1])

    if not isinstance(value, dict):
        raise ValueError("Gemini response is not an object")

    return value


def build_prompt(job: dict[str, Any]) -> str:
    source = clean_text(job.get("description"))

    return f"""
You are the editorial quality engine for Horizon Jobs.

Your job is to turn the supplied third-party employment listing into
a useful, original, accurate job page.

THIS IS NOT A SHORT SUMMARY TASK.

The detailed_description is the main content that will be reviewed
and potentially shown to users.

CONTENT RULES:

1. Preserve ALL material employment facts supported by the source.
2. Preserve requirements and qualifications.
3. Preserve responsibilities and duties.
4. Preserve salary and compensation information.
5. Preserve working hours and schedules.
6. Preserve location information.
7. Preserve contract/employment type.
8. Preserve benefits when explicitly present.
9. Preserve sponsorship or eligibility statements when explicitly present.
10. Preserve other concrete hiring conditions when present.
11. Never invent facts.
12. Never add generic filler just to make the page longer.
13. Never copy sentences from the source.
14. Do not perform simple synonym substitution.
15. Change sentence structure and presentation substantially.
16. Remove obvious promotional slogans and marketing fluff where possible.
17. Keep meaningful employment information.
18. Create useful organization and readable paragraphs.
19. detailed_description should normally contain multiple paragraphs
    when the source contains enough information.
20. Do not mention Adzuna.
21. Do not mention this AI process.
22. Do not claim Google approval.
23. Skills must be supported by the source.
24. meta_title must describe the actual job and use important supplied terms naturally.
25. meta_title must be no longer than 60 characters.
26. meta_description must accurately describe the actual job and must be no longer than 160 characters.
27. seo_keywords must contain 5 to 12 concise, relevant search phrases supported by the source.
28. Do not keyword-stuff.
29. Do not invent locations, qualifications, employers, salaries, benefits, technologies, or job duties.
30. SEO metadata must describe the generated job content, not the original source website.

31. responsibilities MUST contain only concrete duties or responsibilities explicitly supported by the source.
32. requirements MUST contain only concrete qualifications, experience, eligibility, certifications, skills, or other hiring requirements explicitly supported by the source.
33. additional_information MUST contain useful factual employment details supported by the source, such as salary, hours, work pattern, location details, contract details, benefits, overtime, start arrangements, or application conditions.
34. Do NOT put promotional claims, marketing slogans, unsupported earning claims, or invented advantages into additional_information.
35. If a structured field has no supported information, return an empty array instead of inventing content.
36. Avoid repeating the same fact across responsibilities, requirements, and additional_information unless repetition is necessary for clarity.
37. The three structured sections must add useful information beyond the summary and must be consistent with the detailed_description.
38. When the source provides enough information, use several concise bullet-style items rather than combining unrelated facts into one long item.

CONTENT VALUE:

The rewrite should help a real job seeker understand the opportunity
without visiting another page first.

Return ONLY JSON:

{{
  "summary": "Two concise original paragraphs, maximum 1200 characters.",
  "detailed_description": "Detailed substantially rewritten job description preserving the useful source facts.",
  "responsibilities": ["Responsibility supported by the source"],
  "requirements": ["Requirement supported by the source"],
  "additional_information": ["Additional employment information supported by the source"],
  "skills": ["skill 1", "skill 2"],
  "meta_title": "SEO-friendly job page title, maximum 60 characters, based only on supplied facts.",
  "meta_description": "SEO-friendly search description, maximum 160 characters, based only on supplied facts.",
  "seo_keywords": ["relevant job keyword", "relevant skill", "relevant location"],
  "quality_score": 0,
  "originality_score": 0,
  "seo_score": 0,
  "content_value_score": 0,
  "source_coverage_score": 0,
  "policy_safety_score": 0
}}

Scoring:

quality_score:
Overall factual quality and usefulness.

originality_score:
How substantially the wording and structure differ from the source.

seo_score:
Useful search-readable structure without keyword stuffing.

content_value_score:
How useful and complete the resulting job page is for a job seeker.

source_coverage_score:
How completely material facts from the source have been retained.

policy_safety_score:
Whether the rewritten content is suitable for publication under
ordinary publisher-content standards.

Do not inflate scores. Score honestly.

IMPORTANT SCORING FORMAT:
All six score fields MUST be integers from 0 to 100.
Do NOT use 0-10.
Example: excellent = 95, not 9.5 or 9.

SOURCE JOB

Title:
{clean_text(job.get("title"))}

Company:
{clean_text(job.get("company_name"))}

Category:
{clean_text(job.get("category_label"))}

Location:
{clean_text(job.get("location_display"))}

Contract:
{clean_text(job.get("contract_type"))}

Contract time:
{clean_text(job.get("contract_time"))}

SOURCE DESCRIPTION:
{source}
""".strip()


def generate_content(job: dict[str, Any]) -> dict[str, Any]:
    client, model = get_gemini()

    response = client.models.generate_content(
        model=model,
        contents=build_prompt(job),
        config={
            "temperature": 0.15,
            "response_mime_type": "application/json",
            "max_output_tokens": 3000,
        },
    )

    text = (response.text or "").strip()

    if not text:
        raise RuntimeError("Gemini returned empty content")

    return extract_json(text)


def calculate_internal_adsense_score(
    quality_score: int,
    originality_score: int,
    seo_score: int,
    content_value_score: int,
    source_coverage_score: int,
    policy_safety_score: int,
    summary: str,
    detailed_description: str,
    skills: list[str],
) -> int:

    structural = 100

    if len(summary) < 180:
        structural -= 15

    if len(summary) > 1200:
        structural -= 10

    if len(detailed_description) < 500:
        structural -= 25

    if not skills:
        structural -= 15

    return min(
        quality_score,
        originality_score,
        seo_score,
        content_value_score,
        source_coverage_score,
        policy_safety_score,
        max(0, structural),
    )


def content_is_usable(
    summary: str,
    detailed_description: str,
    skills: list[str],
) -> bool:

    return (
        180 <= len(summary) <= 1200
        and len(detailed_description) >= 500
        and bool(skills)
    )


async def process_one(
    supabase,
    job: dict[str, Any],
    source: str = "adzuna",
    application_job_id: str | None = None,
):
    raw_id = job["id"]

    generated = generate_content(job)

    summary = clean_text(
        generated.get("summary")
    )

    detailed_description = clean_text(
        generated.get("detailed_description")
    )

    skills = normalize_skills(
        generated.get("skills")
    )

    meta_title = clean_text(
        generated.get("meta_title")
    )[:60].strip()

    meta_description = clean_text(
        generated.get("meta_description")
    )[:160].strip()

    seo_keywords = normalize_skills(
        generated.get("seo_keywords")
    )

    responsibilities = normalize_points(
        generated.get("responsibilities")
    )

    requirements = normalize_points(
        generated.get("requirements")
    )

    additional_information = normalize_points(
        generated.get("additional_information")
    )

    quality_score = clamp_score(
        generated.get("quality_score")
    )

    originality_score = clamp_score(
        generated.get("originality_score")
    )

    seo_score = clamp_score(
        generated.get("seo_score")
    )

    content_value_score = clamp_score(
        generated.get("content_value_score")
    )

    source_coverage_score = clamp_score(
        generated.get("source_coverage_score")
    )

    policy_safety_score = clamp_score(
        generated.get("policy_safety_score")
    )

    usable = (
        content_is_usable(
            summary,
            detailed_description,
            skills,
        )
        and bool(meta_title)
        and bool(meta_description)
        and bool(seo_keywords)
    )

    adsense_score = calculate_internal_adsense_score(
        quality_score,
        originality_score,
        seo_score,
        content_value_score,
        source_coverage_score,
        policy_safety_score,
        summary,
        detailed_description,
        skills,
    )

    # Strict internal target requested by project.
    # This does NOT represent Google's actual approval decision.
    eligible = (
        usable
        and quality_score >= 90
        and originality_score >= 90
        and seo_score >= 90
        and content_value_score >= 90
        and source_coverage_score >= 90
        and policy_safety_score >= 90
        and adsense_score >= 90
    )

    quality_status = (
        "approved"
        if eligible
        else "needs_review"
    )

    ad_eligibility_status = (
        "eligible"
        if eligible
        else "needs_review"
    )

    processed_at = datetime.now(
        timezone.utc
    ).isoformat()

    public_slug = make_public_slug(
        clean_text(job.get("title")) or "Untitled Job",
        raw_id,
    )

    row = {        "raw_job_id": raw_id,
        "public_slug": public_slug,
        "title": clean_text(job.get("title")) or "Untitled Job",
        "summary": summary,
        "detailed_description": detailed_description,
        "skills": skills,
        "responsibilities": responsibilities,
        "requirements": requirements,
        "additional_information": additional_information,
        "meta_title": meta_title,
        "meta_description": meta_description,
        "seo_keywords": seo_keywords,
        "application_job_id": application_job_id,
        "company_name": clean_text(job.get("company_name")),
        "category_label": clean_text(job.get("category_label")),
        "category_tag": clean_text(job.get("category_tag")),
        "location_display": clean_text(job.get("location_display")),
        "salary_min": job.get("salary_min"),
        "salary_max": job.get("salary_max"),
        "salary_is_predicted": job.get("salary_is_predicted"),
        "contract_type": job.get("contract_type"),
        "contract_time": job.get("contract_time"),
        "latitude": job.get("latitude"),
        "longitude": job.get("longitude"),
        "source": source,
        "redirect_url": clean_text(job.get("redirect_url")),
        "source_description": clean_text(job.get("description")),
        "quality_status": quality_status,
        "quality_score": quality_score,
        "originality_score": originality_score,
        "seo_score": seo_score,
        "adsense_score": adsense_score,
        "content_value_score": content_value_score,
        "source_coverage_score": source_coverage_score,
        "policy_safety_score": policy_safety_score,
        "manual_review_required": True,
        "ad_eligibility_status": ad_eligibility_status,
        "processed_at": processed_at,
    }

    # Important:
    # preserve current publication state when reprocessing.
    existing = (
        supabase
        .table("job_content")
        .select("publication_status,published_at,reviewed_at,reviewed_by,review_notes")
        .eq("raw_job_id", raw_id)
        .limit(1)
        .execute()
    )

    if existing.data:
        old = existing.data[0]

        row["publication_status"] = old.get(
            "publication_status",
            "draft",
        )

        row["published_at"] = old.get(
            "published_at"
        )

        row["reviewed_at"] = old.get(
            "reviewed_at"
        )

        row["reviewed_by"] = old.get(
            "reviewed_by"
        )

        row["review_notes"] = old.get(
            "review_notes"
        )

    (
        supabase
        .table("job_content")
        .upsert(
            row,
            on_conflict="raw_job_id",
        )
        .execute()
    )

    if source == "adzuna":
        next_raw_status = (
            "processed"
            if quality_status == "approved"
            else "needs_review"
        )

        (
            supabase
            .table("adzuna_raw_jobs")
            .update(
                {
                    "processing_status": next_raw_status,
                    "processing_error": None,
                    "updated_at": processed_at,
                }
            )
            .eq("id", raw_id)
            .execute()
        )

    return {
        "id": raw_id,
        "title": job.get("title"),
        "status": quality_status,
        "adsense_score": adsense_score,
        "quality_score": quality_score,
        "originality_score": originality_score,
        "seo_score": seo_score,
        "content_value_score": content_value_score,
        "source_coverage_score": source_coverage_score,
        "policy_safety_score": policy_safety_score,
        "detailed_description_chars": len(detailed_description),
    }


@router.get("/status")
async def processing_status():
    try:
        supabase = get_supabase()

        result = {}

        for key, value in {
            "pending": "pending",
            "processed": "processed",
            "needs_review": "needs_review",
            "error": "error",
        }.items():

            response = (
                supabase
                .table("adzuna_raw_jobs")
                .select("id", count="exact")
                .eq("processing_status", value)
                .execute()
            )

            result[key] = response.count or 0

        return {
            "status": "ok",
            **result,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/config")
async def processing_config():
    try:
        _, model = get_gemini()

        return {
            "status": "ok",
            "provider": "Google Gemini",
            "model": model,
            "batch_limit_max": 20,
            "summary_max_chars": 1200,
            "detailed_description": True,
            "minimum_detailed_chars": 500,
            "internal_target": 90,
            "manual_review": True,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.post("/manual-job/{job_id}")
async def process_manual_job(job_id: str):
    try:
        supabase = get_supabase()

        response = (
            supabase
            .table("jobs")
            .select("*")
            .eq("id", job_id)
            .maybe_single()
            .execute()
        )

        job = response.data

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found.",
            )

        company_name = ""

        company_id = job.get("company_id")

        if company_id:
            company_response = (
                supabase
                .table("companies")
                .select("name")
                .eq("id", company_id)
                .maybe_single()
                .execute()
            )

            if company_response.data:
                company_name = clean_text(
                    company_response.data.get("name")
                )

        manual_job = {
            "id": job["id"],
            "title": clean_text(job.get("title")),
            "description": clean_text(job.get("description")),
            "company_name": company_name,
            "category_label": "",
            "category_tag": "",
            "location_display": clean_text(job.get("city")),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "salary_is_predicted": False,
            "contract_type": clean_text(job.get("employment_type")),
            "contract_time": "",
            "latitude": None,
            "longitude": None,
            "redirect_url": clean_text(job.get("apply_url")),
        }

        result = await process_one(
            supabase,
            manual_job,
            source="manual",
            application_job_id=job["id"],
        )

        content_response = (
            supabase
            .table("job_content")
            .select("*")
            .eq("raw_job_id", job["id"])
            .maybe_single()
            .execute()
        )

        job_content = content_response.data

        if not job_content:
            raise RuntimeError(
                "Manual job processing completed without creating job_content."
            )

        (
            supabase
            .table("jobs")
            .update(
                {
                    "summary": job_content.get("summary"),
                    "skills": job_content.get("skills") or [],
                    "responsibilities": job_content.get("responsibilities") or [],
                    "requirements": job_content.get("requirements") or [],
                    "additional_information": job_content.get("additional_information") or [],
                    "meta_title": job_content.get("meta_title"),
                    "meta_description": job_content.get("meta_description"),
                    "seo_keywords": job_content.get("seo_keywords") or [],
                    "quality_score": job_content.get("quality_score"),
                    "originality_score": job_content.get("originality_score"),
                    "seo_score": job_content.get("seo_score"),
                    "content_value_score": job_content.get("content_value_score"),
                    "source_coverage_score": job_content.get("source_coverage_score"),
                    "policy_safety_score": job_content.get("policy_safety_score"),
                    "ai_processing_status": result["status"],
                    "ai_processed_at": job_content.get("processed_at"),
                    "updated_at": job_content.get("processed_at"),
                }
            )
            .eq("id", job["id"])
            .execute()
        )

        return {
            "status": "ok",
            "job_content": job_content,
            "processing": result,
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

@router.post("/process")
async def process_pending_jobs(
    limit: int = Query(default=1, ge=1, le=20),
):
    try:
        supabase = get_supabase()

        response = (
            supabase
            .table("adzuna_raw_jobs")
            .select("*")
            .eq("processing_status", "pending")
            .order("created_at", desc=False)
            .range(0, limit - 1)
            .execute()
        )

        jobs = response.data or []
        results = []

        for job in jobs:
            try:
                results.append(
                    await process_one(supabase, job)
                )
            except Exception as exc:
                error_text = str(exc)[:2000]

                (
                    supabase
                    .table("adzuna_raw_jobs")
                    .update(
                        {
                            "processing_status": "error",
                            "processing_error": error_text,
                        }
                    )
                    .eq("id", job["id"])
                    .execute()
                )

                results.append({
                    "id": job["id"],
                    "title": job.get("title"),
                    "status": "error",
                    "error": error_text,
                })

        return {
            "status": "ok",
            "requested": limit,
            "received": len(jobs),
            "approved": sum(
                1 for item in results
                if item["status"] == "approved"
            ),
            "needs_review": sum(
                1 for item in results
                if item["status"] == "needs_review"
            ),
            "failed": sum(
                1 for item in results
                if item["status"] == "error"
            ),
            "results": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.post("/reprocess")
async def reprocess_existing_jobs(
    limit: int = Query(default=5, ge=1, le=20),
    offset: int = Query(default=0, ge=0),
):
    try:
        supabase = get_supabase()

        response = (
            supabase
            .table("adzuna_raw_jobs")
            .select("*")
            .order("created_at", desc=False)
            .range(offset, offset + limit - 1)
            .execute()
        )

        jobs = response.data or []
        results = []

        for job in jobs:
            try:
                results.append(
                    await process_one(supabase, job)
                )
            except Exception as exc:
                results.append({
                    "id": job["id"],
                    "title": job.get("title"),
                    "status": "error",
                    "error": str(exc)[:2000],
                })

        return {
            "status": "ok",
            "requested": limit,
            "received": len(jobs),
            "approved": sum(
                1 for item in results
                if item["status"] == "approved"
            ),
            "needs_review": sum(
                1 for item in results
                if item["status"] == "needs_review"
            ),
            "failed": sum(
                1 for item in results
                if item["status"] == "error"
            ),
            "results": results,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )








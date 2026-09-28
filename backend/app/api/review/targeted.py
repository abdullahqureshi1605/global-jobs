from __future__ import annotations

import json
import os
import re
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from google import genai
from google.genai import types

# IMPORTANT:
# Reuse the existing working Supabase helper from route.py.
from app.api.review.route import get_supabase


router = APIRouter()


# ============================================================
# REQUEST MODELS
# ============================================================

class TargetedReviewRequest(BaseModel):
    title: str = ""

    summary: str = ""

    detailed_description: str = ""

    skills: list[str] = Field(
        default_factory=list
    )

    quality_score: int = 0

    originality_score: int = 0

    seo_score: int = 0

    content_value_score: int = 0

    source_coverage_score: int = 0

    policy_safety_score: int = 0

    source_description: str = ""


class TargetedRecheckRequest(BaseModel):
    summary: str = ""

    detailed_description: str = ""

    skills: list[str] = Field(
        default_factory=list
    )


# ============================================================
# GEMINI
# ============================================================

def gemini_client():
    """
    Use the same process environment as the rest of the
    Horizon Jobs backend.

    No separate dotenv loading is required here because the
    backend is already started with the configured environment.
    """

    api_key = os.getenv(
        "GEMINI_API_KEY"
    )

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail=(
                "GEMINI_API_KEY is not available "
                "to the running backend."
            ),
        )

    return genai.Client(
        api_key=api_key
    )


# ============================================================
# HELPERS
# ============================================================

def clamp_score(
    value: Any,
) -> int:

    try:
        number = float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):
        return 0

    if 0 <= number <= 10:
        number *= 10

    return max(
        0,
        min(
            100,
            round(number),
        ),
    )


def parse_json(
    text: str,
) -> dict[str, Any]:

    text = (
        text or ""
    ).strip()

    if text.startswith(
        "```"
    ):
        text = re.sub(
            r"^```(?:json)?",
            "",
            text,
        ).strip()

        text = re.sub(
            r"```$",
            "",
            text,
        ).strip()

    try:
        return json.loads(
            text
        )

    except json.JSONDecodeError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "Gemini returned invalid JSON: "
                f"{exc}"
            ),
        )


def find_exact_phrase(
    text: str,
    phrase: str,
) -> str | None:

    if not text or not phrase:
        return None

    # Exact first.
    position = text.find(
        phrase
    )

    if position >= 0:
        return text[
            position:
            position + len(
                phrase
            )
        ]

    # Whitespace-normalized fallback.
    normalized_phrase = re.sub(
        r"\s+",
        " ",
        phrase,
    ).strip()

    if not normalized_phrase:
        return None

    pattern = re.escape(
        normalized_phrase
    )

    pattern = pattern.replace(
        r"\ ",
        r"\s+",
    )

    match = re.search(
        pattern,
        text,
        flags=re.IGNORECASE,
    )

    if match:
        return text[
            match.start():
            match.end()
        ]

    return None


def scores_from_payload(
    payload: TargetedReviewRequest,
) -> dict[str, int]:

    return {
        "quality_score":
            clamp_score(
                payload.quality_score
            ),

        "originality_score":
            clamp_score(
                payload.originality_score
            ),

        "seo_score":
            clamp_score(
                payload.seo_score
            ),

        "content_value_score":
            clamp_score(
                payload.content_value_score
            ),

        "source_coverage_score":
            clamp_score(
                payload.source_coverage_score
            ),

        "policy_safety_score":
            clamp_score(
                payload.policy_safety_score
            ),
    }


def validate_findings(
    raw_findings: Any,
    payload: TargetedReviewRequest,
) -> list[dict[str, Any]]:

    scores = scores_from_payload(
        payload
    )

    weak_dimensions = {
        key
        for key, value in scores.items()
        if value < 90
    }

    content_fields = {
        "summary":
            payload.summary,

        "detailed_description":
            payload.detailed_description,

        "skills":
            "\n".join(
                payload.skills
            ),
    }

    findings: list[
        dict[str, Any]
    ] = []

    if not isinstance(
        raw_findings,
        list,
    ):
        return findings

    for item in raw_findings:

        if not isinstance(
            item,
            dict,
        ):
            continue

        score_name = str(
            item.get(
                "score_name",
                "",
            )
        ).strip()

        field = str(
            item.get(
                "field",
                "",
            )
        ).strip()

        phrase = str(
            item.get(
                "phrase",
                "",
            )
        ).strip()

        if (
            score_name
            not in weak_dimensions
        ):
            continue

        if field not in content_fields:
            continue

        exact = find_exact_phrase(
            content_fields[field],
            phrase,
        )

        if not exact:
            continue

        findings.append(
            {
                "id":
                    f"{score_name}-{len(findings)}",

                "score_name":
                    score_name,

                "score":
                    scores[
                        score_name
                    ],

                "field":
                    field,

                "phrase":
                    exact,

                "problem":
                    str(
                        item.get(
                            "problem",
                            "",
                        )
                    ).strip(),

                "suggested_replacement":
                    str(
                        item.get(
                            "suggested_replacement",
                            "",
                        )
                    ).strip(),
            }
        )

        if len(findings) >= 8:
            break

    return findings


# ============================================================
# TARGETED ANALYSIS
# ============================================================

@router.post(
    "/targeted-analysis"
)
async def targeted_analysis(
    payload: TargetedReviewRequest,
):

    scores = scores_from_payload(
        payload
    )

    weak_scores = {
        key: value
        for key, value in scores.items()
        if value < 90
    }

    if not weak_scores:

        return {
            "status": "ok",
            "scores": scores,
            "weak_scores": {},
            "findings": [],
            "message":
                "All six scores are already at least 90.",
        }

    client = gemini_client()

    prompt = f"""
You are the senior editorial reviewer for a real job website.

THIS IS TARGETED HUMAN REVIEW.

Do NOT rewrite the entire job.

Find ONLY the smallest exact pieces of the current content
that are responsible for scores below 90.

JOB TITLE:
{payload.title}

SUMMARY:
{payload.summary}

DETAILED DESCRIPTION:
{payload.detailed_description}

SKILLS:
{json.dumps(payload.skills, ensure_ascii=False)}

ORIGINAL SOURCE:
{payload.source_description}

CURRENT SCORES:
{json.dumps(scores)}

WEAK DIMENSIONS:
{json.dumps(weak_scores)}

Rules:

1. Work only on weak dimensions.
2. Return at most two findings per weak dimension.
3. phrase MUST exist in the current content.
4. Copy the phrase exactly.
5. Prefer a short phrase or one complete sentence.
6. Never rewrite good content.
7. Never invent employment facts.
8. Never invent salary.
9. Never invent benefits.
10. Never invent qualifications.
11. Never invent duties.
12. Never invent work hours.
13. Never invent location.
14. Never invent sponsorship.
15. Source coverage improvements may use ONLY supplied source facts.
16. SEO improvements must be natural.
17. Do not keyword stuff.
18. Content value improvements must improve usefulness, not add fluff.
19. Originality issues should target repetitive/template wording.
20. Policy issues should target misleading or unsafe wording.
21. suggested_replacement must replace ONLY phrase.
22. Never mention AI.
23. Never mention Adzuna.
24. Never claim Google or AdSense approval.

Return JSON only:

{{
  "findings": [
    {{
      "score_name": "seo_score",
      "field": "detailed_description",
      "phrase": "EXACT CURRENT TEXT",
      "problem": "Specific reason this text weakens the score.",
      "suggested_replacement": "Focused supported replacement."
    }}
  ]
}}
"""

    try:

        response = client.models.generate_content(
            model=os.getenv(
                "GEMINI_MODEL",
                "gemini-2.5-flash",
            ),
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
                max_output_tokens=3000,
            ),
        )

        data = parse_json(
            response.text or "{}"
        )

        findings = validate_findings(
            data.get(
                "findings",
                [],
            ),
            payload,
        )

        return {
            "status": "ok",
            "scores": scores,
            "weak_scores": weak_scores,
            "findings": findings,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "Targeted Gemini analysis failed: "
                f"{exc}"
            ),
        )


# ============================================================
# TARGETED EDIT + RESCORE
# ============================================================

@router.patch(
    "/{job_id}/targeted-recheck"
)
async def targeted_recheck(
    job_id: str,
    payload: TargetedRecheckRequest,
):

    # Reuse the same Supabase client that powers all existing
    # review endpoints.
    supabase = get_supabase()

    gemini = gemini_client()

    existing = (
        supabase
        .table("job_content")
        .select("*")
        .eq(
            "id",
            job_id,
        )
        .limit(1)
        .execute()
    )

    if not existing.data:

        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    job = existing.data[0]

    raw_job = {}

    raw_job_id = job.get(
        "raw_job_id"
    )

    if raw_job_id:

        raw_result = (
            supabase
            .table("adzuna_raw_jobs")
            .select("*")
            .eq(
                "id",
                raw_job_id,
            )
            .limit(1)
            .execute()
        )

        if raw_result.data:
            raw_job = (
                raw_result.data[0]
            )

    title = (
        job.get("title")
        or raw_job.get("title")
        or ""
    )

    source_description = (
        raw_job.get("description")
        or job.get(
            "source_description"
        )
        or ""
    )

    prompt = f"""
You are the final editorial quality evaluator for a real job website.

Evaluate the CURRENT edited content.

Do not rewrite it.

JOB TITLE:
{title}

SUMMARY:
{payload.summary}

DETAILED DESCRIPTION:
{payload.detailed_description}

SKILLS:
{json.dumps(payload.skills, ensure_ascii=False)}

ORIGINAL SOURCE:
{source_description}

Return integer scores from 0 to 100:

quality_score
originality_score
seo_score
content_value_score
source_coverage_score
policy_safety_score

QUALITY:
Accuracy, readability and usefulness.

ORIGINALITY:
Meaningfully original editorial writing.

SEO:
Natural relevance to the actual job.

CONTENT VALUE:
Useful information for the job seeker.

SOURCE COVERAGE:
Supported material employment facts are represented.

POLICY SAFETY:
No fabricated, misleading or unsafe claims.

Do not penalize facts that do not exist in the source.

Then identify exact phrases responsible for any score below 90.

Return JSON only:

{{
  "scores": {{
    "quality_score": 90,
    "originality_score": 90,
    "seo_score": 90,
    "content_value_score": 90,
    "source_coverage_score": 90,
    "policy_safety_score": 90
  }},
  "findings": [
    {{
      "score_name": "seo_score",
      "field": "detailed_description",
      "phrase": "EXACT CURRENT TEXT",
      "problem": "Specific issue.",
      "suggested_replacement": "Focused supported replacement."
    }}
  ]
}}
"""

    try:

        response = gemini.models.generate_content(
            model=os.getenv(
                "GEMINI_MODEL",
                "gemini-2.5-flash",
            ),
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
                max_output_tokens=3500,
            ),
        )

        data = parse_json(
            response.text or "{}"
        )

        raw_scores = data.get(
            "scores",
            {},
        )

        scores = {
            "quality_score":
                clamp_score(
                    raw_scores.get(
                        "quality_score"
                    )
                ),

            "originality_score":
                clamp_score(
                    raw_scores.get(
                        "originality_score"
                    )
                ),

            "seo_score":
                clamp_score(
                    raw_scores.get(
                        "seo_score"
                    )
                ),

            "content_value_score":
                clamp_score(
                    raw_scores.get(
                        "content_value_score"
                    )
                ),

            "source_coverage_score":
                clamp_score(
                    raw_scores.get(
                        "source_coverage_score"
                    )
                ),

            "policy_safety_score":
                clamp_score(
                    raw_scores.get(
                        "policy_safety_score"
                    )
                ),
        }

        all_pass = all(
            value >= 90
            for value in scores.values()
        )

        adsense_score = min(
            scores.values()
        )

        updated = (
            supabase
            .table("job_content")
            .update(
                {
                    "summary":
                        payload.summary,

                    "detailed_description":
                        payload.detailed_description,

                    "skills":
                        payload.skills,

                    "quality_score":
                        scores[
                            "quality_score"
                        ],

                    "originality_score":
                        scores[
                            "originality_score"
                        ],

                    "seo_score":
                        scores[
                            "seo_score"
                        ],

                    "content_value_score":
                        scores[
                            "content_value_score"
                        ],

                    "source_coverage_score":
                        scores[
                            "source_coverage_score"
                        ],

                    "policy_safety_score":
                        scores[
                            "policy_safety_score"
                        ],

                    "adsense_score":
                        adsense_score,

                    "quality_status":
                        (
                            "approved"
                            if all_pass
                            else "needs_review"
                        ),

                    "ad_eligibility_status":
                        (
                            "eligible"
                            if all_pass
                            else "needs_review"
                        ),

                    # Human approval is still required.
                    "manual_review_required":
                        True,

                    # Editing never auto-publishes.
                    "publication_status":
                        "draft",

                    "published_at":
                        None,

                    "reviewed_at":
                        None,

                    "reviewed_by":
                        None,

                    "review_notes":
                        "Targeted human edit saved and rescored.",

                    "processing_error":
                        None,
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
                detail=(
                    "Edited content could not be saved."
                ),
            )

        # Re-localize remaining weak areas.
        findings = []

        weak_scores = {
            key: value
            for key, value in scores.items()
            if value < 90
        }

        if weak_scores:

            localization_prompt = f"""
Identify the exact current text responsible ONLY for these weak scores:

{json.dumps(weak_scores)}

SUMMARY:
{payload.summary}

DETAILED DESCRIPTION:
{payload.detailed_description}

SKILLS:
{json.dumps(payload.skills, ensure_ascii=False)}

SOURCE:
{source_description}

Rules:

- phrase must exist exactly in current content
- field must be summary, detailed_description, or skills
- use the smallest useful phrase
- never invent facts
- never rewrite the entire job

Return JSON only:

{{
  "findings": [
    {{
      "score_name": "seo_score",
      "field": "detailed_description",
      "phrase": "EXACT CURRENT TEXT",
      "problem": "Specific issue.",
      "suggested_replacement": "Focused supported replacement."
    }}
  ]
}}
"""

            localization = (
                gemini.models.generate_content(
                    model=os.getenv(
                        "GEMINI_MODEL",
                        "gemini-2.5-flash",
                    ),
                    contents=localization_prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        response_mime_type="application/json",
                        max_output_tokens=2500,
                    ),
                )
            )

            localization_data = parse_json(
                localization.text or "{}"
            )

            localization_payload = TargetedReviewRequest(
                title=title,

                summary=payload.summary,

                detailed_description=
                    payload.detailed_description,

                skills=payload.skills,

                quality_score=
                    scores[
                        "quality_score"
                    ],

                originality_score=
                    scores[
                        "originality_score"
                    ],

                seo_score=
                    scores[
                        "seo_score"
                    ],

                content_value_score=
                    scores[
                        "content_value_score"
                    ],

                source_coverage_score=
                    scores[
                        "source_coverage_score"
                    ],

                policy_safety_score=
                    scores[
                        "policy_safety_score"
                    ],

                source_description=
                    source_description,
            )

            findings = validate_findings(
                localization_data.get(
                    "findings",
                    [],
                ),
                localization_payload,
            )

        return {
            "status": "ok",
            "job":
                updated.data[0],
            "scores":
                scores,
            "adsense_score":
                adsense_score,
            "quality_status":
                (
                    "approved"
                    if all_pass
                    else "needs_review"
                ),
            "ad_eligibility_status":
                (
                    "eligible"
                    if all_pass
                    else "needs_review"
                ),
            "manual_review_required":
                True,
            "findings":
                findings,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                "Targeted save/recheck failed: "
                f"{exc}"
            ),
        )

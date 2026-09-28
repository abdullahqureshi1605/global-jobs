from typing import Optional

from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    job_id: str
    cover_letter: Optional[str] = Field(
        default=None,
        max_length=10000,
    )
    resume_url: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = Field(
        default=None,
        pattern="^(submitted|reviewing|shortlisted|rejected|hired|withdrawn)$",
    )
    cover_letter: Optional[str] = Field(
        default=None,
        max_length=10000,
    )


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    status: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

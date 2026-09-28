from typing import Optional

from pydantic import BaseModel, Field


class JobDescriptionRequest(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10, max_length=15000)


class JobDescriptionResponse(BaseModel):
    summary: str
    skills: list[str]
    responsibilities: list[str]
    keywords: list[str]


class JobMatchRequest(BaseModel):
    job_description: str = Field(
        min_length=10,
        max_length=15000,
    )
    candidate_profile: str = Field(
        min_length=10,
        max_length=15000,
    )


class JobMatchResponse(BaseModel):
    score: float
    strengths: list[str]
    gaps: list[str]
    recommendation: str


class AITextRequest(BaseModel):
    prompt: str = Field(
        min_length=2,
        max_length=10000,
    )


class AITextResponse(BaseModel):
    text: str

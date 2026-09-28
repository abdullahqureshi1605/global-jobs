from typing import Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    company_id: Optional[str] = None
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    category_id: Optional[str] = None
    country_id: Optional[str] = None
    city: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    apply_url: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, min_length=10)
    category_id: Optional[str] = None
    country_id: Optional[str] = None
    city: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    apply_url: Optional[str] = None
    status: Optional[str] = None


class JobResponse(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    status: str
    source: str

from typing import Optional

from pydantic import BaseModel, Field


class JobAlertCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    keywords: Optional[str] = Field(default=None, max_length=500)
    country_id: Optional[str] = None
    category_id: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    frequency: str = Field(
        default="daily",
        pattern="^(instant|daily|weekly)$",
    )


class JobAlertUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    keywords: Optional[str] = Field(
        default=None,
        max_length=500,
    )
    country_id: Optional[str] = None
    category_id: Optional[str] = None
    work_mode: Optional[str] = None
    employment_type: Optional[str] = None
    frequency: Optional[str] = Field(
        default=None,
        pattern="^(instant|daily|weekly)$",
    )
    is_active: Optional[bool] = None


class NotificationCreate(BaseModel):
    user_id: str
    type: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=2, max_length=255)
    message: str = Field(min_length=2, max_length=5000)
    link: Optional[str] = None

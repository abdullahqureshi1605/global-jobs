from typing import Optional

from pydantic import BaseModel, Field


class CompanyCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str] = Field(default=None, max_length=10000)
    website: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = Field(default=None, max_length=150)
    location: Optional[str] = Field(default=None, max_length=255)


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
    )
    description: Optional[str] = Field(
        default=None,
        max_length=10000,
    )
    website: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = Field(
        default=None,
        max_length=150,
    )
    location: Optional[str] = Field(
        default=None,
        max_length=255,
    )


class CompanyMemberCreate(BaseModel):
    user_id: str
    role: str = Field(
        default="member",
        pattern="^(owner|admin|member)$",
    )

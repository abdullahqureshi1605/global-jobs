from typing import Optional

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    phone: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    headline: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    bio: Optional[str] = Field(
        default=None,
        max_length=5000,
    )

    location: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    avatar_url: Optional[str] = None


class RoleUpdate(BaseModel):
    role: str = Field(
        pattern="^(candidate|employer)$"
    )


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None
    profile: Optional[dict] = None

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class WatchlistCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=100, description="Username atau identifier target di media sosial")
    platform: str = Field(default="x", max_length=20, description="Platform media sosial (x, youtube, instagram, dll.)")
    tag: str = Field(default="suspicious_cib", max_length=50, description="Kategori tagging atau klaster ancaman")
    notes: Optional[str] = Field(default=None, description="Catatan intelijen taktis atau latar belakang target")


class WatchlistResponse(BaseModel):
    id: int
    username: str
    platform: str
    tag: str
    notes: Optional[str] = None
    added_by: Optional[str] = None
    added_at: datetime
    last_checked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

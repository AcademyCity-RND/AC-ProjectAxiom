from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class AuditActionEnum(str, Enum):
    LOGIN = "AUTH_LOGIN"
    LOGOUT = "AUTH_LOGOUT"
    INVESTIGATE_TARGET = "INVESTIGATE_TARGET"
    EXPORT_DOSSIER = "EXPORT_DOSSIER"
    ADD_WATCHLIST = "ADD_WATCHLIST"
    SYSTEM_CONFIG = "SYSTEM_CONFIG"


class AuditLogCreate(BaseModel):
    username: str
    role: str
    action: AuditActionEnum
    target: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "SUCCESS"


class AuditLogOut(AuditLogCreate):
    id: Optional[str] = None

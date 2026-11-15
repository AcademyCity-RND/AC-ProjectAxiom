from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username operator baru")
    password: str = Field(..., min_length=6, max_length=128, description="Kata sandi akun")


class UserStatusUpdateRequest(BaseModel):
    is_active: bool = Field(..., description="Status keaktifan akun pengguna")


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    operator_username: str
    operator_role: Optional[str] = "user"
    action: str
    target: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    total: int
    users: List[UserResponse]


class AuditLogListResponse(BaseModel):
    total: int
    logs: List[AuditLogResponse]

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class UserRole(str, Enum):
    ADMIN = "admin"
    INVESTIGATOR = "investigator"
    ANALYST = "analyst"


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="NRP atau Username Operator")
    password: str = Field(..., min_length=6, max_length=128, description="Kata sandi")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    username: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None


class UserOut(BaseModel):
    username: str
    role: UserRole
    is_active: bool = True

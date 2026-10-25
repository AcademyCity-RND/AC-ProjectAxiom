from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import decode_access_token
from app.schemas.auth import TokenPayload, UserRole

security_scheme = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> TokenPayload:
    """
    Ekstrak dan validasi Bearer Token JWT dari header Authorization.
    Mengembalikan payload token (username, role) jika valid.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token otentikasi tidak valid atau telah kedaluwarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: Optional[str] = payload.get("sub")
    role: Optional[str] = payload.get("role")
    if not username or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payload token tidak lengkap (sub/role hilang).",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return TokenPayload(sub=username, role=role)


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency generator untuk membatasi akses endpoint berdasarkan Role (RBAC).
    """
    def role_checker(current_user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if current_user.role not in [r.value for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Endpoint ini membutuhkan salah satu peran: {[r.value for r in allowed_roles]}",
            )
        return current_user
    return role_checker

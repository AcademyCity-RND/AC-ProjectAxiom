from typing import List, Optional
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.security import decode_access_token
from app.schemas.auth import TokenPayload, UserRole

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    token_query: Optional[str] = Query(None, alias="token")
) -> TokenPayload:
    """
    Ekstrak dan validasi Bearer Token JWT dari header Authorization atau parameter query 'token'.
    Mengembalikan payload token (username, role) jika valid.
    """
    token: Optional[str] = None
    if credentials:
        token = credentials.credentials
    elif token_query:
        token = token_query.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token otentikasi tidak ditemukan. Sertakan header Authorization atau parameter query 'token'.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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

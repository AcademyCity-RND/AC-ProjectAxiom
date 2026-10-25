from fastapi import APIRouter, HTTPException, status, Depends
from app.core.security import verify_password, hash_password, create_access_token
from app.schemas.auth import UserLogin, Token, UserOut, UserRole, TokenPayload
from app.api.v1.deps import get_current_user

router = APIRouter()

# Akun demonstrasi awal (akan disinkronkan ke PostgreSQL users di Milestone 1.2)
DEMO_USERS_DB = {
    "admin": {
        "username": "admin",
        "hashed_password": hash_password("AxiomAdmin2026!"),
        "role": UserRole.ADMIN,
        "is_active": True,
    },
    "user01": {
        "username": "user01",
        "hashed_password": hash_password("AxiomUser2026!"),
        "role": UserRole.USER,
        "is_active": True,
    },
}


@router.post("/login", response_model=Token, summary="Login Pengguna & Penerbitan JWT")
def login(form_data: UserLogin):
    """
    Otentikasi login pengguna (admin atau user biasa) dan mengembalikan JWT Access Token.
    """
    user = DEMO_USERS_DB.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kredensial login tidak valid. Periksa username dan password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun pengguna ini dinonaktifkan.",
        )

    access_token = create_access_token(
        subject=user["username"],
        role=user["role"].value,
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user["role"],
        username=user["username"],
    )


@router.get("/me", response_model=UserOut, summary="Profil Pengguna Aktif")
def get_current_user_profile(current_user: TokenPayload = Depends(get_current_user)):
    """
    Mendapatkan data identitas dan role pengguna yang sedang login.
    """
    return UserOut(
        username=current_user.sub or "",
        role=UserRole(current_user.role) if current_user.role else UserRole.USER,
        is_active=True,
    )

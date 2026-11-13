from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, hash_password, create_access_token
from app.schemas.auth import UserLogin, Token, UserOut, UserRole, TokenPayload
from app.api.v1.deps import get_current_user

router = APIRouter()


def ensure_default_users_seeded(db: Session):
    """
    Memastikan tabel terinisialisasi dan tepat 2 akun default ('admin' dan 'analis') terdaftar di PostgreSQL.
    """
    from app.db.base import Base
    from app.db.session import engine
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass

    admin_user = db.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
    if not admin_user:
        admin_user = User(
            username="admin",
            hashed_password=hash_password("AxiomAdmin2026!"),
            role="admin",
            is_active=True,
        )
        db.add(admin_user)

    analis_acc = db.execute(select(User).where(User.username == "analis")).scalar_one_or_none()
    if not analis_acc:
        analis_acc = User(
            username="analis",
            hashed_password=hash_password("AxiomUser2026!"),
            role="user",
            is_active=True,
        )
        db.add(analis_acc)

    db.commit()


@router.post("/login", response_model=Token, summary="Login Pengguna & Penerbitan JWT")
def login(form_data: UserLogin, db: Session = Depends(get_db)):
    """
    Otentikasi login pengguna (admin atau analis) dan mengembalikan JWT Access Token.
    Memeriksa kredensial terhadap tabel 'users' di basis data PostgreSQL.
    """
    clean_username = form_data.username.strip().lower()
    
    # Ambil user dari PostgreSQL dengan fallback bootstrap jika tabel belum ada
    try:
        user = db.execute(select(User).where(User.username == clean_username)).scalar_one_or_none()
    except Exception:
        db.rollback()
        ensure_default_users_seeded(db)
        user = db.execute(select(User).where(User.username == clean_username)).scalar_one_or_none()

    # Fallback bootstrap jika akun default belum tersimpan di DB
    if not user and clean_username in ("admin", "analis"):
        ensure_default_users_seeded(db)
        user = db.execute(select(User).where(User.username == clean_username)).scalar_one_or_none()
    elif not user and clean_username in ("user", "user01", "operator", "analisis_siber"):
        # Alias ramah untuk pengguna yang mengetik 'user' atau 'analisis_siber'
        user = db.execute(select(User).where(User.username == "analis")).scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kredensial login tidak valid. Periksa username dan password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun pengguna ini telah dinonaktifkan oleh Administrator.",
        )

    access_token = create_access_token(
        subject=user.username,
        role=user.role,
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        role=UserRole(user.role),
        username=user.username,
    )


@router.get("/me", response_model=UserOut, summary="Profil Pengguna Aktif")
def get_current_user_profile(
    current_user: TokenPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mendapatkan data identitas, peran (role), dan status aktif pengguna yang sedang login.
    """
    username = current_user.sub or ""
    user = db.execute(select(User).where(User.username == username.lower())).scalar_one_or_none()
    
    is_active = user.is_active if user else True
    role = UserRole(user.role) if user and user.role in (r.value for r in UserRole) else (
        UserRole(current_user.role) if current_user.role else UserRole.USER
    )

    return UserOut(
        username=username,
        role=role,
        is_active=is_active,
    )

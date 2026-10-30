from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserRole, TokenPayload
from app.schemas.user_management import (
    UserCreateRequest,
    UserStatusUpdateRequest,
    UserResponse,
    UserListResponse,
)
from app.api.v1.deps import require_roles
from app.core.security import hash_password
from app.services.audit_logger import log_activity

router = APIRouter()


@router.get("", response_model=UserListResponse, summary="Daftar Seluruh Pengguna Sistem (Admin Only)")
def list_users(
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.ADMIN])),
):
    """
    Mengambil seluruh daftar akun operator dan analis terdaftar di database PostgreSQL.
    Hanya dapat diakses oleh Administrator Satgas Inti.
    """
    stmt = select(User).order_by(User.id.asc())
    users = db.execute(stmt).scalars().all()
    return UserListResponse(total=len(users), users=users)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Tambah Akun User Baru (Admin Only)")
def create_user(
    payload: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.ADMIN])),
):
    """
    Membuat akun analis/operator baru di sistem.
    KEBIJAKAN KEAMANAN: Role secara otomatis dikunci ke 'user'.
    Administrator tidak dapat memberikan wewenang admin dari antarmuka ini.
    """
    clean_username = payload.username.strip().lower()
    if clean_username in ("admin", "administrator"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username 'admin' dilindungi dan tidak dapat digunakan kembali.",
        )

    # Cek apakah username sudah ada
    existing = db.execute(select(User).where(User.username == clean_username)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{clean_username}' sudah terdaftar di basis data.",
        )

    new_user = User(
        username=clean_username,
        hashed_password=hash_password(payload.password),
        role="user",  # Strict enforcement: always 'user'
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Catat audit log atas mutasi pengguna
    log_activity(
        db=db,
        username=current_user.sub or "admin",
        role=current_user.role or "admin",
        action="USER_CREATED",
        target=new_user.username,
        details={"assigned_role": "user", "user_id": new_user.id},
    )

    return new_user


@router.patch("/{user_id}/status", response_model=UserResponse, summary="Ubah Status Keaktifan Akun (Admin Only)")
def toggle_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.ADMIN])),
):
    """
    Mengaktifkan atau menonaktifkan akun operator.
    Akun administrator utama tidak dapat dinonaktifkan.
    """
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    if user.role == "admin" or user.username == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Status akun Administrator Utama dilindungi sistem dan tidak dapat dinonaktifkan.",
        )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    action_name = "USER_ACTIVATED" if user.is_active else "USER_DEACTIVATED"
    log_activity(
        db=db,
        username=current_user.sub or "admin",
        role=current_user.role or "admin",
        action=action_name,
        target=user.username,
        details={"new_active_status": user.is_active, "user_id": user.id},
    )

    return user


@router.delete("/{user_id}", status_code=status.HTTP_200_OK, summary="Hapus Akun Pengguna (Admin Only)")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.ADMIN])),
):
    """
    Menghapus akun pengguna dari database.
    Akun administrator tidak dapat dihapus.
    """
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    if user.role == "admin" or user.username == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun Administrator Utama tidak dapat dihapus dari sistem.",
        )

    deleted_username = user.username
    db.delete(user)
    db.commit()

    log_activity(
        db=db,
        username=current_user.sub or "admin",
        role=current_user.role or "admin",
        action="USER_DELETED",
        target=deleted_username,
        details={"deleted_user_id": user_id},
    )

    return {"status": "success", "message": f"Akun pengguna '{deleted_username}' berhasil dihapus."}

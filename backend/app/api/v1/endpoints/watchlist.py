import logging
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.watchlist import Watchlist
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse
from app.schemas.auth import TokenPayload, UserRole
from app.schemas.audit import AuditLogCreate, AuditActionEnum
from app.api.v1.deps import require_roles

logger = logging.getLogger("axiom.watchlist")
router = APIRouter()


@router.get("", response_model=List[WatchlistResponse], summary="Daftar Target dalam Pantauan Khusus")
def get_watchlist(
    limit: int = 50,
    offset: int = 0,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
):
    """
    Mengambil daftar seluruh target / aktor ancaman yang dimasukkan ke dalam daftar pantauan (Watchlist).
    """
    query = db.query(Watchlist)
    if tag:
        query = query.filter(Watchlist.tag == tag)
    
    items = query.order_by(desc(Watchlist.added_at)).offset(offset).limit(limit).all()
    return items


@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED, summary="Tambahkan Target ke Watchlist")
def add_to_watchlist(
    payload: WatchlistCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
):
    """
    Mendaftarkan akun / target baru ke dalam Watchlist untuk pengawasan intelijen persisten.
    """
    normalized_username = payload.username.strip()
    if normalized_username.startswith("@"):
        pass
    else:
        normalized_username = f"@{normalized_username}"

    # Cek apakah sudah terdaftar sebelumnya
    existing = db.query(Watchlist).filter(
        Watchlist.username.ilike(normalized_username),
        Watchlist.platform == payload.platform.lower()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Target {normalized_username} sudah ada di dalam Watchlist."
        )

    new_item = Watchlist(
        username=normalized_username,
        platform=payload.platform.lower(),
        tag=payload.tag,
        notes=payload.notes,
        added_by=current_user.sub or "unknown",
        added_at=datetime.now(timezone.utc)
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    # Catat Audit Log
    client_ip = request.client.host if request.client else "unknown"
    audit_entry = AuditLogCreate(
        username=current_user.sub or "anonymous",
        role=current_user.role or "unknown",
        action=AuditActionEnum.ADD_WATCHLIST,
        target=f"{new_item.platform}:{new_item.username}",
        ip_address=client_ip,
        details={
            "tag": new_item.tag,
            "notes": new_item.notes,
        },
        timestamp=datetime.now(timezone.utc),
        status="SUCCESS",
    )
    logger.info(f"AUDIT_LOG_EVENT: {audit_entry.model_dump_json()}")

    return new_item


@router.delete("/{watchlist_id}", summary="Hapus Target dari Watchlist")
def delete_from_watchlist(
    watchlist_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN]))
):
    """
    Menghapus target dari daftar pantauan (Watchlist).
    """
    item = db.query(Watchlist).filter(Watchlist.id == watchlist_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item Watchlist dengan ID {watchlist_id} tidak ditemukan."
        )

    deleted_target = f"{item.platform}:{item.username}"
    db.delete(item)
    db.commit()

    # Catat Audit Log
    client_ip = request.client.host if request.client else "unknown"
    audit_entry = AuditLogCreate(
        username=current_user.sub or "anonymous",
        role=current_user.role or "unknown",
        action=AuditActionEnum.ADD_WATCHLIST,  # Menggunakan category watchlist audit
        target=deleted_target,
        ip_address=client_ip,
        details={"action": "DELETED_FROM_WATCHLIST", "id": watchlist_id},
        timestamp=datetime.now(timezone.utc),
        status="SUCCESS",
    )
    logger.info(f"AUDIT_LOG_EVENT: {audit_entry.model_dump_json()}")

    return {"status": "success", "message": f"Target {deleted_target} berhasil dihapus dari Watchlist."}

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func
from app.db.session import get_db
from app.models.audit import AuditLog
from app.schemas.auth import UserRole, TokenPayload
from app.schemas.user_management import AuditLogListResponse, AuditLogResponse
from app.api.v1.deps import require_roles

router = APIRouter()


@router.get("/logs", response_model=AuditLogListResponse, summary="Jejak Audit Aktivitas & Pelacakan Dokumen (Admin Only)")
def list_audit_logs(
    operator: Optional[str] = Query(None, description="Filter username operator tertentu"),
    action: Optional[str] = Query(None, description="Filter kategori aksi (misal SCRAPE_INVESTIGATION, DOWNLOAD_DOCUMENT)"),
    search: Optional[str] = Query(None, description="Pencarian kata kunci pada target atau detail"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN])),
):
    """
    Mengambil jejak audit aktivitas seluruh operator (admin dan user).
    Mencakup data input penarikan data (scrapping target/link) dan jejak riwayat
    pengunduhan dokumen resmi (PDF/CSV) lengkap dengan Case ID dan SHA-256 Evidence Hash
    untuk mendeteksi dan melacak potensi kebocoran data intelijen.
    """
    stmt = select(AuditLog)

    # Pemisahan jejak log: user biasa hanya mengakses log miliknya sendiri, admin mengakses seluruh log
    if current_user.role != UserRole.ADMIN.value:
        stmt = stmt.where(AuditLog.operator_username == current_user.sub)
    elif operator and operator.strip():
        stmt = stmt.where(AuditLog.operator_username == operator.strip())

    if action and action.strip():
        stmt = stmt.where(AuditLog.action == action.strip())

    if search and search.strip():
        s = f"%{search.strip()}%"
        stmt = stmt.where((AuditLog.target.ilike(s)) | (AuditLog.operator_username.ilike(s)))

    # Count total matching
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar_one()

    # Apply pagination and sorting (newest first)
    paginated_stmt = stmt.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit)
    logs = db.execute(paginated_stmt).scalars().all()

    return AuditLogListResponse(total=total, logs=logs)


@router.get("/summary", summary="Ringkasan Statistik Aktivitas Operasional (Admin Only)")
def get_audit_summary(
    db: Session = Depends(get_db),
    current_user: TokenPayload = Depends(require_roles([UserRole.USER, UserRole.ADMIN])),
):
    """
    Statistik agregat aktivitas untuk dasbor pengawasan intelijen.
    """
    is_admin = current_user.role == UserRole.ADMIN.value

    if is_admin:
        total_logs = db.execute(select(func.count(AuditLog.id))).scalar_one()
        total_scrapes = db.execute(
            select(func.count(AuditLog.id)).where(AuditLog.action.ilike("%SCRAPE%"))
        ).scalar_one()
        total_downloads = db.execute(
            select(func.count(AuditLog.id)).where(AuditLog.action.ilike("%DOWNLOAD%"))
        ).scalar_one()
    else:
        user_cond = AuditLog.operator_username == current_user.sub
        total_logs = db.execute(select(func.count(AuditLog.id)).where(user_cond)).scalar_one()
        total_scrapes = db.execute(
            select(func.count(AuditLog.id)).where(user_cond, AuditLog.action.ilike("%SCRAPE%"))
        ).scalar_one()
        total_downloads = db.execute(
            select(func.count(AuditLog.id)).where(user_cond, AuditLog.action.ilike("%DOWNLOAD%"))
        ).scalar_one()

    return {
        "total_activities": total_logs,
        "total_scraping_operations": total_scrapes,
        "total_document_downloads": total_downloads,
    }

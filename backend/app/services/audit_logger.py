from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from loguru import logger
from app.models.audit import AuditLog


def log_activity(
    db: Session,
    username: str,
    role: str,
    action: str,
    target: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    status: str = "SUCCESS",
) -> Optional[AuditLog]:
    """
    Mencatat jejak audit (Audit Trail) atas setiap aktivitas operasional pengguna ke basis data PostgreSQL.
    Digunakan untuk forensik akuntabilitas, pelacakan dokumen (leak tracing), dan pemantauan intelijen.
    """
    try:
        log_entry = AuditLog(
            operator_username=username or "anonymous",
            operator_role=role or "user",
            action=action,
            target=target,
            ip_address=ip_address or "127.0.0.1",
            details=details or {},
            status=status,
            timestamp=datetime.now(timezone.utc),
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        logger.error(f"[AuditLogger] Gagal menyimpan log audit untuk {username} ({action}): {e}")
        db.rollback()
        return None

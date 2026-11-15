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
    raise_on_failure: bool = False,
) -> Optional[AuditLog]:
    """
    Mencatat jejak audit (Audit Trail) atas setiap aktivitas operasional pengguna ke basis data PostgreSQL.
    Digunakan untuk forensik akuntabilitas, pelacakan dokumen (leak tracing), dan pemantauan intelijen.
    Dilengkapi persistensi darurat ke file log terstruktur jika database terkendala.
    """
    payload = {
        "operator_username": username or "anonymous",
        "operator_role": role or "user",
        "action": action,
        "target": target,
        "ip_address": ip_address or "127.0.0.1",
        "details": details or {},
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    try:
        log_entry = AuditLog(
            operator_username=payload["operator_username"],
            operator_role=payload["operator_role"],
            action=payload["action"],
            target=payload["target"],
            ip_address=payload["ip_address"],
            details=payload["details"],
            status=payload["status"],
            timestamp=datetime.now(timezone.utc),
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        db.rollback()
        # Fallback Forensik Darurat: Catat ke loguru level CRITICAL agar jejak audit tidak pernah hilang
        logger.critical(f"[AuditLogger:EMERGENCY_FALLBACK] Database audit gagal ({e}). Preserved record: {payload}")
        if raise_on_failure:
            raise RuntimeError(f"Gagal mencatat audit log ke database: {e}") from e
        return None

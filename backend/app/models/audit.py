from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base


class AuditLog(Base):
    """
    Model pencatatan jejak audit (Accounting) atas setiap aktivitas pengguna/operator.
    Menyimpan informasi penarikan target, pengunduhan berkas, dan aktivitas sistem.
    """
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    operator_username: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    operator_role: Mapped[Optional[str]] = mapped_column(String(20), default="user", nullable=True)
    action: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    target: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="SUCCESS", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

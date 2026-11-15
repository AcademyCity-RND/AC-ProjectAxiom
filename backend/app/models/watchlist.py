from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base


class Watchlist(Base):
    """
    Model daftar pantauan khusus (Watchlist) untuk akun-akun aktor ancaman atau buzzer persisten.
    """
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(20), default="x", nullable=False)
    tag: Mapped[str] = mapped_column(String(50), default="suspicious_cib", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    added_by: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

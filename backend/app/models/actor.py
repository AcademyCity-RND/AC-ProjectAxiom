from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base


class ActorProfile(Base):
    """
    Model profil aktor/akun yang dianalisis dalam sebuah kasus investigasi.
    """
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    username: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(20), default="x", nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    followers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    following_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    account_created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    profile_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Relasi
    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="actors")
    activities: Mapped[List["ActivityLog"]] = relationship(
        "ActivityLog",
        back_populates="actor",
        cascade="all, delete-orphan"
    )

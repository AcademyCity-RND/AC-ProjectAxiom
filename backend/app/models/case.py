import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base


class InvestigationCase(Base):
    """
    Model induk untuk kasus investigasi target kognitif.
    Menghubungkan target akun/URL dengan riwayat aktivitas, hasil deteksi, dan kluster.
    """
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    target: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    platform: Mapped[str] = mapped_column(String(20), default="x", nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="queued", index=True, nullable=False)
    max_interactions: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    depth_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_by: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    result_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relasi
    actors: Mapped[List["ActorProfile"]] = relationship(
        "ActorProfile",
        back_populates="case",
        cascade="all, delete-orphan"
    )
    detections: Mapped[List["DetectionResult"]] = relationship(
        "DetectionResult",
        back_populates="case",
        cascade="all, delete-orphan"
    )
    cluster_links: Mapped[List["ClusterLink"]] = relationship(
        "ClusterLink",
        back_populates="case",
        cascade="all, delete-orphan"
    )

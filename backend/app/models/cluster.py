from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base


class ClusterLink(Base):
    """
    Model keterkaitan jejaring akun (Coordinated Inauthentic Behavior / CIB).
    Menghubungkan target dengan simpul-simpul akun lain yang menyebarkan narasi copypasta serupa.
    """
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    source_actor: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    target_actor: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    link_type: Mapped[str] = mapped_column(String(30), default="semantic_copypasta", nullable=False)
    evidence_snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relasi
    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="cluster_links")

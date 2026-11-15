from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base


class DetectionResult(Base):
    """
    Model hasil inferensi AI: Klasifikasi 3-kelas (BOT, BUZZER, HUMAN),
    skor probabilitas, fitur statistik, dan sintesis XAI dari Groq Llama 3.
    """
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("investigation_cases.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    actor_username: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    predicted_class: Mapped[str] = mapped_column(String(20), nullable=False) # BOT, BUZZER, HUMAN
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    class_probabilities: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    extracted_features: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    threat_attribution: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relasi
    case: Mapped["InvestigationCase"] = relationship("InvestigationCase", back_populates="detections")

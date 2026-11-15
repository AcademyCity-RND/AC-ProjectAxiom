from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy import String, Integer, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base


class ActivityLog(Base):
    """
    Model riwayat interaksi cuitan / balasan / komentar dari sebuah akun.
    Data ini menjadi sumber ekstraksi fitur statistik dan embedding semantik ChromaDB.
    """
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    actor_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("actor_profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    platform_post_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    activity_type: Mapped[str] = mapped_column(String(20), default="tweet", nullable=False) # tweet, reply, retweet, comment
    content: Mapped[str] = mapped_column(Text, nullable=False)
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    in_reply_to_user: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    conversation_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True) # likes, retweets, replies count
    embedding_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # ID dokumen di ChromaDB

    # Relasi
    actor: Mapped["ActorProfile"] = relationship("ActorProfile", back_populates="activities")

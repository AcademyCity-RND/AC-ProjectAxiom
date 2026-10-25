from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Engine synchronous untuk interaksi relasional dan Alembic migrations
engine = create_engine(
    settings.SQLALCHEMY_SYNC_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yang menghasilkan session database dan otomatis menutupnya setelah request selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

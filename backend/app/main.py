import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import SessionLocal, engine
from app.db.base import Base

logger = logging.getLogger("axiom.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Pastikan skema tabel database telah terinisialisasi
    try:
        from alembic import command
        from alembic.config import Config
        alembic_ini = os.path.join(os.path.dirname(os.path.dirname(__file__)), "alembic.ini")
        if os.path.exists(alembic_ini):
            alembic_cfg = Config(alembic_ini)
            command.upgrade(alembic_cfg, "head")
            logger.info("Alembic schema successfully upgraded to head.")
        else:
            Base.metadata.create_all(bind=engine)
            logger.info("SQLAlchemy tables created via Base.metadata.create_all.")
    except Exception as e:
        logger.warning(f"Alembic auto-migration skipped/error, falling back to create_all: {e}")
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as err:
            logger.error(f"Failed to create tables via fallback: {err}")

    # 2. Seed akun pengguna default jika belum ada
    try:
        from app.api.v1.endpoints.auth import ensure_default_users_seeded
        db = SessionLocal()
        try:
            ensure_default_users_seeded(db)
        finally:
            db.close()
        logger.info("Default seed users verified.")
    except Exception as e:
        logger.warning(f"Default user seeding skipped or failed: {e}")

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cognitive Domain Threat Intelligence & Inauthentic Behavior Detection Platform",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Hardened CORS: Hanya mengizinkan domain frontend terdaftar (mencegah arbitrary cross-origin requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Mount API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": "Unveiling the Truth in the Cognitive Battlefield.",
        "status": "online",
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}

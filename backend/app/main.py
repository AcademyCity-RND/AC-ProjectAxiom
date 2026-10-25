from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Cognitive Domain Threat Intelligence & Inauthentic Behavior Detection Platform",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
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

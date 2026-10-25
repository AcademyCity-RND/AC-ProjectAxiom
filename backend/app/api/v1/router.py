from fastapi import APIRouter
from app.api.v1.endpoints import auth, investigate

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access Control (AAA)"])
api_router.include_router(investigate.router, prefix="/investigate", tags=["Investigation Core"])

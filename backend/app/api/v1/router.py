from fastapi import APIRouter
from app.api.v1.endpoints import auth, investigate, network, export, watchlist

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Access Control (AAA)"])
api_router.include_router(investigate.router, prefix="/investigate", tags=["Investigation Core"])
api_router.include_router(network.router, prefix="/network", tags=["Network Graph & CIB Analysis"])
api_router.include_router(export.router, prefix="/export", tags=["Report & Forensic Export Engine"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["Watchlist & Persistent Target Tracking"])

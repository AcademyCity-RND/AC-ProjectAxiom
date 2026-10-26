import logging
from typing import Dict, List, Optional, Any

from app.services.scraper.twscrape_adapter import TwscrapeService

logger = logging.getLogger("axiom.scraper.x")


class XScraperService:
    """
    Layanan scraper resmi Axiom untuk platform X (Twitter).
    Didukung oleh engine twscrape dengan strategi keamanan 1 akun burner,
    rate-limit wait 60s, natural delay, dan fallback otomatis ke mock dataset.
    """
    def __init__(self, backend_service: Optional[TwscrapeService] = None):
        self.backend = backend_service or TwscrapeService()

    async def get_user_profile(self, username: str) -> Dict[str, Any]:
        """Menarik profil target ternormalisasi."""
        return await self.backend.get_user_profile(username)

    async def get_user_tweets(self, username: str, count: int = 150) -> List[Dict[str, Any]]:
        """Menarik riwayat cuitan target."""
        return await self.backend.get_user_tweets(username, count=count)

    async def get_user_replies(self, username: str, count: int = 100) -> List[Dict[str, Any]]:
        """Menarik balasan cuitan target (Target Bias audit)."""
        return await self.backend.get_user_replies(username, count=count)

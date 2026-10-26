import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status


class InMemoryRateLimiter:
    """
    In-memory Sliding Window Rate Limiter untuk melindungi backend dan pool scraper
    tanpa dependensi Redis/eksternal. Thread-safe untuk async worker tunggal.
    """

    def __init__(self, requests_per_minute: int = 10, window_seconds: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        # Mapping: client_identifier -> List of request timestamps
        self.history: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_key: str) -> Tuple[bool, int, int]:
        """
        Memeriksa apakah request dari client_key diizinkan.
        
        Returns:
            Tuple[is_allowed: bool, remaining_requests: int, retry_after_seconds: int]
        """
        now = time.time()
        window_start = now - self.window_seconds

        # Bersihkan timestamp di luar window
        valid_timestamps = [ts for ts in self.history[client_key] if ts > window_start]
        self.history[client_key] = valid_timestamps

        count = len(valid_timestamps)
        if count >= self.requests_per_minute:
            # Hitung waktu tunggu hingga request terlama kadaluarsa
            oldest = valid_timestamps[0]
            retry_after = max(1, int(oldest + self.window_seconds - now))
            return False, 0, retry_after

        # Catat request baru
        self.history[client_key].append(now)
        remaining = self.requests_per_minute - (count + 1)
        return True, remaining, 0

    def check(self, request: Request, custom_key: str = None) -> None:
        """
        Helper dependency untuk mengecek rate limit pada FastAPI route.
        Mengangkat HTTPException 429 jika kuota habis.
        """
        # Identifikasi client berdasarkan user sub (jika login) atau client IP
        client_ip = request.client.host if request.client else "127.0.0.1"
        key = custom_key or client_ip

        allowed, remaining, retry_after = self.is_allowed(key)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Terlalu banyak permintaan investigasi. Coba lagi dalam {retry_after} detik.",
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0"
                }
            )


# Default global instance: 10 request per menit
investigation_rate_limiter = InMemoryRateLimiter(requests_per_minute=10, window_seconds=60)

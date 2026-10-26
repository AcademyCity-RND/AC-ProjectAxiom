import json
import logging
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
from twikit import Client
from twikit.errors import TooManyRequests

from app.core.config import settings
from app.services.scraper.exceptions import (
    RateLimitExhaustedException,
    SessionAuthenticationException,
)

logger = logging.getLogger("axiom.scraper.pool")


class PoolAccount:
    """Representasi satu akun bot/crawler di dalam pool sesi."""
    def __init__(self, username: str, email: str, password: str):
        self.username = username
        self.email = email
        self.password = password
        self.client: Optional[Client] = None
        self.rate_limited_until: Optional[datetime] = None
        self.last_used: Optional[datetime] = None
        self.is_authenticated: bool = False

    @property
    def is_available(self) -> bool:
        """Cek apakah akun siap digunakan (tidak sedang dalam masa cooldown rate limit)."""
        if self.rate_limited_until and datetime.now(timezone.utc) < self.rate_limited_until:
            return False
        return True


class TwikitPoolManager:
    """
    Manajer sesi terpadu untuk Twikit.
    Mengelola rotasi multi-akun, persistensi cookie di disk, dan mitigasi error 429 (Rate Limit).
    """
    def __init__(self, pool_config_json: Optional[str] = None, sessions_dir: Optional[str] = None):
        self.sessions_dir = Path(sessions_dir or settings.SESSIONS_DIR)
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
        self.accounts: List[PoolAccount] = []
        self._current_index = 0
        self._load_accounts(pool_config_json or settings.X_ACCOUNTS_POOL)

    def _load_accounts(self, config_str: str) -> None:
        """Parse konfigurasi akun dari format JSON."""
        if not config_str or not config_str.strip():
            logger.info("X_ACCOUNTS_POOL tidak dikonfigurasi. Scraper akan berjalan dalam mode Offline Demo / Mock.")
            return

        try:
            raw_list = json.loads(config_str)
            if isinstance(raw_list, list):
                for item in raw_list:
                    if isinstance(item, dict) and "username" in item and "password" in item:
                        self.accounts.append(
                            PoolAccount(
                                username=item["username"],
                                email=item.get("email", ""),
                                password=item["password"]
                            )
                        )
                logger.info(f"Berhasil memuat {len(self.accounts)} akun scraping pool.")
        except Exception as e:
            logger.warning(f"Gagal mem-parsing X_ACCOUNTS_POOL: {e}. Mengabaikan akun pool.")

    @property
    def is_configured(self) -> bool:
        """Mengembalikan True jika ada minimal 1 akun valid di dalam pool."""
        return len(self.accounts) > 0 and not settings.SCRAPER_OFFLINE_MODE

    def _get_cookie_path(self, username: str) -> Path:
        """Mendapatkan path penyimpanan file cookie per username."""
        return self.sessions_dir / f"cookies_{username}.json"

    async def _authenticate_account(self, account: PoolAccount) -> Client:
        """Memuat cookie yang ada atau melakukan login baru jika cookie belum tersimpan."""
        if account.client and account.is_authenticated:
            return account.client

        client = Client(language="en-US")
        cookie_file = self._get_cookie_path(account.username)

        # Coba muat cookie dari disk
        if cookie_file.exists():
            try:
                client.load_cookies(str(cookie_file))
                account.client = client
                account.is_authenticated = True
                logger.info(f"Sesi cookie untuk @{account.username} berhasil dimuat dari disk.")
                return client
            except Exception as e:
                logger.warning(f"Cookie untuk @{account.username} kadaluarsa/rusak: {e}. Melakukan login ulang...")

        # Login baru menggunakan kredensial
        try:
            await client.login(
                auth_info_1=account.username,
                auth_info_2=account.email if account.email else None,
                password=account.password
            )
            client.save_cookies(str(cookie_file))
            account.client = client
            account.is_authenticated = True
            logger.info(f"Login berhasil untuk akun pool @{account.username}. Cookie disimpan ke {cookie_file}.")
            return client
        except Exception as e:
            logger.error(f"Gagal melakukan login untuk @{account.username}: {e}")
            raise SessionAuthenticationException(account.username, str(e))

    async def get_client(self) -> Client:
        """
        Mengambil satu client Twikit yang aktif dan siap digunakan (Round-Robin).
        Otomatis melewati akun yang sedang terkena cooldown rate-limit.
        """
        if not self.is_configured:
            raise RateLimitExhaustedException("Scraper pool belum dikonfigurasi.")

        total = len(self.accounts)
        now = datetime.now(timezone.utc)

        # Cari akun yang tersedia
        for _ in range(total):
            account = self.accounts[self._current_index]
            self._current_index = (self._current_index + 1) % total

            if account.is_available:
                try:
                    client = await self._authenticate_account(account)
                    account.last_used = now
                    return client
                except Exception as e:
                    logger.warning(f"Melewati akun @{account.username} karena error: {e}")
                    continue

        # Jika seluruh akun pool sedang terkena cooldown
        min_cooldown = min(
            (acc.rate_limited_until for acc in self.accounts if acc.rate_limited_until),
            default=now + timedelta(minutes=15)
        )
        wait_seconds = max(10, int((min_cooldown - now).total_seconds()))
        raise RateLimitExhaustedException(
            f"Seluruh {total} akun scraping pool sedang terkena batasan rate-limit. "
            f"Cooldown aktif sekitar {wait_seconds} detik lagi."
        )

    def mark_rate_limited(self, client: Client, cooldown_seconds: int = 900) -> None:
        """
        Menandai akun yang terikat dengan client tertentu sedang terkena rate-limit (429).
        Masa cooldown default adalah 15 menit (900 detik).
        """
        now = datetime.now(timezone.utc)
        for account in self.accounts:
            if account.client == client:
                account.rate_limited_until = now + timedelta(seconds=cooldown_seconds)
                logger.warning(
                    f"Akun @{account.username} ditandai rate-limited hingga "
                    f"{account.rate_limited_until.strftime('%H:%M:%S UTC')} ({cooldown_seconds}s cooldown)."
                )
                break

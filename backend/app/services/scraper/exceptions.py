class ScraperException(Exception):
    """Base exception untuk seluruh operasi scraper."""
    pass


class TargetNotFoundException(ScraperException):
    """Akun target tidak ditemukan atau tidak eksis di platform."""
    def __init__(self, username: str):
        super().__init__(f"Akun target '@{username}' tidak ditemukan di platform X.")
        self.username = username


class AccountSuspendedException(ScraperException):
    """Akun target telah ditangguhkan (suspended) oleh platform."""
    def __init__(self, username: str):
        super().__init__(f"Akun target '@{username}' telah ditangguhkan (suspended) oleh platform X.")
        self.username = username


class PrivateAccountException(ScraperException):
    """Akun target bersifat privat/terkunci (gembok)."""
    def __init__(self, username: str):
        super().__init__(f"Akun target '@{username}' bersifat privat (gembok) dan tidak dapat diakses secara publik.")
        self.username = username


class RateLimitExhaustedException(ScraperException):
    """Seluruh akun di dalam session pool terkena rate limit."""
    def __init__(self, message: str = "Seluruh akun scraping pool sedang terkena batasan rate-limit. Silakan coba beberapa saat lagi."):
        super().__init__(message)


class SessionAuthenticationException(ScraperException):
    """Gagal melakukan autentikasi login atau memuat session cookie akun pool."""
    def __init__(self, username: str, detail: str = ""):
        super().__init__(f"Gagal memuat sesi atau login untuk akun pool '{username}'. {detail}")
        self.username = username

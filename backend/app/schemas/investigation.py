import re
from enum import Enum
from urllib.parse import urlparse
import ipaddress
from pydantic import BaseModel, Field, field_validator, AliasChoices


class PlatformEnum(str, Enum):
    X = "x"
    YOUTUBE = "youtube"
    INSTAGRAM = "instagram"


class TargetTypeEnum(str, Enum):
    USERNAME = "username"
    URL = "url"


# Whitelist domain publik yang diizinkan untuk crawling / scraping
ALLOWED_DOMAINS = {
    "twitter.com",
    "x.com",
    "youtube.com",
    "youtu.be",
    "instagram.com",
    "www.twitter.com",
    "www.x.com",
    "www.youtube.com",
    "www.instagram.com",
}

# Regex username masing-masing platform
USERNAME_REGEX_MAP = {
    PlatformEnum.X: r"^[A-Za-z0-9_]{1,15}$",
    PlatformEnum.YOUTUBE: r"^[A-Za-z0-9_.\-]{1,60}$",
    PlatformEnum.INSTAGRAM: r"^[A-Za-z0-9_.]{1,30}$",
}


def is_private_or_loopback(host: str) -> bool:
    """Deteksi apakah host merupakan IP privat, loopback, atau localhost (Anti-SSRF)."""
    # Cek string localhost
    if host.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        return True
    
    # Cek apakah host adalah IP Address
    try:
        ip = ipaddress.ip_address(host)
        return (
            ip.is_private or
            ip.is_loopback or
            ip.is_reserved or
            ip.is_link_local or
            ip.is_multicast
        )
    except ValueError:
        # Host adalah nama domain (FQDN), bukan IP literal
        return False


class InvestigationRequest(BaseModel):
    """
    Request model untuk memulai investigasi aktor / target kognitif.
    Dilengkapi validasi ketat regex dan perlindungan Anti-SSRF.
    """
    platform: PlatformEnum = Field(..., description="Platform target (x, youtube, instagram)")
    target: str = Field(..., min_length=1, max_length=255, description="Username target (@handle) atau URL publik")
    max_interactions: int = Field(default=200, ge=10, le=500, description="Batas penarikan riwayat cuitan/komentar (10 - 500)")
    depth_level: int = Field(default=1, ge=1, le=3, description="Kedalaman pemetaan jejaring kluster (1 = Target saja, 2 = Balasan langsung, 3 = Kluster CIB)")

    @field_validator("target")
    @classmethod
    def validate_and_sanitize_target(cls, v: str, info) -> str:
        cleaned = v.strip()
        
        # Cegah injeksi karakter kontrol, null bytes, dan newlines
        if any(c in cleaned for c in ["\x00", "\r", "\n", ";", "--", "'", '"', "<", ">"]):
            raise ValueError("Karakter ilegal terdeteksi pada target.")

        # Deteksi apakah target adalah URL
        if cleaned.startswith("http://") or cleaned.startswith("https://"):
            parsed = urlparse(cleaned)
            hostname = (parsed.hostname or "").lower()

            # 1. Anti-SSRF: Larang protokol selain HTTPS/HTTP
            if parsed.scheme not in ("http", "https"):
                raise ValueError("Hanya protokol HTTP/HTTPS yang diizinkan.")

            # 2. Anti-SSRF: Larang akses ke localhost atau IP privat internal
            if is_private_or_loopback(hostname):
                raise ValueError("Akses ke alamat internal / privat diblokir oleh sistem keamanan (Anti-SSRF).")

            # 3. Whitelist Domain: Hanya domain media sosial yang diperbolehkan
            if hostname not in ALLOWED_DOMAINS:
                raise ValueError(f"Domain '{hostname}' tidak terdaftar dalam whitelist platform yang didukung.")

            return cleaned

        # Jika bukan URL, anggap sebagai username (@handle)
        # Bersihkan awalan '@' jika ada
        if cleaned.startswith("@"):
            cleaned = cleaned[1:]

        platform = info.data.get("platform", PlatformEnum.X)
        pattern = USERNAME_REGEX_MAP.get(platform, r"^[A-Za-z0-9_]{1,30}$")
        if not re.match(pattern, cleaned):
            raise ValueError(
                f"Format username tidak valid untuk platform {platform}. "
                f"Harus memenuhi pola regex {pattern} tanpa simbol ilegal."
            )

        return cleaned


EVENT_ALLOWED_DOMAINS = {
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "instagram.com",
    "www.instagram.com",
}


class EventInvestigationRequest(BaseModel):
    """
    Request model untuk audit komentar massal berbasis URL postingan / video (YouTube / Instagram).
    Dilengkapi Anti-SSRF dan auto-resolver platform.
    """
    url: str = Field(
        ...,
        validation_alias=AliasChoices("url", "event_url"),
        min_length=5,
        max_length=500,
        description="URL publik video YouTube atau postingan/reel Instagram"
    )
    max_comments: int = Field(default=200, ge=10, le=500, description="Batas penarikan komentar (10 - 500)")
    depth_level: int = Field(default=1, ge=1, le=3, description="Kedalaman audit")

    @field_validator("url")
    @classmethod
    def validate_and_sanitize_event_url(cls, v: str) -> str:
        cleaned = v.strip()
        if any(c in cleaned for c in ["\x00", "\r", "\n", ";", "--", "'", '"', "<", ">"]):
            raise ValueError("Karakter ilegal terdeteksi pada URL.")

        if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
            raise ValueError("URL harus diawali dengan http:// atau https://")

        parsed = urlparse(cleaned)
        hostname = (parsed.hostname or "").lower()

        if is_private_or_loopback(hostname):
            raise ValueError("Akses ke alamat internal / privat diblokir oleh sistem keamanan (Anti-SSRF).")

        if hostname not in EVENT_ALLOWED_DOMAINS:
            raise ValueError(f"Domain '{hostname}' tidak didukung untuk audit event. Gunakan URL YouTube atau Instagram resmi.")

        return cleaned

    @property
    def detected_platform(self) -> PlatformEnum:
        hostname = (urlparse(self.url).hostname or "").lower()
        if "youtube" in hostname or "youtu.be" in hostname:
            return PlatformEnum.YOUTUBE
        elif "instagram" in hostname:
            return PlatformEnum.INSTAGRAM
        return PlatformEnum.X

import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
from twscrape import API, gather

from app.core.config import settings
from app.services.scraper.mock_data import get_mock_data
from app.services.scraper.exceptions import (
    TargetNotFoundException,
    PrivateAccountException,
    RateLimitExhaustedException,
)

logger = logging.getLogger("axiom.scraper.twscrape")


def parse_datetime(val: Any) -> datetime:
    """Konversi waktu tanggal dari twscrape ke timezone-aware UTC datetime."""
    if isinstance(val, datetime):
        return val.astimezone(timezone.utc) if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, str):
        for fmt in (
            "%Y-%m-%d %H:%M:%S%z",
            "%Y-%m-%dT%H:%M:%S%z",
            "%a %b %d %H:%M:%S %z %Y",
            "%Y-%m-%d %H:%M:%S",
        ):
            try:
                dt = datetime.strptime(val, fmt)
                return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
            except ValueError:
                continue
    return datetime.now(timezone.utc)


class TwscrapeService:
    """
    Layanan scraper X (Twitter) berbasis twscrape.
    Dioptimalkan untuk operasi 1 akun burner aman (cookies auth_token & ct0),
    dilengkapi timeout wait 60s, delay alami antar-request, dan fallback otomatis ke mode offline.
    """
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = Path(db_path or settings.TWSCRAPE_DB_PATH)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Konfigurasi 1 Akun Aman:
        # wait_timeout=60 artinya jika akun terkena limit, sistem menunggu hingga 60s
        # sebelum melempar timeout, sambil mencoba melanjutkan secara otomatis.
        self.api = API(
            pool=str(self.db_path),
            raise_when_no_account=False,
            wait_timeout=settings.TWSCRAPE_WAIT_TIMEOUT,
            wait_interval=settings.TWSCRAPE_WAIT_INTERVAL
        )

    async def has_active_account(self) -> bool:
        """Mengecek apakah database twscrape memiliki minimal 1 akun yang aktif."""
        if settings.SCRAPER_OFFLINE_MODE:
            return False
        try:
            accounts = await self.api.pool.get_all()
            return any(acc.active for acc in accounts)
        except Exception:
            return False

    async def add_account_from_cookies(self, username: str, cookies: str) -> None:
        """
        Menambahkan akun menggunakan string cookies browser (auth_token & ct0).
        Metode paling aman untuk mencegah akun terkena checkpoint atau banned.
        """
        await self.api.pool.add_account_cookies(username, cookies)
        logger.info(f"Akun @{username} berhasil ditambahkan ke database twscrape via cookies.")

    async def get_user_profile(self, username: str) -> Dict[str, Any]:
        """
        Menarik metadata profil akun target via twscrape.
        Jika tidak ada akun aktif, otomatis menggunakan data representatif (Mock Fallback).
        """
        clean_username = username.strip().lstrip("@")

        if not (await self.has_active_account()):
            logger.info(f"[Offline Demo] Tidak ada akun twscrape aktif. Menggunakan mock data untuk @{clean_username}")
            mock = get_mock_data(clean_username)
            return mock["profile"]

        try:
            user = await self.api.user_by_login(clean_username)
            if not user:
                raise TargetNotFoundException(clean_username)

            if getattr(user, "protected", False):
                raise PrivateAccountException(clean_username)

            img_url = getattr(user, "profileImageUrl", "") or ""
            is_default_avatar = bool(
                getattr(user, "defaultProfileImage", False) or
                "default_profile" in img_url or
                "default_avatar" in img_url
            )
            return {
                "username": user.username,
                "platform": "x",
                "display_name": user.displayname or clean_username,
                "bio": getattr(user, "rawDescription", "") or "",
                "followers_count": getattr(user, "followersCount", 0) or 0,
                "following_count": getattr(user, "friendsCount", 0) or 0,
                "is_verified": getattr(user, "verified", False) or getattr(user, "blue", False),
                "account_created_at": parse_datetime(user.created),
                "profile_metadata": {
                    "statuses_count": getattr(user, "statusesCount", 0) or 0,
                    "media_count": getattr(user, "mediaCount", 0) or 0,
                    "profile_image_url": img_url,
                    "location": getattr(user, "location", ""),
                    "default_profile_image": is_default_avatar,
                    "has_default_avatar": is_default_avatar,
                }
            }
        except (TargetNotFoundException, PrivateAccountException):
            raise
        except Exception as e:
            logger.error(f"Error saat menarik profil @{clean_username} via twscrape: {e}")
            raise RateLimitExhaustedException(f"Gagal mengambil profil akun @{clean_username}: {e}")

    async def get_user_tweets(self, username: str, count: int = 150) -> List[Dict[str, Any]]:
        """
        Menarik riwayat cuitan target secara aman.
        Membatasi penarikan per batch (maks 50 cuitan per request) dan memberikan jeda alami.
        """
        clean_username = username.strip().lstrip("@")

        if not (await self.has_active_account()):
            mock = get_mock_data(clean_username)
            return mock["tweets"][:count]

        try:
            user = await self.api.user_by_login(clean_username)
            if not user:
                raise TargetNotFoundException(clean_username)

            # Batasi limit per chunk untuk keamanan akun (safe rate)
            safe_limit = min(count, 50)
            raw_tweets = await gather(self.api.user_tweets(user.id, limit=safe_limit))
            
            # Berikan jeda alami (Human delay) jika ada request lanjutan
            await asyncio.sleep(0.5)

            results = []
            for tw in raw_tweets:
                content = getattr(tw, "rawContent", None) or getattr(tw, "content", "")
                is_retweet = getattr(tw, "retweetedTweet", None) is not None or content.startswith("RT @")
                is_reply = getattr(tw, "inReplyToUser", None) is not None
                act_type = "retweet" if is_retweet else ("reply" if is_reply else "tweet")
                in_reply_user = tw.inReplyToUser.username if tw.inReplyToUser else None

                # Ekstraksi entitas mikro terstruktur (Hashtags, Mentions, URLs, Media)
                hashtags = [tag.strip("#") for tag in getattr(tw, "hashtags", []) if tag]
                mentions = [
                    getattr(u, "username", str(u)).lstrip("@")
                    for u in getattr(tw, "mentionedUsers", [])
                    if getattr(u, "username", str(u))
                ]
                urls = [getattr(l, "url", str(l)) for l in getattr(tw, "links", []) if l]
                has_media = bool(len(getattr(tw, "photos", [])) + len(getattr(tw, "videos", [])))

                results.append({
                    "platform_post_id": str(tw.id),
                    "activity_type": act_type,
                    "content": content,
                    "posted_at": parse_datetime(tw.date),
                    "in_reply_to_user": in_reply_user,
                    "conversation_id": str(getattr(tw, "conversationId", "")) or None,
                    "lang": getattr(tw, "lang", "") or "und",
                    "hashtags": hashtags,
                    "mentions": mentions,
                    "urls": urls,
                    "has_media": has_media,
                    "metrics": {
                        "likes": getattr(tw, "likeCount", 0) or 0,
                        "retweets": getattr(tw, "retweetCount", 0) or 0,
                        "replies": getattr(tw, "replyCount", 0) or 0,
                        "views": getattr(tw, "viewCount", 0) or 0,
                        "has_media": has_media,
                        "hashtags": hashtags,
                        "mentions": mentions,
                        "urls": urls,
                    }
                })
            return results
        except (TargetNotFoundException, PrivateAccountException):
            raise
        except Exception as e:
            logger.error(f"Error saat menarik cuitan @{clean_username} via twscrape: {e}")
            raise RateLimitExhaustedException(f"Gagal mengambil cuitan @{clean_username}: {e}")

    async def get_user_replies(self, username: str, count: int = 100) -> List[Dict[str, Any]]:
        """
        Khusus menarik cuitan balasan untuk mendeteksi Target Bias / Buzzer agenda.
        """
        clean_username = username.strip().lstrip("@")

        if not (await self.has_active_account()):
            mock = get_mock_data(clean_username)
            return [t for t in mock["tweets"] if t["activity_type"] == "reply"][:count]

        try:
            user = await self.api.user_by_login(clean_username)
            if not user:
                raise TargetNotFoundException(clean_username)

            safe_limit = min(count, 50)
            raw_items = await gather(self.api.user_tweets_and_replies(user.id, limit=safe_limit))
            await asyncio.sleep(0.5)

            results = []
            for tw in raw_items:
                if getattr(tw, "inReplyToUser", None) is not None:
                    content = getattr(tw, "rawContent", None) or getattr(tw, "content", "")
                    in_reply_user = tw.inReplyToUser.username if tw.inReplyToUser else None

                    hashtags = [tag.strip("#") for tag in getattr(tw, "hashtags", []) if tag]
                    mentions = [
                        getattr(u, "username", str(u)).lstrip("@")
                        for u in getattr(tw, "mentionedUsers", [])
                        if getattr(u, "username", str(u))
                    ]
                    urls = [getattr(l, "url", str(l)) for l in getattr(tw, "links", []) if l]
                    has_media = bool(len(getattr(tw, "photos", [])) + len(getattr(tw, "videos", [])))

                    results.append({
                        "platform_post_id": str(tw.id),
                        "activity_type": "reply",
                        "content": content,
                        "posted_at": parse_datetime(tw.date),
                        "in_reply_to_user": in_reply_user,
                        "conversation_id": str(getattr(tw, "conversationId", "")) or None,
                        "lang": getattr(tw, "lang", "") or "und",
                        "hashtags": hashtags,
                        "mentions": mentions,
                        "urls": urls,
                        "has_media": has_media,
                        "metrics": {
                            "likes": getattr(tw, "likeCount", 0) or 0,
                            "retweets": getattr(tw, "retweetCount", 0) or 0,
                            "replies": getattr(tw, "replyCount", 0) or 0,
                            "views": getattr(tw, "viewCount", 0) or 0,
                        }
                    })
            return results
        except (TargetNotFoundException, PrivateAccountException):
            raise
        except Exception as e:
            logger.error(f"Error saat menarik balasan @{clean_username} via twscrape: {e}")
            raise RateLimitExhaustedException(f"Gagal mengambil balasan @{clean_username}: {e}")

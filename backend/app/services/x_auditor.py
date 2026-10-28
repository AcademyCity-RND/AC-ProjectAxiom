import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

from app.services.scraper.twscrape_adapter import TwscrapeService, parse_datetime
from twscrape import gather

logger = logging.getLogger("axiom.x_auditor")

# Regex pencocokan URL cuitan X/Twitter
TWEET_URL_REGEX = re.compile(
    r"(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:[a-zA-Z0-9_]+|i)\/status\/([0-9]+)",
    re.IGNORECASE
)


def extract_tweet_id(url_or_id: str) -> Optional[int]:
    """
    Mengekstrak Tweet ID numerik dari URL postingan X/Twitter atau string ID mentah.
    Mendukung format:
    - https://x.com/username/status/1849372819203819201
    - https://twitter.com/username/status/1849372819203819201
    - https://x.com/i/status/1849372819203819201
    - 1849372819203819201 (raw numeric ID)
    """
    if not url_or_id:
        return None
    cleaned = str(url_or_id).strip()

    # Raw numeric ID
    if cleaned.isdigit() and len(cleaned) >= 5:
        return int(cleaned)

    # Regex pattern
    match = TWEET_URL_REGEX.search(cleaned)
    if match:
        try:
            return int(match.group(1))
        except ValueError:
            return None

    # Fallback path parser
    try:
        parsed = urlparse(cleaned)
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        if "status" in parts:
            idx = parts.index("status")
            if idx + 1 < len(parts) and parts[idx + 1].isdigit():
                return int(parts[idx + 1])
    except Exception:
        pass

    return None


def generate_mock_tweet_replies(tweet_id: int, count: int = 50) -> List[Dict[str, Any]]:
    """
    Menghasilkan dataset komentar balasan tweet sintetis realistis untuk simulasi offline / fallback.
    Mencakup narasi propaganda botnet terkoordinasi (copypasta), buzzer bayaran, dan komentar warga net.
    """
    now = datetime.now(timezone.utc)
    base_time = now - timedelta(hours=2)

    copypasta_templates = [
        "Narasi propaganda ini sengaja disebar untuk memecah belah kedaulatan! Tolak provokasi! #KawalKedaulatan",
        "Narasi propaganda ini sengaja disebar untuk memecah belah persatuan! Tolak provokasi! #KawalKedaulatan",
        "Kebijakan pengadaan pertahanan siber sudah transparan, jangan biarkan buzzer asing merusak opini publik!",
        "Kebijakan ini jelas untuk kemajuan alutsista kita, viralkan kebenarannya kawan-kawan!",
        "Mohon pihak berwenang @Kemhan_RI @Puspen_TNI segera tindak akun-akun provokator bayaran ini.",
        "Setuju, mari kita evaluasi berbasis data dan fakta obyektif.",
    ]

    mock_replies = []
    # Simulasikan lonjakan serentak (temporal influx) pada menit ke-10 s/d 18
    burst_start = base_time + timedelta(minutes=10)

    for i in range(count):
        is_burst = i < int(count * 0.45)
        if is_burst:
            comment_time = burst_start + timedelta(seconds=(i * 14) % 600)
            text = copypasta_templates[i % 4]
            author = f"buzzer_x_{100 + (i % 7)}"
        else:
            comment_time = base_time + timedelta(minutes=20 + (i * 2))
            text = copypasta_templates[4 + (i % 2)] if i % 2 == 0 else f"Tanggapan cuitan nomor {i+1} dari masyarakat sipil."
            author = f"warga_x_{500 + i}"

        cid = f"tw_rep_{str(tweet_id)[:8]}_{i:04d}"
        mock_replies.append({
            "comment_id": cid,
            "video_id": str(tweet_id),
            "author_id": f"x_{author}",
            "author_name": f"@{author}",
            "text": text,
            "published_at": comment_time,
            "likes": max(0, 18 - (i % 9)),
            "replies": 1 if i % 4 == 0 else 0,
            "is_reply": True,
            "platform": "x"
        })

    return mock_replies


async def fetch_x_tweet_replies(
    url_or_tweet_id: str,
    max_comments: int = 200,
    use_mock_fallback: bool = True
) -> List[Dict[str, Any]]:
    """
    Mengambil balasan komentar cuitan X/Twitter menggunakan twscrape API `tweet_replies`.
    Auto-fallback ke mock dataset sintetis jika jaringan offline atau akun limit.
    """
    tweet_id = extract_tweet_id(url_or_tweet_id)
    if not tweet_id:
        raise ValueError(f"URL Tweet atau Tweet ID tidak valid: {url_or_tweet_id}")

    replies: List[Dict[str, Any]] = []

    try:
        service = TwscrapeService()
        if await service.has_active_account():
            raw_replies = await gather(service.api.tweet_replies(tweet_id, limit=max_comments))
            for rep in raw_replies:
                cid = str(rep.id)
                text = getattr(rep, "rawContent", None) or getattr(rep, "content", "")
                user_obj = getattr(rep, "user", None)
                username = getattr(user_obj, "username", "unknown") if user_obj else "unknown"

                replies.append({
                    "comment_id": cid,
                    "video_id": str(tweet_id),
                    "author_id": f"x_{username}",
                    "author_name": f"@{username}",
                    "text": text,
                    "published_at": parse_datetime(rep.date),
                    "likes": getattr(rep, "likeCount", 0) or 0,
                    "replies": getattr(rep, "replyCount", 0) or 0,
                    "is_reply": True,
                    "platform": "x"
                })

                if len(replies) >= max_comments:
                    break
    except Exception as e:
        logger.warning(
            f"Ekstraksi live balasan tweet '{tweet_id}' gagal ({e}). Fallback mode aktif: {use_mock_fallback}"
        )
        if not use_mock_fallback:
            raise

    if not replies and use_mock_fallback:
        logger.info(f"Menggunakan mock komentar balasan sintetis untuk Tweet '{tweet_id}'...")
        replies = generate_mock_tweet_replies(tweet_id, count=min(50, max_comments))

    return replies

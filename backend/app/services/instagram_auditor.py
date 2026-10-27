import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

from app.services.youtube_auditor import detect_temporal_influx_anomaly

logger = logging.getLogger("axiom.instagram_auditor")

# Regex pencocokan URL Instagram (/p/, /reel/, /tv/)
INSTAGRAM_URL_REGEX = re.compile(
    r"(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)",
    re.IGNORECASE
)


def extract_instagram_shortcode(url_or_code: str) -> Optional[str]:
    """
    Mengekstrak shortcode postingan/reel Instagram dari URL atau kode mentah.
    Mendukung format:
    - https://www.instagram.com/p/C_abc123/
    - https://www.instagram.com/reel/C_xyz456/
    - https://www.instagram.com/tv/C_tv789/
    - C_abc123 (raw shortcode)
    """
    if not url_or_code:
        return None

    cleaned = url_or_code.strip()

    # Cek regex URL
    match = INSTAGRAM_URL_REGEX.search(cleaned)
    if match:
        return match.group(1)

    # Cek jika input adalah raw shortcode (alfanumerik 5 - 25 karakter)
    if re.match(r"^[a-zA-Z0-9_-]{5,35}$", cleaned) and "/" not in cleaned:
        return cleaned

    # Fallback parsing path
    try:
        parsed = urlparse(cleaned)
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        if len(parts) >= 2 and parts[0] in ("p", "reel", "tv"):
            return parts[1]
    except Exception:
        pass

    return None


def generate_mock_instagram_comments(shortcode: str, count: int = 50) -> List[Dict[str, Any]]:
    """
    Menghasilkan dataset komentar Instagram sintetis realistis untuk simulasi offline / fallback.
    Mencakup narasi propaganda bot astroturfing, spam buzzer, dan komentar organik.
    """
    now = datetime.now(timezone.utc)
    base_time = now - timedelta(hours=2)

    copypasta_templates = [
        "Bubarkan lembaga ini! Hanya menghabiskan uang rakyat tanpa hasil nyata! 🔥 #KawalDemokrasi",
        "Bubarkan lembaga ini! Hanya menghabiskan uang rakyat tanpa hasil! Tolak terus 🔥 #KawalDemokrasi",
        "Pemberitaan hoaks murahan, jangan percaya media abal-abal ini! #HoaksTerstruktur",
        "Pemberitaan hoaks murahan untuk memecah belah bangsa, viralkan kebenarannya!",
        "Semangat terus tim @instansi! Kami rakyat selalu mendukung kebenaran.",
        "Keren banget ulasannya, ditunggu update berikutnya min 🙌",
    ]

    mock_comments = []
    # Simulasikan lonjakan serentak (temporal influx) pada menit ke-10 s/d 18
    burst_start = base_time + timedelta(minutes=10)

    for i in range(count):
        is_burst = i < int(count * 0.40) # 40% komentar masuk dalam periode burst
        if is_burst:
            comment_time = burst_start + timedelta(seconds=(i * 15) % 480)
            text = copypasta_templates[i % 4]
            username = f"cyber_ig_{100 + (i % 6)}"
        else:
            comment_time = base_time + timedelta(minutes=20 + (i * 2))
            text = copypasta_templates[4 + (i % 2)] if i % 2 == 0 else f"Komentar IG nomor {i+1} menanggapi postingan ini."
            username = f"warga_net_{500 + i}"

        cid = f"ig_c_{shortcode[:6]}_{i:04d}"
        mock_comments.append({
            "comment_id": cid,
            "shortcode": shortcode,
            "username": username,
            "author_name": username,
            "text": text,
            "created_at": comment_time,
            "published_at": comment_time,
            "likes_count": max(0, 10 - (i % 8)),
            "is_reply": False,
            "platform": "instagram"
        })

    return mock_comments


def fetch_instagram_comments(
    url_or_shortcode: str,
    max_comments: int = 200,
    session_file: Optional[str] = None,
    use_mock_fallback: bool = True
) -> List[Dict[str, Any]]:
    """
    Mengambil daftar komentar postingan publik Instagram menggunakan pustaka `instaloader`.
    - Memanfaatkan endpoint GraphQL publik
    - Mendukung berkas sesi lokal (session file) jika autentikasi diperlukan
    - Auto-fallback ke mock dataset sintetis jika terkena rate-limit / checkpoint / offline
    """
    shortcode = extract_instagram_shortcode(url_or_shortcode)
    if not shortcode:
        raise ValueError(f"URL atau Instagram Shortcode tidak valid: {url_or_shortcode}")

    comments: List[Dict[str, Any]] = []

    try:
        import instaloader
        loader = instaloader.Instaloader(
            download_pictures=False,
            download_videos=False,
            download_video_thumbnails=False,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            quiet=True
        )

        if session_file:
            try:
                loader.load_session_from_file(session_file)
            except Exception as se:
                logger.warning(f"Gagal memuat sesi Instagram dari '{session_file}': {se}")

        post = instaloader.Post.from_shortcode(loader.context, shortcode)

        for comment in post.get_comments():
            cid = str(comment.id)
            text = str(comment.text or "").strip()
            username = str(comment.owner.username if comment.owner else "unknown")
            created_utc = comment.created_at_utc.replace(tzinfo=timezone.utc)
            likes = int(comment.likes_count or 0)

            comments.append({
                "comment_id": cid,
                "shortcode": shortcode,
                "username": username,
                "author_name": username,
                "text": text,
                "created_at": created_utc,
                "published_at": created_utc,
                "likes_count": likes,
                "is_reply": False,
                "platform": "instagram"
            })

            if len(comments) >= max_comments:
                break

    except Exception as e:
        logger.warning(
            f"Ekstraksi live Instagram gagal untuk shortcode '{shortcode}' ({e}). "
            f"Fallback mode aktif: {use_mock_fallback}"
        )
        if not use_mock_fallback:
            raise

    # Jika live scraping gagal / kosong (kebijakan login Meta / offline mode)
    if not comments and use_mock_fallback:
        logger.info(f"Menggunakan mock komentar sintetis untuk Instagram post '{shortcode}'...")
        comments = generate_mock_instagram_comments(shortcode, count=min(50, max_comments))

    return comments

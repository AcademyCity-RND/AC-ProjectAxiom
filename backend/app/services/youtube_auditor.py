import re
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse, parse_qs

logger = logging.getLogger("axiom.youtube_auditor")

# Regex pencocokan URL YouTube berbagai format (watch?v=, youtu.be, /shorts/, /embed/)
YOUTUBE_URL_REGEX = re.compile(
    r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})",
    re.IGNORECASE
)


def extract_youtube_video_id(url_or_id: str) -> Optional[str]:
    """
    Mengekstrak 11-karakter YouTube Video ID dari URL atau string mentah.
    Mendukung format:
    - https://www.youtube.com/watch?v=dQw4w9WgXcQ
    - https://youtu.be/dQw4w9WgXcQ
    - https://www.youtube.com/shorts/dQw4w9WgXcQ
    - https://www.youtube.com/embed/dQw4w9WgXcQ
    - dQw4w9WgXcQ (raw ID)
    """
    if not url_or_id:
        return None

    cleaned = url_or_id.strip()

    # Jika sudah merupakan raw 11 karakter ID
    if len(cleaned) == 11 and re.match(r"^[a-zA-Z0-9_-]{11}$", cleaned):
        return cleaned

    # Cek query param ?v=
    try:
        parsed = urlparse(cleaned)
        qs = parse_qs(parsed.query)
        if "v" in qs and qs["v"] and len(qs["v"][0]) == 11:
            return qs["v"][0]
    except Exception:
        pass

    # Cek regex pattern
    match = YOUTUBE_URL_REGEX.search(cleaned)
    if match:
        return match.group(1)

    return None


def detect_temporal_influx_anomaly(
    comments: List[Dict[str, Any]],
    window_minutes: int = 10
) -> Dict[str, Any]:
    """
    Mendeteksi Temporal Influx Anomaly (lonjakan abnormal komentar serentak)
    pada video/postingan menggunakan algoritma sliding time window.
    
    Indikator serangan bot astroturfing:
    - Konsentrasi komentar tinggi (>30% dari total) membanjiri video dalam jendela 10 menit.
    - Laju komentar saat burst > 3x dari rata-rata laju komentar keseluruhan.
    """
    if not comments:
        return {
            "total_comments": 0,
            "is_anomaly": False,
            "anomaly_score": 0.0,
            "burst_ratio": 0.0,
            "peak_burst_count": 0,
            "time_span_minutes": 0.0,
            "mean_rate_per_min": 0.0,
            "peak_rate_per_min": 0.0,
            "peak_window_start": None,
            "peak_window_end": None,
            "explanation": "Tidak ada data komentar untuk dianalisis."
        }

    # Urutkan komentar berdasarkan waktu posting (ascending)
    valid_comments = []
    for c in comments:
        pt = c.get("published_at")
        if isinstance(pt, str):
            try:
                pt = datetime.fromisoformat(pt.replace("Z", "+00:00"))
            except Exception:
                pt = None
        if isinstance(pt, datetime):
            valid_comments.append((pt, c))

    if not valid_comments:
        return {
            "total_comments": len(comments),
            "is_anomaly": False,
            "anomaly_score": 0.0,
            "burst_ratio": 0.0,
            "peak_burst_count": 0,
            "time_span_minutes": 0.0,
            "mean_rate_per_min": 0.0,
            "peak_rate_per_min": 0.0,
            "peak_window_start": None,
            "peak_window_end": None,
            "explanation": "Timestamp komentar tidak dapat diurai."
        }

    valid_comments.sort(key=lambda x: x[0])
    total = len(valid_comments)

    start_time = valid_comments[0][0]
    end_time = valid_comments[-1][0]
    time_span_sec = max(1.0, (end_time - start_time).total_seconds())
    time_span_minutes = round(time_span_sec / 60.0, 2)

    window_delta = timedelta(minutes=window_minutes)

    # Sliding window untuk mencari burst tertinggi
    peak_count = 0
    peak_start = start_time
    peak_end = start_time + window_delta

    left = 0
    for right in range(total):
        # Geser jendela left jika selisih waktu > window_delta
        while valid_comments[right][0] - valid_comments[left][0] > window_delta:
            left += 1
        
        current_window_count = right - left + 1
        if current_window_count > peak_count:
            peak_count = current_window_count
            peak_start = valid_comments[left][0]
            peak_end = valid_comments[right][0]

    burst_ratio = round(peak_count / total, 4) if total > 0 else 0.0
    mean_rate = round(total / max(1.0, time_span_minutes), 3)
    peak_rate = round(peak_count / max(1.0, float(window_minutes)), 3)

    # Kriteria Anomali Astroturfing:
    # 1. Total komentar >= 10
    # 2. burst_ratio >= 0.30 (30% komentar masuk dalam window_minutes)
    # 3. ATAU peak_rate >= 3.0 * mean_rate
    is_anomaly = False
    anomaly_score = 0.0

    if total >= 10:
        ratio_factor = min(1.0, burst_ratio / 0.5)
        rate_factor = min(1.0, (peak_rate / max(0.001, mean_rate)) / 5.0) if mean_rate > 0 else 0.5
        anomaly_score = round(0.6 * ratio_factor + 0.4 * rate_factor, 3)

        if burst_ratio >= 0.30 or (mean_rate > 0 and peak_rate >= 2.5 * mean_rate):
            is_anomaly = True

    explanation = (
        f"Terdeteksi lonjakan temporal koordinasi: {peak_count} komentar ({burst_ratio * 100:.1f}% dari total) "
        f"muncul serentak dalam jendela {window_minutes} menit."
        if is_anomaly else
        f"Distribusi komentar normal (puncak: {peak_count} komentar dalam {window_minutes} menit)."
    )

    return {
        "total_comments": total,
        "is_anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "burst_ratio": burst_ratio,
        "peak_burst_count": peak_count,
        "time_span_minutes": time_span_minutes,
        "mean_rate_per_min": mean_rate,
        "peak_rate_per_min": peak_rate,
        "peak_window_start": peak_start.isoformat(),
        "peak_window_end": peak_end.isoformat(),
        "explanation": explanation
    }


def generate_mock_youtube_comments(video_id: str, count: int = 50) -> List[Dict[str, Any]]:
    """
    Menghasilkan dataset komentar YouTube sintetis realistis untuk simulasi offline / fallback.
    Mencakup narasi propaganda bot terkoordinasi (copypasta), buzzer bayaran, dan komentar organik.
    """
    now = datetime.now(timezone.utc)
    base_time = now - timedelta(hours=3)

    # Template narasi copypasta astroturfing
    copypasta_templates = [
        "Kebijakan ini sangat merugikan rakyat kecil, batalkan sekarang juga! #RakyatBersatu",
        "Kebijakan ini sangat merugikan rakyat kecil, batalkan sekarang juga! Tolak secepatnya #RakyatBersatu",
        "Jelas ini konspirasi asing untuk melemahkan kedaulatan kita! Viralkan!",
        "Jelas ini konspirasi asing untuk melemahkan kedaulatan negara kita! Viralkan kawan2!",
        "Maju terus pimpinan! Jangan dengarkan provokasi buzzer bayaran di kolom komentar.",
        "Konten ini sangat mencerahkan, terima kasih atas penjelasannya min.",
    ]

    mock_comments = []
    # Simulasikan lonjakan serentak (temporal influx) pada menit ke-15 s/d 25
    burst_start = base_time + timedelta(minutes=15)

    for i in range(count):
        is_burst = i < int(count * 0.45) # 45% komentar muncul di rentang burst
        if is_burst:
            comment_time = burst_start + timedelta(seconds=(i * 12) % 600)
            text = copypasta_templates[i % 4]
            author = f"user_yt_{1000 + (i % 8)}" # Akun berulang / buzzer botnet
        else:
            comment_time = base_time + timedelta(minutes=25 + (i * 3))
            text = copypasta_templates[4 + (i % 2)] if i % 3 == 0 else f"Pendapat saya nomor {i+1} terkait video ini cukup berimbang."
            author = f"organik_user_{2000 + i}"

        cid = f"Ugx_{video_id[:6]}_{i:04d}"
        mock_comments.append({
            "comment_id": cid,
            "video_id": video_id,
            "author_id": f"UC_{author}",
            "author_name": author,
            "text": text,
            "published_at": comment_time,
            "likes": max(0, 15 - (i % 10)),
            "replies": 1 if i % 5 == 0 else 0,
            "is_reply": False,
            "platform": "youtube"
        })

    return mock_comments


def fetch_youtube_comments(
    url_or_video_id: str,
    max_comments: int = 200,
    use_mock_fallback: bool = True
) -> List[Dict[str, Any]]:
    """
    Mengambil daftar komentar video YouTube menggunakan pustaka `youtube-comment-downloader`.
    - Pure HTTP streaming via endpoint Innertube publik
    - Bebas kuota API (tanpa YouTube Data API v3 token)
    - Auto-fallback ke mock dataset sintetis jika jaringan offline atau terblokir IP
    """
    video_id = extract_youtube_video_id(url_or_video_id)
    if not video_id:
        raise ValueError(f"URL atau YouTube Video ID tidak valid: {url_or_video_id}")

    target_url = f"https://www.youtube.com/watch?v={video_id}"
    comments: List[Dict[str, Any]] = []

    try:
        from youtube_comment_downloader import YoutubeCommentDownloader
        downloader = YoutubeCommentDownloader()
        
        generator = downloader.get_comments_from_url(target_url)
        for item in generator:
            cid = str(item.get("cid") or "")
            text = str(item.get("text") or "").strip()
            author = str(item.get("author") or "Unknown")
            channel = str(item.get("channel") or "")
            
            # Parsing timestamp
            time_parsed = item.get("time_parsed")
            if time_parsed:
                try:
                    pub_time = datetime.fromtimestamp(float(time_parsed), tz=timezone.utc)
                except Exception:
                    pub_time = datetime.now(timezone.utc)
            else:
                pub_time = datetime.now(timezone.utc)

            try:
                votes = int(str(item.get("votes") or "0").replace(",", "").strip())
            except Exception:
                votes = 0

            comments.append({
                "comment_id": cid,
                "video_id": video_id,
                "author_id": channel or f"UC_{author}",
                "author_name": author,
                "text": text,
                "published_at": pub_time,
                "likes": votes,
                "replies": int(item.get("replies") or 0),
                "is_reply": bool(item.get("reply", False)),
                "platform": "youtube"
            })

            if len(comments) >= max_comments:
                break

    except Exception as e:
        logger.warning(
            f"Ekstraksi komentar live YouTube gagal untuk video '{video_id}' ({e}). "
            f"Fallback mode aktif: {use_mock_fallback}"
        )
        if not use_mock_fallback:
            raise

    # Jika live scraping kosong (misal air-gapped demo atau video komentar dinonaktifkan)
    if not comments and use_mock_fallback:
        logger.info(f"Menggunakan mock komentar sintetis untuk video YouTube '{video_id}'...")
        comments = generate_mock_youtube_comments(video_id, count=min(50, max_comments))

    return comments

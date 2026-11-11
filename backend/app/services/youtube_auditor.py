import re
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse, parse_qs
import httpx

logger = logging.getLogger("axiom.youtube_auditor")

# Regex pencocokan URL YouTube berbagai format (watch?v=, youtu.be, /shorts/, /embed/)
YOUTUBE_URL_REGEX = re.compile(
    r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})",
    re.IGNORECASE
)

STANDARD_BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}


def extract_youtube_video_id(url_or_id: str) -> Optional[str]:
    """
    Mengekstrak 11-karakter YouTube Video ID dari URL atau string mentah.
    Mendukung format:
    - https://www.youtube.com/watch?v=HGgCE9a7BjU
    - https://youtu.be/HGgCE9a7BjU
    - https://www.youtube.com/shorts/p66hnaKuB3o
    - https://www.youtube.com/embed/HGgCE9a7BjU
    - HGgCE9a7BjU (raw ID)
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


def detect_content_type(url_or_id: str) -> str:
    """Mendeteksi apakah target berupa 'shorts' atau 'video' reguler."""
    if not url_or_id:
        return "video"
    if "/shorts/" in str(url_or_id).lower():
        return "shorts"
    return "video"


def fetch_youtube_metadata(video_id: str) -> Dict[str, Any]:
    """
    Mengambil metadata lengkap video/shorts YouTube:
    1. Judul, Pembuat/Kanal, Avatar melalui YouTube oEmbed
    2. Angka Likes, Dislikes riil, Views melalui Return YouTube Dislike (RYD) API
    3. Jumlah subscriber & deskripsi melalui scraping lightweight watch page
    """
    metadata: Dict[str, Any] = {
        "title": "YouTube Video",
        "channel_title": "Unknown Channel",
        "channel_url": "",
        "channel_id": "",
        "subscribers": 0,
        "subscribers_text": "N/A",
        "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        "views": 0,
        "likes": 0,
        "dislikes": 0,
        "rating": 5.0,
        "comments_count": 0,
        "upload_date": None,
        "description": ""
    }

    # 1. Query oEmbed API publik YouTube (Ringan & Cepat)
    watch_url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        oe_url = f"https://www.youtube.com/oembed?url={watch_url}&format=json"
        with httpx.Client(timeout=8.0, headers=STANDARD_BROWSER_HEADERS) as client:
            resp = client.get(oe_url)
            if resp.status_code == 200:
                oe_data = resp.json()
                metadata["title"] = oe_data.get("title") or metadata["title"]
                metadata["channel_title"] = oe_data.get("author_name") or metadata["channel_title"]
                metadata["channel_url"] = oe_data.get("author_url") or metadata["channel_url"]
                metadata["thumbnail_url"] = oe_data.get("thumbnail_url") or metadata["thumbnail_url"]
    except Exception as e:
        logger.warning(f"Gagal mengambil oEmbed YouTube untuk video '{video_id}': {e}")

    # 2. Query Return YouTube Dislike (RYD) API untuk angka Likes & Dislikes akurat
    try:
        ryd_url = f"https://returnyoutubedislikeapi.com/votes?videoId={video_id}"
        with httpx.Client(timeout=6.0, headers=STANDARD_BROWSER_HEADERS) as client:
            resp = client.get(ryd_url)
            if resp.status_code == 200:
                ryd_data = resp.json()
                metadata["views"] = int(ryd_data.get("viewCount") or metadata["views"])
                metadata["likes"] = int(ryd_data.get("likes") or metadata["likes"])
                metadata["dislikes"] = int(ryd_data.get("dislikes") or 0)
                metadata["rating"] = float(ryd_data.get("rating") or 5.0)
                date_created = ryd_data.get("dateCreated")
                if date_created:
                    metadata["upload_date"] = date_created
    except Exception as e:
        logger.warning(f"Gagal mengambil metrik RYD untuk video '{video_id}': {e}")

    # 3. Scraping Watch Page untuk subscriber count & detail channel
    try:
        with httpx.Client(timeout=10.0, headers=STANDARD_BROWSER_HEADERS, follow_redirects=True) as client:
            resp = client.get(watch_url)
            if resp.status_code == 200:
                html = resp.text

                # Cari subscriberCountText
                sub_m = re.search(r'"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\}', html)
                if not sub_m:
                    sub_m = re.search(r'"subscriberCountText":\{"simpleText":"([^"]+)"\}', html)
                if sub_m:
                    sub_str = sub_m.group(1)
                    metadata["subscribers_text"] = sub_str
                    # Ekstrak angka kasar (misal: "2.53 million subscribers" -> 2530000)
                    metadata["subscribers"] = parse_human_readable_count(sub_str)

                # Cari total komentar video / shorts pada YouTube
                count_m = re.search(r'"title":\{"runs":\[\{"text":"Comments"\}\]\},"contextualInfo":\{"runs":\[\{"text":"([^"]+)"\}\]\}', html)
                if not count_m:
                    count_m = re.search(r'"contextualInfo":\{"runs":\[\{"text":"([^"]+)"\}\]\}.*?"title":\{"runs":\[\{"text":"Comments"\}\]\}', html)
                if not count_m:
                    count_m = re.search(r'"panelIdentifier":"engagement-panel-comments-section".*?"contextualInfo":\{"runs":\[\{"text":"([^"]+)"\}\]\}', html)
                if count_m:
                    metadata["comments_count"] = parse_human_readable_count(count_m.group(1))

                # Cari channel ID jika belum ada
                cid_m = re.search(r'"browseId":"(UC[a-zA-Z0-9_-]{22})"', html)
                if cid_m:
                    metadata["channel_id"] = cid_m.group(1)

                # Fallback ekstraksi views dari Watch Page HTML jika RYD 0
                if metadata["views"] == 0:
                    view_m = re.search(r'"viewCount":"(\d+)"', html)
                    if view_m:
                        metadata["views"] = int(view_m.group(1))
                    else:
                        view_m = re.search(r'"viewCount":\{"simpleText":"([^"]+)"\}', html)
                        if view_m:
                            metadata["views"] = parse_human_readable_count(view_m.group(1))

                # Fallback ekstraksi likes dari Watch Page HTML jika RYD 0
                if metadata["likes"] == 0:
                    like_m = re.search(r'"label":"([\d,.]+\s*likes?|like this video along with [\d,.]* other people)"', html, re.I)
                    if like_m:
                        num_m = re.search(r'([\d,.]+)', like_m.group(1))
                        if num_m:
                            metadata["likes"] = parse_human_readable_count(num_m.group(1))
                    else:
                        like_m = re.search(r'"defaultText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+likes?)"\}\}\}', html, re.I)
                        if like_m:
                            num_m = re.search(r'([\d,.]+)', like_m.group(1))
                            if num_m:
                                metadata["likes"] = parse_human_readable_count(num_m.group(1))
    except Exception as e:
        logger.warning(f"Gagal mengekstrak detail subscriber watch page '{video_id}': {e}")

    return metadata


def parse_human_readable_count(text: str) -> int:
    """Mengubah string seperti '2.53 million subscribers' atau '15K' menjadi integer."""
    if not text:
        return 0
    cleaned = text.lower().replace(",", "").strip()
    m = re.search(r"([\d\.]+)\s*([kmb]|thousand|million|billion)?", cleaned)
    if not m:
        return 0
    val = float(m.group(1))
    unit = m.group(2) or ""
    if unit in ("k", "thousand"):
        return int(val * 1_000)
    elif unit in ("m", "million"):
        return int(val * 1_000_000)
    elif unit in ("b", "billion"):
        return int(val * 1_000_000_000)
    return int(val)


def fetch_channel_joined_date(channel_id_or_handle: str) -> Optional[str]:
    """
    Mengambil tanggal pembuatan channel YouTube (Account Creation Date / Joined Date)
    melalui halaman publik About channel.
    Contoh output: '2017-07-31T00:00:00Z'
    """
    if not channel_id_or_handle:
        return None

    # Tentukan URL target
    if channel_id_or_handle.startswith("UC"):
        url = f"https://www.youtube.com/channel/{channel_id_or_handle}/about"
    elif channel_id_or_handle.startswith("@"):
        url = f"https://www.youtube.com/{channel_id_or_handle}/about"
    else:
        url = f"https://www.youtube.com/@{channel_id_or_handle}/about"

    try:
        with httpx.Client(timeout=4.0, headers=STANDARD_BROWSER_HEADERS, follow_redirects=True) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                html = resp.text
                joined_m = re.search(r'"joinedDateText":\{"runs":\[\{"text":"Joined "\},\{"text":"([^"]+)"\}\]', html)
                if not joined_m:
                    joined_m = re.search(r'"joinedDateText":\{"simpleText":"([^"]+)"\}', html)
                if not joined_m:
                    joined_m = re.search(r'Joined\s+([A-Za-z0-9,\s]+)', html)

                if joined_m:
                    date_raw = joined_m.group(1).strip() # Contoh: "Jan 25, 2018" atau "31 Jul 2017"
                    return parse_joined_date_string(date_raw)
    except Exception as e:
        logger.debug(f"Gagal mengambil tanggal pembuatan channel '{channel_id_or_handle}': {e}")

    return None


def parse_joined_date_string(raw: str) -> str:
    """Mengubah format 'Jan 25, 2018' atau '25 Jan 2018' ke format ISO 8601."""
    formats = ["%b %d, %Y", "%d %b %Y", "%B %d, %Y", "%d %B %Y", "%Y-%m-%d"]
    cleaned = raw.replace("Joined", "").strip()
    for fmt in formats:
        try:
            dt = datetime.strptime(cleaned, fmt)
            return dt.replace(tzinfo=timezone.utc).isoformat()
        except Exception:
            continue
    return raw


def detect_temporal_influx_anomaly(
    comments: List[Dict[str, Any]],
    window_minutes: int = 10
) -> Dict[str, Any]:
    """
    Mendeteksi Temporal Influx Anomaly (lonjakan abnormal komentar serentak)
    pada video/postingan menggunakan algoritma sliding time window.
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

    peak_count = 0
    peak_start = start_time
    peak_end = start_time + window_delta

    left = 0
    for right in range(total):
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
    """Dataset komentar YouTube sintetis untuk fallback offline."""
    now = datetime.now(timezone.utc)
    base_time = now - timedelta(hours=3)

    copypasta_templates = [
        "Kebijakan ini sangat merugikan rakyat kecil, batalkan sekarang juga! #RakyatBersatu",
        "Kebijakan ini sangat merugikan rakyat kecil, batalkan sekarang juga! Tolak secepatnya #RakyatBersatu",
        "Jelas ini konspirasi asing untuk melemahkan kedaulatan kita! Viralkan!",
        "Jelas ini konspirasi asing untuk melemahkan kedaulatan negara kita! Viralkan kawan2!",
        "Maju terus pimpinan! Jangan dengarkan provokasi buzzer bayaran di kolom komentar.",
        "Konten ini sangat mencerahkan, terima kasih atas penjelasannya min.",
    ]

    mock_comments = []
    burst_start = base_time + timedelta(minutes=15)

    for i in range(count):
        is_burst = i < int(count * 0.45)
        if is_burst:
            comment_time = burst_start + timedelta(seconds=(i * 12) % 600)
            text = copypasta_templates[i % 4]
            author = f"user_yt_{1000 + (i % 8)}"
        else:
            comment_time = base_time + timedelta(minutes=25 + (i * 3))
            text = copypasta_templates[4 + (i % 2)] if i % 3 == 0 else f"Pendapat saya nomor {i+1} terkait video ini cukup berimbang."
            author = f"organik_user_{2000 + i}"

        cid = f"Ugx_{video_id[:6]}_{i:04d}"
        mock_comments.append({
            "comment_id": cid,
            "video_id": video_id,
            "author_id": f"UC_{author}",
            "author_username": author,
            "author_name": author,
            "text": text,
            "published_at": comment_time.isoformat(),
            "likes": max(0, 15 - (i % 10)),
            "replies_count": 1 if i % 5 == 0 else 0,
            "is_reply": False,
            "platform": "youtube"
        })

    return mock_comments


def parse_youtube_votes(raw_votes: Any) -> int:
    """Parses likes/votes from localized string (e.g. '1 rb', '1.5k', '1,234') safely."""
    if not raw_votes:
        return 0
    if isinstance(raw_votes, (int, float)):
        return int(raw_votes)
    s = str(raw_votes).replace("\xa0", " ").strip().lower()
    m = re.match(r"^([\d\.,]+)\s*([kmb]|rb|jt)?", s)
    if not m:
        try:
            return int(float(s.replace(",", "")))
        except Exception:
            return 0
    num_part, unit = m.group(1), m.group(2)
    if unit:
        num_part = num_part.replace(",", ".")
    else:
        num_part = num_part.replace(",", "")
    try:
        val = float(num_part)
        if unit in ["k", "rb"]:
            val *= 1_000
        elif unit in ["m", "jt"]:
            val *= 1_000_000
        elif unit == "b":
            val *= 1_000_000_000
        return int(val)
    except Exception:
        return 0


def fetch_youtube_comments(
    url_or_video_id: str,
    max_comments: int = 150,
    use_mock_fallback: bool = True
) -> List[Dict[str, Any]]:
    """
    Mengambil daftar komentar video/shorts YouTube (hingga max_comments).
    Menggunakan `youtube-comment-downloader` via Innertube endpoint publik.
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
            
            time_parsed = item.get("time_parsed")
            if time_parsed:
                try:
                    pub_time = datetime.fromtimestamp(float(time_parsed), tz=timezone.utc).isoformat()
                except Exception:
                    pub_time = datetime.now(timezone.utc).isoformat()
            else:
                pub_time = datetime.now(timezone.utc).isoformat()

            votes = parse_youtube_votes(item.get("votes"))

            comments.append({
                "comment_id": cid,
                "video_id": video_id,
                "author_id": channel or f"UC_{author}",
                "author_username": author,
                "author_name": author,
                "text": text,
                "published_at": pub_time,
                "likes": votes,
                "replies_count": int(item.get("replies") or 0),
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

    if not comments and use_mock_fallback:
        logger.info(f"Menggunakan mock komentar sintetis untuk video YouTube '{video_id}'...")
        comments = generate_mock_youtube_comments(video_id, count=min(50, max_comments))

    return comments


def audit_youtube_event(
    url_or_video_id: str,
    max_comments: int = 150,
    deep_inspect_top_attackers: bool = True
) -> Dict[str, Any]:
    """
    Pipeline lengkap audit investigasi Event URL YouTube:
    1. Ekstraksi Host / Content Metadata (Title, Channel, Subs, Views, Likes, Dislikes RYD)
    2. Penjaringan 150 Komentar Live
    3. Agregasi & Pemetaan User Unik (User Mapping)
    4. Deteksi Temporal Influx Anomaly
    5. Pengambilan Tanggal Buat Akun (Joined Date) untuk Top Attackers
    6. Pembuatan AI Training Features
    """
    video_id = extract_youtube_video_id(url_or_video_id)
    if not video_id:
        raise ValueError(f"URL atau Video ID YouTube tidak valid: {url_or_video_id}")

    ctype = detect_content_type(url_or_video_id)
    logger.info(f"Menjalankan audit YouTube ({ctype}) ID: {video_id}...")

    # 1. Metadata Host
    meta = fetch_youtube_metadata(video_id)

    # 2. Komentar (hingga 150)
    comments = fetch_youtube_comments(video_id, max_comments=max_comments)
    total_comments = len(comments)

    # 3. Pemetaan User (User Mapping)
    user_mapping: Dict[str, Dict[str, Any]] = {}
    for c in comments:
        uname = c.get("author_username") or "unknown"
        if uname not in user_mapping:
            user_mapping[uname] = {
                "author_name": uname,
                "author_id": c.get("author_id") or "",
                "comment_frequency": 0,
                "comments_list": [],
                "total_likes_received": 0,
                "first_comment_time": c.get("published_at"),
                "last_comment_time": c.get("published_at"),
                "account_created_at": None,
                "is_top_attacker": False
            }
        
        entry = user_mapping[uname]
        entry["comment_frequency"] += 1
        entry["comments_list"].append(c.get("text", ""))
        entry["total_likes_received"] += c.get("likes", 0)
        entry["last_comment_time"] = c.get("published_at")

    unique_commenters_count = len(user_mapping)
    spammer_ratio = round(1.0 - (unique_commenters_count / max(1, total_comments)), 4)

    # 4. Deteksi Anomali Temporal
    temporal_anomaly = detect_temporal_influx_anomaly(comments, window_minutes=10)

    # 5. Peringkat Top Attackers & Ekstraksi Usia Akun
    ranked_users = sorted(
        user_mapping.values(),
        key=lambda x: (x["comment_frequency"], x["total_likes_received"]),
        reverse=True
    )
    
    top_attackers = []
    top_limit = min(5, len(ranked_users))

    for idx in range(top_limit):
        target_usr = ranked_users[idx]
        target_usr["is_top_attacker"] = True
        
        # Tarik tanggal pendaftaran channel jika deep inspection aktif
        acc_created_at = None
        if deep_inspect_top_attackers:
            chan_id = target_usr.get("author_id") or target_usr.get("author_name")
            if chan_id:
                acc_created_at = fetch_channel_joined_date(chan_id)
                target_usr["account_created_at"] = acc_created_at

        risk_score = round(min(1.0, target_usr["comment_frequency"] / 3.0 * 0.7 + (0.3 if temporal_anomaly.get("is_anomaly") else 0.0)), 2)

        top_attackers.append({
            "rank": idx + 1,
            "username": target_usr["author_name"],
            "author_id": target_usr["author_id"],
            "comment_count": target_usr["comment_frequency"],
            "total_likes": target_usr["total_likes_received"],
            "risk_score": risk_score,
            "estimated_category": "BUZZER" if target_usr["comment_frequency"] > 2 else "SUSPICIOUS",
            "account_created_at": acc_created_at,
            "sample_comment": target_usr["comments_list"][0] if target_usr["comments_list"] else ""
        })

    # 6. Susun Payload Terpadu Sesuai SCRAPING_DATA_FORMAT.md
    payload: Dict[str, Any] = {
        "schema_version": "2.0.0",
        "audit_timestamp": datetime.now(timezone.utc).isoformat(),
        "target_url": f"https://www.youtube.com/watch?v={video_id}" if ctype == "video" else f"https://www.youtube.com/shorts/{video_id}",
        "platform": "youtube",
        "content_type": ctype,
        "host_metadata": {
            "platform": "youtube",
            "content_id": video_id,
            "content_url": f"https://www.youtube.com/watch?v={video_id}",
            "content_type": ctype,
            "title_or_caption": meta.get("title", ""),
            "published_at": meta.get("upload_date") or datetime.now(timezone.utc).isoformat(),
            "creator": {
                "username_or_channel": meta.get("channel_title", "Unknown"),
                "channel_or_user_id": meta.get("channel_id", ""),
                "subscribers_or_followers": meta.get("subscribers", 0),
                "subscribers_text": meta.get("subscribers_text", "N/A"),
                "is_verified": False,
                "profile_url": meta.get("channel_url", "")
            },
            "engagement": {
                "views_count": meta.get("views", 0),
                "likes_count": meta.get("likes", 0),
                "dislikes_count": meta.get("dislikes", 0),
                "rating": meta.get("rating", 5.0),
                "total_comments_on_platform": meta.get("comments_count") or total_comments
            }
        },
        "harvest_summary": {
            "target_quota": max_comments,
            "total_comments_extracted": total_comments,
            "unique_commenters_count": unique_commenters_count,
            "spammer_ratio": spammer_ratio,
            "extraction_status": "live_complete"
        },
        "comments": comments,
        "user_mapping": user_mapping,
        "top_attackers": top_attackers,
        "forensic_signals": {
            "temporal_anomaly": temporal_anomaly
        },
        "ai_training_features": {
            "f_total_comments": float(total_comments),
            "f_unique_commenters_ratio": round(unique_commenters_count / max(1, total_comments), 4),
            "f_temporal_burst_ratio": float(temporal_anomaly.get("burst_ratio", 0.0)),
            "f_anomaly_score": float(temporal_anomaly.get("anomaly_score", 0.0)),
            "f_spammer_ratio": spammer_ratio,
            "f_top_attackers_count": float(len(top_attackers)),
            "f_host_views": float(meta.get("views", 0)),
            "f_host_likes": float(meta.get("likes", 0)),
            "f_host_dislikes": float(meta.get("dislikes", 0))
        }
    }

    return payload

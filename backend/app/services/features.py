import math
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import numpy as np

# Daftar 21 fitur standar model Axiom
FEATURE_NAMES = [
    # 1. Temporal
    "temporal_entropy",
    "burstiness_score",
    "active_hours_count",
    "posts_per_day",
    # 2. Struktural & Profil
    "follower_following_ratio",
    "followers_count",
    "following_count",
    "username_digit_ratio",
    "has_default_avatar",
    "is_verified",
    "bio_length",
    # 3. Konten & Perilaku
    "retweet_ratio",
    "reply_ratio",
    "url_ratio",
    "media_ratio",
    "avg_text_length",
    "unique_word_ratio",
    "hashtag_density",
    "mention_density",
    # 4. Jaringan & Semantik CIB
    "max_semantic_similarity",
    "cluster_size",
]


def _parse_timestamp(val: Any) -> Optional[datetime]:
    """Mengonversi input datetime/str/isoformat ke UTC datetime."""
    if val is None:
        return None
    if isinstance(val, datetime):
        if val.tzinfo is None:
            return val.replace(tzinfo=timezone.utc)
        return val.astimezone(timezone.utc)
    if isinstance(val, str):
        try:
            dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            return None
    return None


def extract_actor_features(
    actor_profile: Dict[str, Any],
    activities: List[Dict[str, Any]],
    cluster_info: Optional[Dict[str, Any]] = None
) -> Dict[str, float]:
    """
    Mengekstrak 21 fitur statistik dari profil aktor dan riwayat aktivitas.
    Mendukung input dictionary maupun model ORM (via dict konversi).
    
    Args:
        actor_profile: Metadata profil akun (username, followers, following, dll)
        activities: List log aktivitas posting/cuitan
        cluster_info: Informasi klaster koordinasi semantik CIB (opsional)
        
    Returns:
        Dict[str, float]: 21 fitur numerik siap inferensi model ML
    """
    cluster_info = cluster_info or {}
    total_posts = len(activities)

    # ---------------------------------------------------------
    # 1. FITUR STRUKTURAL & METADATA PROFIL
    # ---------------------------------------------------------
    username = str(actor_profile.get("username", "") or "")
    followers = float(actor_profile.get("followers_count", 0) or 0)
    following = float(actor_profile.get("following_count", 0) or 0)
    is_verified = 1.0 if actor_profile.get("is_verified", False) else 0.0
    bio = str(actor_profile.get("bio", "") or "")
    bio_length = float(len(bio.strip()))

    # Rasio Follower / Following (+1 smoothing)
    follower_following_ratio = float(followers / (following + 1.0))

    # Rasio angka pada username (indikator bot auto-generated)
    if username:
        digits = sum(1 for c in username if c.isdigit())
        username_digit_ratio = float(digits / len(username))
    else:
        username_digit_ratio = 0.0

    # Cek default avatar
    profile_meta = actor_profile.get("profile_metadata") or {}
    has_default_avatar = 0.0
    if profile_meta.get("default_profile_image") or profile_meta.get("has_default_avatar"):
        has_default_avatar = 1.0

    # ---------------------------------------------------------
    # 2. FITUR TEMPORAL (WAKTU & DINAMIKA POSTING)
    # ---------------------------------------------------------
    timestamps: List[datetime] = []
    for act in activities:
        ts = _parse_timestamp(act.get("posted_at"))
        if ts:
            timestamps.append(ts)

    # Inisialisasi default temporal
    temporal_entropy = 0.0
    burstiness_score = 0.0
    active_hours_count = 0.0
    posts_per_day = 0.0

    if timestamps:
        timestamps.sort()
        # Distribusi jam (0 - 23)
        hours = [t.hour for t in timestamps]
        hour_counts = np.bincount(hours, minlength=24)
        active_hours_count = float(np.count_nonzero(hour_counts))

        # Shannon Entropy dari distribusi 24 jam (normalisasi [0, 1])
        probs = hour_counts[hour_counts > 0] / len(timestamps)
        raw_entropy = -np.sum(probs * np.log2(probs))
        max_entropy = np.log2(24.0) # ~4.58496
        temporal_entropy = float(raw_entropy / max_entropy) if max_entropy > 0 else 0.0

        # Burstiness Score (Goh-Barabasi parameter: B = (sigma - mu) / (sigma + mu))
        if len(timestamps) >= 3:
            intervals = np.diff([t.timestamp() for t in timestamps])
            # Filter interval non-negatif
            intervals = intervals[intervals >= 0]
            if len(intervals) >= 2:
                mu = float(np.mean(intervals))
                sigma = float(np.std(intervals))
                if (sigma + mu) > 0:
                    burstiness_score = float((sigma - mu) / (sigma + mu))

        # Posts per day
        first_time = timestamps[0]
        last_time = timestamps[-1]
        span_days = max(1.0, (last_time - first_time).total_seconds() / 86400.0)
        posts_per_day = float(len(timestamps) / span_days)

    # ---------------------------------------------------------
    # 3. FITUR KONTEN & PERILAKU
    # ---------------------------------------------------------
    retweet_count = 0
    reply_count = 0
    url_count = 0
    media_count = 0
    total_chars = 0
    all_words: List[str] = []
    total_hashtags = 0
    total_mentions = 0

    url_regex = re.compile(r'https?://\S+|www\.\S+')
    word_regex = re.compile(r'\b[a-zA-Z0-9_]+\b')

    for act in activities:
        content = str(act.get("content", "") or "")
        act_type = str(act.get("activity_type", "tweet") or "tweet").lower()
        metrics = act.get("metrics") or {}

        # Retweet detection
        if act_type == "retweet" or content.startswith("RT @"):
            retweet_count += 1

        # Reply detection
        if act_type == "reply" or act.get("in_reply_to_user") is not None:
            reply_count += 1

        # URL detection
        if url_regex.search(content) or (isinstance(metrics.get("urls"), list) and len(metrics.get("urls")) > 0):
            url_count += 1

        # Media detection
        if metrics.get("has_media") or (isinstance(metrics.get("media_urls"), list) and len(metrics.get("media_urls")) > 0):
            media_count += 1

        # Panjang teks
        total_chars += len(content)

        # Tokenisasi kata untuk diversitas leksikal (TTR)
        words = word_regex.findall(content.lower())
        all_words.extend(words)

        # Hashtag count
        if isinstance(metrics.get("hashtags"), list):
            total_hashtags += len(metrics.get("hashtags"))
        else:
            total_hashtags += content.count("#")

        # Mention count
        if isinstance(metrics.get("mentions"), list):
            total_mentions += len(metrics.get("mentions"))
        else:
            total_mentions += content.count("@")

    if total_posts > 0:
        retweet_ratio = float(retweet_count / total_posts)
        reply_ratio = float(reply_count / total_posts)
        url_ratio = float(url_count / total_posts)
        media_ratio = float(media_count / total_posts)
        avg_text_length = float(total_chars / total_posts)
        hashtag_density = float(total_hashtags / total_posts)
        mention_density = float(total_mentions / total_posts)
    else:
        retweet_ratio = 0.0
        reply_ratio = 0.0
        url_ratio = 0.0
        media_ratio = 0.0
        avg_text_length = 0.0
        hashtag_density = 0.0
        mention_density = 0.0

    # Type-Token Ratio (TTR) / Unique Word Ratio
    if all_words:
        unique_word_ratio = float(len(set(all_words)) / len(all_words))
    else:
        unique_word_ratio = 1.0 if total_posts == 0 else 0.0

    # ---------------------------------------------------------
    # 4. FITUR JARINGAN & SEMANTIK CIB
    # ---------------------------------------------------------
    max_semantic_similarity = float(cluster_info.get("max_semantic_similarity", 0.0) or 0.0)
    cluster_size = float(cluster_info.get("cluster_size", 1.0) or 1.0)

    # Gabungkan semua fitur sesuai urutan FEATURE_NAMES
    features: Dict[str, float] = {
        "temporal_entropy": round(temporal_entropy, 4),
        "burstiness_score": round(burstiness_score, 4),
        "active_hours_count": round(active_hours_count, 1),
        "posts_per_day": round(posts_per_day, 2),
        "follower_following_ratio": round(follower_following_ratio, 4),
        "followers_count": followers,
        "following_count": following,
        "username_digit_ratio": round(username_digit_ratio, 4),
        "has_default_avatar": has_default_avatar,
        "is_verified": is_verified,
        "bio_length": bio_length,
        "retweet_ratio": round(retweet_ratio, 4),
        "reply_ratio": round(reply_ratio, 4),
        "url_ratio": round(url_ratio, 4),
        "media_ratio": round(media_ratio, 4),
        "avg_text_length": round(avg_text_length, 2),
        "unique_word_ratio": round(unique_word_ratio, 4),
        "hashtag_density": round(hashtag_density, 2),
        "mention_density": round(mention_density, 2),
        "max_semantic_similarity": round(max_semantic_similarity, 4),
        "cluster_size": cluster_size,
    }

    return features

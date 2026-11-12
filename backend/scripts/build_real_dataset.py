import os
import sys
import glob
import re
import csv
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict
import numpy as np

# Ensure backend root is on Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.features import extract_actor_features, FEATURE_NAMES

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s [%(name)s]: %(message)s"
)
logger = logging.getLogger("build_real_dataset")

BASE_HARVEST_TIME = datetime(2026, 11, 11, 12, 0, 0, tzinfo=timezone.utc)


def parse_flexible_timestamp(val: Any, base_time: datetime = BASE_HARVEST_TIME) -> Optional[datetime]:
    """Mengonversi ISO 8601 atau relative timestamp (ID/EN) ke UTC datetime."""
    if not val:
        return None
    val_str = str(val).strip()

    # 1. Coba parse ISO 8601 standar
    try:
        clean_iso = val_str.replace("Z", "+00:00").replace("z", "+00:00")
        dt = datetime.fromisoformat(clean_iso)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        pass

    # 2. Coba parse format dengan spasi (e.g. 2026-11-11 09:20:29+00:00)
    try:
        dt = datetime.strptime(val_str[:19], "%Y-%m-%d %H:%M:%S")
        return dt.replace(tzinfo=timezone.utc)
    except Exception:
        pass

    # 3. Format relatif Bahasa Indonesia (e.g. "1 hari yang lalu", "2 jam yang lalu")
    text_lower = val_str.lower()
    m_id = re.search(r'(\d+)\s*(detik|menit|jam|hari|minggu|bulan|tahun)\s*yang\s*lalu', text_lower)
    if m_id:
        num = int(m_id.group(1))
        unit = m_id.group(2)
        if unit == 'detik':
            return base_time - timedelta(seconds=num)
        elif unit == 'menit':
            return base_time - timedelta(minutes=num)
        elif unit == 'jam':
            return base_time - timedelta(hours=num)
        elif unit == 'hari':
            return base_time - timedelta(days=num)
        elif unit == 'minggu':
            return base_time - timedelta(weeks=num)
        elif unit == 'bulan':
            return base_time - timedelta(days=num * 30)
        elif unit == 'tahun':
            return base_time - timedelta(days=num * 365)

    # 4. Format relatif Bahasa Inggris
    m_en = re.search(r'(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago', text_lower)
    if m_en:
        num = int(m_en.group(1))
        unit = m_en.group(2)
        if unit == 'second':
            return base_time - timedelta(seconds=num)
        elif unit == 'minute':
            return base_time - timedelta(minutes=num)
        elif unit == 'hour':
            return base_time - timedelta(hours=num)
        elif unit == 'day':
            return base_time - timedelta(days=num)
        elif unit == 'week':
            return base_time - timedelta(weeks=num)
        elif unit == 'month':
            return base_time - timedelta(days=num * 30)
        elif unit == 'year':
            return base_time - timedelta(days=num * 365)

    return None


def calculate_fast_semantic_clusters(texts: List[str], threshold: float = 0.85) -> Tuple[List[float], List[int]]:
    """
    Menghitung kemiripan kosinus antar-teks dalam 1 batch komentar/cuitan secara kilat.
    Menggunakan TF-IDF bi-gram + Cosine Similarity berkecepatan tinggi (orde milidetik).
    Returns:
        (max_similarities, cluster_sizes) per index teks
    """
    n = len(texts)
    if n <= 1:
        return [0.0] * n, [1] * n

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        # Bersihkan teks kosong
        clean_texts = [t.strip() if t and len(t.strip()) > 3 else "empty_text_token" for t in texts]

        vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
        X = vec.fit_transform(clean_texts)
        sim_matrix = cosine_similarity(X)
        np.fill_diagonal(sim_matrix, 0.0) # abaikan self-similarity

        max_sims = np.max(sim_matrix, axis=1).tolist()
        cluster_sizes = (np.sum(sim_matrix >= threshold, axis=1) + 1).tolist()
        return max_sims, cluster_sizes

    except Exception as e:
        logger.debug(f"TF-IDF similarity fallback: {e}")
        return [0.0] * n, [1] * n


def build_real_dataset(min_activities: int = 3) -> str:
    """
    Membaca seluruh 271 file CSV (aktif + backup), menyaring aktor dengan >= min_activities,
    mengekstrak 21 fitur perilaku, dan menyimpannya ke `backend/data/processed/real_actors_unlabeled.csv`.
    """
    raw_active_dir = os.path.join(BACKEND_DIR, "data", "raw_datasets")
    raw_backup_dir = os.path.join(BACKEND_DIR, "data", "raw_datasets_backup")
    processed_dir = os.path.join(BACKEND_DIR, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)
    out_csv = os.path.join(processed_dir, "real_actors_unlabeled.csv")

    active_files = glob.glob(os.path.join(raw_active_dir, "*", "*.csv"))
    backup_files = glob.glob(os.path.join(raw_backup_dir, "*", "*.csv"))
    all_files = sorted(list(set(active_files + backup_files)))

    logger.info(f"Ditemukan total {len(all_files)} file CSV ({len(active_files)} aktif, {len(backup_files)} backup).")

    # Struktur penampung: author -> list of activities
    author_activities = defaultdict(list)
    author_metadata = defaultdict(dict)
    author_max_sim = defaultdict(float)
    author_max_cluster = defaultdict(lambda: 1.0)
    author_platforms = defaultdict(set)

    total_rows = 0

    # -------------------------------------------------------------
    # 1. BACA & PARSING SELURUH FILE CSV
    # -------------------------------------------------------------
    for f_idx, file_path in enumerate(all_files, 1):
        filename = os.path.basename(file_path)
        platform_mode = os.path.basename(os.path.dirname(file_path)) # e.g. x_user, yt_video
        
        platform = "x" if platform_mode.startswith("x_") else ("instagram" if platform_mode.startswith("ig_") else "youtube")

        file_texts = []
        file_authors = []
        file_rows = []

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as fp:
                reader = csv.DictReader(fp)
                for row in reader:
                    raw_user = (row.get("author_username") or "").strip()
                    if not raw_user:
                        continue
                    clean_user = raw_user.lstrip("@").strip()
                    if not clean_user:
                        continue

                    raw_text = (row.get("raw_text") or "").strip()
                    created_at_raw = row.get("created_at")
                    dt = parse_flexible_timestamp(created_at_raw) or BASE_HARVEST_TIME

                    target_ctx = row.get("target_context") or ""
                    
                    # Parse follower jika ada di target_context
                    f_match = re.search(r'Followers:\s*(\d+)', target_ctx)
                    if f_match:
                        author_metadata[clean_user]["followers_count"] = float(f_match.group(1))

                    disp_name = row.get("author_display_name")
                    if disp_name:
                        author_metadata[clean_user]["display_name"] = disp_name

                    is_reply = str(row.get("is_reply", "")).lower() == "true"
                    likes = int(row.get("likes_count") or 0)
                    retweets = int(row.get("retweets_count") or 0)

                    act_obj = {
                        "content": raw_text,
                        "posted_at": dt,
                        "activity_type": "retweet" if raw_text.startswith("RT @") else ("reply" if is_reply else "post"),
                        "metrics": {
                            "is_reply": is_reply,
                            "likes_count": likes,
                            "retweets_count": retweets,
                        },
                        "platform": platform,
                        "file_source": filename
                    }

                    file_rows.append(act_obj)
                    file_authors.append(clean_user)
                    file_texts.append(raw_text if raw_text else " ")
                    total_rows += 1

        except Exception as e:
            logger.warning(f"Gagal membaca {filename}: {e}")
            continue

        # Hitung kemiripan semantik intra-file (antar komentar pada post yang sama)
        if len(file_texts) >= 2:
            max_sims, clusters = calculate_fast_semantic_clusters(file_texts)
            for user, sim, cl, act in zip(file_authors, max_sims, clusters, file_rows):
                author_activities[user].append(act)
                author_platforms[user].add(platform)
                if sim > author_max_sim[user]:
                    author_max_sim[user] = float(sim)
                if cl > author_max_cluster[user]:
                    author_max_cluster[user] = float(cl)
        else:
            for user, act in zip(file_authors, file_rows):
                author_activities[user].append(act)
                author_platforms[user].add(platform)

        if f_idx % 40 == 0 or f_idx == len(all_files):
            logger.info(f"Diproses: {f_idx}/{len(all_files)} CSV | Total baris aktivitas: {total_rows} | Total aktor unik: {len(author_activities)}")

    # -------------------------------------------------------------
    # 2. FILTER & EKSTRAKSI 21 FITUR BEHAVIORAL
    # -------------------------------------------------------------
    logger.info(f"Selesai membaca. Menyaring aktor dengan >= {min_activities} aktivitas...")

    qualifying_authors = [u for u, acts in author_activities.items() if len(acts) >= min_activities]
    logger.info(f"Jumlah aktor yang memenuhi syarat (>= {min_activities} aktivitas): {len(qualifying_authors)} dari {len(author_activities)} akun.")

    extracted_records = []

    for user in qualifying_authors:
        acts = author_activities[user]
        meta = author_metadata[user]
        
        followers = meta.get("followers_count", 150.0) # default median netizen
        following = meta.get("following_count", 120.0)
        
        # Hitung username digit ratio
        digits = sum(1 for c in user if c.isdigit())
        username_digit_ratio = float(digits / len(user)) if user else 0.0

        actor_profile = {
            "username": user,
            "followers_count": followers,
            "following_count": following,
            "is_verified": meta.get("is_verified", False),
            "bio": meta.get("bio", ""),
            "profile_metadata": {}
        }

        cluster_info = {
            "max_semantic_similarity": author_max_sim[user],
            "cluster_size": author_max_cluster[user]
        }

        # Panggil fungsi kanonikal extract_actor_features
        features_dict = extract_actor_features(
            actor_profile=actor_profile,
            activities=acts,
            cluster_info=cluster_info
        )

        # Kumpulkan 5 sampel komentar terpanjang/representatif untuk LLM Judge
        sorted_texts = sorted([a["content"] for a in acts if len(a["content"]) > 5], key=len, reverse=True)
        sample_comments = " || ".join(sorted_texts[:5]) if sorted_texts else "Tidak ada teks representatif"

        platform_str = ",".join(sorted(list(author_platforms[user])))

        row_data = {
            "username": user,
            "platform": platform_str,
            "activity_count": len(acts),
            "sample_comments": sample_comments,
            **features_dict
        }
        extracted_records.append(row_data)

    # -------------------------------------------------------------
    # 3. SIMPAN KE CSV
    # -------------------------------------------------------------
    fieldnames = ["username", "platform", "activity_count", "sample_comments"] + FEATURE_NAMES

    with open(out_csv, "w", encoding="utf-8", newline="") as fp:
        writer = csv.DictWriter(fp, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(extracted_records)

    logger.info(f"Dataset berhasil disimpan ke: {out_csv}")
    logger.info(f"Total aktor terekstrak: {len(extracted_records)} baris.")

    return out_csv


if __name__ == "__main__":
    min_act = 3
    if len(sys.argv) > 1:
        try:
            min_act = int(sys.argv[1])
        except ValueError:
            pass
    build_real_dataset(min_activities=min_act)

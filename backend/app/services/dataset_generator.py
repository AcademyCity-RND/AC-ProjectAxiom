import os
import random
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

from app.services.features import FEATURE_NAMES

LABEL_MAP = {
    0: "HUMAN",
    1: "BOT",
    2: "BUZZER"
}

LABEL_TO_INT = {v: k for k, v in LABEL_MAP.items()}


def generate_synthetic_dataset(
    n_per_class: int = 150,
    seed: int = 42
) -> pd.DataFrame:
    """
    Menghasilkan dataset tabular sintetis berstandar Cresci-2017 & TwiBot-20.
    Terdiri atas 3 kelas: HUMAN (0), BOT (1), BUZZER (2).
    
    Args:
        n_per_class: Jumlah sampel per kelas (total 3 * n_per_class)
        seed: Random seed untuk reproduktibilitas
        
    Returns:
        pd.DataFrame dengan 21 fitur dan kolom 'label' (int) & 'class_name' (str).
    """
    np.random.seed(seed)
    random.seed(seed)
    
    records: List[Dict[str, Any]] = []

    # 1. GENERATE HUMAN SAMPLES
    for _ in range(n_per_class):
        followers = float(np.random.exponential(scale=800) + 30)
        following = float(np.random.exponential(scale=500) + 20)
        ratio = followers / (following + 1.0)
        
        row = {
            "temporal_entropy": float(np.clip(np.random.normal(0.78, 0.08), 0.50, 0.95)),
            "burstiness_score": float(np.clip(np.random.normal(0.05, 0.15), -0.3, 0.45)),
            "active_hours_count": float(np.clip(np.random.normal(12.0, 2.5), 6.0, 18.0)),
            "posts_per_day": float(np.clip(np.random.exponential(scale=3.5) + 0.5, 0.2, 18.0)),
            "follower_following_ratio": float(ratio),
            "followers_count": followers,
            "following_count": following,
            "username_digit_ratio": float(np.clip(np.random.beta(1, 10), 0.0, 0.25)),
            "has_default_avatar": float(1.0 if np.random.rand() < 0.05 else 0.0),
            "is_verified": float(1.0 if np.random.rand() < 0.08 else 0.0),
            "bio_length": float(np.clip(np.random.normal(65, 35), 0.0, 160.0)),
            "retweet_ratio": float(np.clip(np.random.normal(0.25, 0.12), 0.02, 0.55)),
            "reply_ratio": float(np.clip(np.random.normal(0.35, 0.15), 0.05, 0.70)),
            "url_ratio": float(np.clip(np.random.normal(0.15, 0.10), 0.0, 0.45)),
            "media_ratio": float(np.clip(np.random.normal(0.25, 0.12), 0.0, 0.60)),
            "avg_text_length": float(np.clip(np.random.normal(120, 40), 20.0, 260.0)),
            "unique_word_ratio": float(np.clip(np.random.normal(0.75, 0.10), 0.55, 0.95)),
            "hashtag_density": float(np.clip(np.random.exponential(scale=0.5), 0.0, 2.0)),
            "mention_density": float(np.clip(np.random.exponential(scale=0.6), 0.0, 2.5)),
            "max_semantic_similarity": float(np.clip(np.random.normal(0.30, 0.12), 0.05, 0.60)),
            "cluster_size": 1.0,
            "label": 0,
            "class_name": "HUMAN"
        }
        records.append(row)

    # 2. GENERATE BOT SAMPLES (Otomatis / Spambot / Script)
    for _ in range(n_per_class):
        followers = float(np.random.exponential(scale=20) + 1)
        following = float(np.random.exponential(scale=1800) + 500)
        ratio = followers / (following + 1.0)
        
        # Sebagian bot aktif 24/7, sebagian memiliki interval rigid terjadwal
        is_rigid = np.random.rand() < 0.4
        if is_rigid:
            temp_entropy = float(np.clip(np.random.normal(0.25, 0.08), 0.05, 0.45))
            burst_score = float(np.clip(np.random.normal(-0.70, 0.10), -0.95, -0.40)) # rigid periodicity
            active_hours = float(np.random.choice([1.0, 2.0, 3.0]))
        else:
            temp_entropy = float(np.clip(np.random.normal(0.93, 0.04), 0.85, 0.99)) # 24/7 uniform
            burst_score = float(np.clip(np.random.normal(0.80, 0.10), 0.55, 0.98)) # extreme burst
            active_hours = float(np.clip(np.random.normal(22.5, 1.5), 18.0, 24.0))

        row = {
            "temporal_entropy": temp_entropy,
            "burstiness_score": burst_score,
            "active_hours_count": active_hours,
            "posts_per_day": float(np.clip(np.random.exponential(scale=60) + 30, 25.0, 350.0)),
            "follower_following_ratio": float(ratio),
            "followers_count": followers,
            "following_count": following,
            "username_digit_ratio": float(np.clip(np.random.normal(0.50, 0.15), 0.25, 0.85)),
            "has_default_avatar": float(1.0 if np.random.rand() < 0.65 else 0.0),
            "is_verified": 0.0,
            "bio_length": float(np.clip(np.random.exponential(scale=15), 0.0, 60.0)),
            "retweet_ratio": float(np.clip(np.random.normal(0.82, 0.10), 0.60, 0.99)),
            "reply_ratio": float(np.clip(np.random.normal(0.04, 0.03), 0.0, 0.15)),
            "url_ratio": float(np.clip(np.random.normal(0.70, 0.15), 0.35, 0.99)),
            "media_ratio": float(np.clip(np.random.normal(0.08, 0.06), 0.0, 0.25)),
            "avg_text_length": float(np.clip(np.random.normal(70, 25), 15.0, 160.0)),
            "unique_word_ratio": float(np.clip(np.random.normal(0.30, 0.08), 0.10, 0.48)),
            "hashtag_density": float(np.clip(np.random.normal(4.5, 1.5), 2.0, 9.0)),
            "mention_density": float(np.clip(np.random.normal(0.15, 0.12), 0.0, 0.6)),
            "max_semantic_similarity": float(np.clip(np.random.normal(0.78, 0.12), 0.55, 0.98)),
            "cluster_size": float(np.random.randint(5, 45)),
            "label": 1,
            "class_name": "BOT"
        }
        records.append(row)

    # 3. GENERATE BUZZER SAMPLES (Akun Penggalang Opini / Astroturfing Berbayar)
    for _ in range(n_per_class):
        followers = float(np.random.exponential(scale=1200) + 150)
        following = float(np.random.exponential(scale=1500) + 300)
        ratio = followers / (following + 1.0)

        row = {
            "temporal_entropy": float(np.clip(np.random.normal(0.68, 0.08), 0.45, 0.85)),
            "burstiness_score": float(np.clip(np.random.normal(0.48, 0.15), 0.15, 0.80)),
            "active_hours_count": float(np.clip(np.random.normal(12.0, 2.0), 7.0, 16.0)),
            "posts_per_day": float(np.clip(np.random.exponential(scale=20) + 15, 10.0, 85.0)),
            "follower_following_ratio": float(ratio),
            "followers_count": followers,
            "following_count": following,
            "username_digit_ratio": float(np.clip(np.random.beta(1.5, 6), 0.0, 0.35)),
            "has_default_avatar": float(1.0 if np.random.rand() < 0.10 else 0.0),
            "is_verified": float(1.0 if np.random.rand() < 0.05 else 0.0),
            "bio_length": float(np.clip(np.random.normal(85, 30), 20.0, 160.0)),
            "retweet_ratio": float(np.clip(np.random.normal(0.65, 0.12), 0.40, 0.90)),
            "reply_ratio": float(np.clip(np.random.normal(0.50, 0.15), 0.25, 0.85)),
            "url_ratio": float(np.clip(np.random.normal(0.25, 0.10), 0.05, 0.55)),
            "media_ratio": float(np.clip(np.random.normal(0.40, 0.15), 0.15, 0.75)),
            "avg_text_length": float(np.clip(np.random.normal(140, 35), 50.0, 260.0)),
            "unique_word_ratio": float(np.clip(np.random.normal(0.45, 0.08), 0.25, 0.62)),
            "hashtag_density": float(np.clip(np.random.normal(2.8, 1.0), 1.0, 6.0)),
            "mention_density": float(np.clip(np.random.normal(2.5, 0.9), 1.0, 5.5)),
            "max_semantic_similarity": float(np.clip(np.random.normal(0.91, 0.05), 0.82, 0.99)),
            "cluster_size": float(np.random.randint(4, 30)),
            "label": 2,
            "class_name": "BUZZER"
        }
        records.append(row)

    df = pd.DataFrame(records)
    # Acak urutan dataset
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    return df


def ensure_dataset_exists(data_dir: str = "data/training") -> str:
    """Memastikan file dataset training tersimpan di disk."""
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, "labeled_features.csv")
    if not os.path.exists(csv_path):
        df = generate_synthetic_dataset(n_per_class=120)
        df.to_csv(csv_path, index=False)
    return csv_path

import os
import sys
import csv
import json
import logging
import time
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np

from dotenv import load_dotenv

# Ensure backend root is on Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Load env variables from backend and root
load_dotenv(os.path.join(BACKEND_DIR, ".env"))
load_dotenv(os.path.join(BACKEND_DIR, "..", ".env"))

from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s [%(name)s]: %(message)s"
)
logger = logging.getLogger("auto_label_pipeline")

LABEL_MAP = {
    0: "HUMAN",
    1: "BOT",
    2: "BUZZER"
}


def apply_silver_rules(row: pd.Series) -> Optional[Tuple[int, float, str]]:
    """
    Lapis 1: Aturan Heuristik Tegas (Deterministic Silver Rules).
    Hanya melabeli akun dengan profil ekstrem yang tak terbantahkan.
    Returns:
        (label, confidence, reason) atau None jika ambigu
    """
    sim = float(row.get("max_semantic_similarity", 0.0))
    cl = float(row.get("cluster_size", 1.0))
    p_day = float(row.get("posts_per_day", 0.0))
    entropy = float(row.get("temporal_entropy", 0.5))
    burst = float(row.get("burstiness_score", 0.0))
    digits = float(row.get("username_digit_ratio", 0.0))
    lexical = float(row.get("unique_word_ratio", 0.6))
    hashtags = float(row.get("hashtag_density", 0.0))
    mentions = float(row.get("mention_density", 0.0))
    retweets = float(row.get("retweet_ratio", 0.0))

    # 1. BUZZER (Sindikat Koordinasi Amplifikasi Narasi)
    if (sim >= 0.75 and cl >= 3):
        return (2, 0.96, f"Koordinasi narasi CIB terbukti (Sim: {sim * 100:.1f}%, Klaster: {int(cl)} akun)")
    if hashtags >= 2.5 and mentions >= 1.5 and lexical <= 0.50:
        return (2, 0.92, "Pola astroturfing: densitas tagar & mention masif dengan leksikal rendah")

    # 2. BOT (Otomasi Script / Robotik / Auto-generated)
    if (digits >= 0.35 and lexical <= 0.50) or (p_day >= 20.0 and digits >= 0.30) or (digits >= 0.45):
        return (1, 0.94, f"Pola akun bot/otomasi: rasio angka username tinggi ({digits*100:.1f}%) dan leksikal rendah")
    if p_day >= 30.0 and (burst <= -0.40 or entropy <= 0.35):
        return (1, 0.95, f"Otomasi posting ekstrem ({p_day:.1f} post/hari) dengan interval kaku")

    # 3. HUMAN (Organik Autentik Bebas Sindikat)
    if cl <= 2.0 and sim < 0.50 and lexical >= 0.55 and digits < 0.25:
        return (0, 0.95, "Siklus tidur alami, kosakata variatif, dan independen tanpa klaster")

    return None


def run_llm_judge_batch(actors_batch: List[Dict[str, Any]], client: Any, model_name: str) -> List[Dict[str, Any]]:
    """
    Lapis 2: LLM Judge via Groq Llama 3.3 70B untuk akun-akun ambigu.
    Memproses hingga 10 akun sekaligus per batch prompt untuk efisiensi kuota.
    """
    prompt_items = []
    for idx, act in enumerate(actors_batch, 1):
        prompt_items.append({
            "id": idx,
            "username": act["username"],
            "platform": act["platform"],
            "posts_per_day": round(float(act.get("posts_per_day", 0)), 1),
            "temporal_entropy": round(float(act.get("temporal_entropy", 0)), 2),
            "max_semantic_sim": round(float(act.get("max_semantic_similarity", 0)), 2),
            "cluster_size": int(act.get("cluster_size", 1)),
            "unique_word_ratio": round(float(act.get("unique_word_ratio", 0)), 2),
            "sample_texts": act.get("sample_comments", "")[:350]
        })

    system_prompt = """Anda adalah Hakim Anotator Data Forensik Intelijen Siber (PUSSIBERAD).
Tugas Anda adalah melabeli akun media sosial Indonesia ke dalam salah satu dari 3 kelas:
- 0: HUMAN (Masyarakat umum, gaya bahasa wajar/emosi natural/gaul, tidak terafiliasi komando kampanye)
- 1: BOT (Skrip otomatisasi, teks spam berulang, pola waktu robotik)
- 2: BUZZER (Akun penggalang opini bayaran/astroturfing, naskah narasi seragam, amplifikasi isu politik/kebijakan)

PRINSIP KEHAKIMAN (ASAS PRADUGA ORGANIK):
Jika akun terlihat seperti manusia biasa yang sekadar berkomentar pedas/kritis/antusias dan tidak menunjukkan pola sindikat naskah seragam, WAJIB diberi label 0 (HUMAN). Jangan menuduh netizen biasa sebagai buzzer!

OUTPUT WAJIB BERUPA JSON ARRAY DENGAN FORMAT:
[
  {"id": 1, "label": 0|1|2, "confidence": 0.0-1.0, "reason": "Alasan singkat"}
]"""

    user_prompt = f"Berikut adalah data {len(actors_batch)} akun untuk dianotasi:\n" + json.dumps(prompt_items, indent=2)

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=1500
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        # Handle cases where output is wrapped in a key e.g. {"results": [...]} or direct list
        if isinstance(data, dict):
            for k in ["results", "actors", "annotations", "data"]:
                if k in data and isinstance(data[k], list):
                    return data[k]
            # If dict with keys '1', '2', etc.
            values = list(data.values())
            if values and isinstance(values[0], list):
                return values[0]
            if values and isinstance(values[0], dict):
                return values
        elif isinstance(data, list):
            return data
    except Exception as e:
        logger.warning(f"LLM Judge batch call error: {e}")

    # Fallback jika gagal panggil API
    return []


def run_auto_label_pipeline(
    input_csv: Optional[str] = None,
    output_csv: Optional[str] = None
) -> Tuple[str, str]:
    """
    Menjalankan pipeline anotasi bertingkat (Silver Rules + LLM Judge).
    """
    processed_dir = os.path.join(BACKEND_DIR, "data", "processed")
    input_csv = input_csv or os.path.join(processed_dir, "real_actors_unlabeled.csv")
    output_csv = output_csv or os.path.join(processed_dir, "real_actors_labeled.csv")
    review_csv = os.path.join(processed_dir, "needs_human_review.csv")

    if not os.path.exists(input_csv):
        raise FileNotFoundError(f"Input file {input_csv} belum tersedia. Jalankan build_real_dataset.py terlebih dahulu.")

    df = pd.read_csv(input_csv)
    logger.info(f"Memuat {len(df)} akun dari {input_csv}...")

    labels = [None] * len(df)
    confidences = [0.0] * len(df)
    reasons = [""] * len(df)
    tiers = [""] * len(df)

    # -------------------------------------------------------------
    # LAPIS 1: DETERMINISTIC SILVER RULES
    # -------------------------------------------------------------
    ambiguous_indices = []
    silver_count = 0

    for idx, row in df.iterrows():
        rule_res = apply_silver_rules(row)
        if rule_res is not None:
            lbl, conf, rsn = rule_res
            labels[idx] = lbl
            confidences[idx] = conf
            reasons[idx] = rsn
            tiers[idx] = "Tier1_SilverRules"
            silver_count += 1
        else:
            ambiguous_indices.append(idx)

    logger.info(f"Lapis 1 (Silver Rules) berhasil melabeli {silver_count}/{len(df)} akun ({silver_count/len(df)*100:.1f}%).")
    logger.info(f"Tersisa {len(ambiguous_indices)} akun ambigu yang perlu dievaluasi Lapis 2 (LLM Judge).")

    # -------------------------------------------------------------
    # LAPIS 2: LLM JUDGE (GROQ LLAMA 3.3 70B)
    # -------------------------------------------------------------
    groq_client = None
    can_connect_groq = False
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            groq_client = Groq(api_key=settings.GROQ_API_KEY, timeout=5.0, max_retries=1)
            # Test ping
            groq_client.models.list()
            can_connect_groq = True
            logger.info("Koneksi ke Groq API berhasil terverifikasi. Memulai Lapis 2 (LLM Judge Batching)...")
        except Exception as e:
            logger.info(f"Koneksi jaringan ke Groq API tidak tersedia ({e}). Menggunakan Lapis 2 Heuristik Cepat...")
            groq_client = None
            can_connect_groq = False

    batch_size = 10
    llm_count = 0

    if can_connect_groq and groq_client and ambiguous_indices:
        for i in range(0, len(ambiguous_indices), batch_size):
            batch_idxs = ambiguous_indices[i:i + batch_size]
            batch_records = [df.iloc[idx].to_dict() for idx in batch_idxs]

            logger.info(f"Mengirim batch {i//batch_size + 1}/{(len(ambiguous_indices) + batch_size - 1)//batch_size} ({len(batch_records)} akun) ke Groq...")
            results = run_llm_judge_batch(batch_records, groq_client, settings.GROQ_MODEL)

            # Map results back to original indices
            res_by_id = {r.get("id"): r for r in results if isinstance(r, dict)}
            for local_id, global_idx in enumerate(batch_idxs, 1):
                match = res_by_id.get(local_id)
                if match and match.get("label") in [0, 1, 2]:
                    labels[global_idx] = int(match["label"])
                    confidences[global_idx] = float(match.get("confidence", 0.85))
                    reasons[global_idx] = str(match.get("reason", "Anotasi LLM Judge"))
                    tiers[global_idx] = "Tier2_LLMJudge"
                    llm_count += 1
                else:
                    # Fallback konservatif jika LLM skip akun ini: default HUMAN wajar
                    labels[global_idx] = 0
                    confidences[global_idx] = 0.70
                    reasons[global_idx] = "Fallback Asas Praduga Organik (Human default)"
                    tiers[global_idx] = "Tier2_ConservativeFallback"

            # Rate limit politeness delay
            time.sleep(1.5)

    elif ambiguous_indices:
        logger.info("Groq API Key tidak aktif / offline. Menggunakan Lapis 2 Heuristik Konservatif Anti-Fitnah...")
        for global_idx in ambiguous_indices:
            row = df.iloc[global_idx]
            sim = float(row.get("max_semantic_similarity", 0.0))
            cl = float(row.get("cluster_size", 1.0))
            digits = float(row.get("username_digit_ratio", 0.0))
            lexical = float(row.get("unique_word_ratio", 0.6))

            if sim >= 0.70 and cl >= 2:
                labels[global_idx] = 2
                confidences[global_idx] = 0.82
                reasons[global_idx] = "Kemiripan semantik intra-klaster di atas rata-rata populasi"
                tiers[global_idx] = "Tier2_HeuristicBuzzer"
            elif (digits >= 0.35 and lexical <= 0.50) or digits >= 0.45:
                labels[global_idx] = 1
                confidences[global_idx] = 0.82
                reasons[global_idx] = "Indikasi bot: rasio angka username tinggi dan leksikal rendah"
                tiers[global_idx] = "Tier2_HeuristicBot"
            else:
                labels[global_idx] = 0
                confidences[global_idx] = 0.85
                reasons[global_idx] = "Asas Praduga Organik (Tidak terbukti ada naskah seragam)"
                tiers[global_idx] = "Tier2_ConservativeHuman"

    # -------------------------------------------------------------
    # LAPIS 3: EXPORT HASIL & SPLIT REVIEW
    # -------------------------------------------------------------
    df["label"] = labels
    df["class_name"] = [LABEL_MAP[l] for l in labels]
    df["confidence"] = confidences
    df["annotator_tier"] = tiers
    df["annotation_reason"] = reasons

    df.to_csv(output_csv, index=False)
    logger.info(f"Dataset berlabel berhasil disimpan ke: {output_csv}")

    # Pisahkan yang butuh human review
    review_df = df[df["confidence"] < 0.75]
    review_df.to_csv(review_csv, index=False)
    logger.info(f"Akun yang memerlukan verifikasi analis (< 75% conf): {len(review_df)} baris tersimpan di {review_csv}")

    # Cetak distribusi kelas
    dist = df["class_name"].value_counts().to_dict()
    logger.info("=" * 60)
    logger.info("DISTRIBUSI KELAS DATASET RIIL TERLABELI:")
    for k, v in dist.items():
        logger.info(f" - {k:10}: {v:5} akun ({v/len(df)*100:.1f}%)")
    logger.info("=" * 60)

    return output_csv, review_csv


if __name__ == "__main__":
    run_auto_label_pipeline()

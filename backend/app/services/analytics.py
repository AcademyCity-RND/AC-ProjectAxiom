import re
import math
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter
import numpy as np
from scipy import stats

from app.services.embedder import get_embedding_service, EmbeddingService

logger = logging.getLogger("axiom.analytics")

DAY_NAMES_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Bins interval waktu untuk Shannon Entropy
INTERVAL_BINS = [
    (0, 10, "< 10s (Burst)"),
    (10, 60, "10s - 1m (Rapid)"),
    (60, 300, "1m - 5m (Active)"),
    (300, 1800, "5m - 30m (Session)"),
    (1800, 7200, "30m - 2h (Periodic)"),
    (7200, 21600, "2h - 6h (Day Gap)"),
    (21600, 86400, "6h - 24h (Inter-day)"),
    (86400, float("inf"), "> 24h (Hiatus)"),
]


def _parse_timestamp(val: Any) -> Optional[datetime]:
    """Helper untuk parsing berbagai format timestamp ke timezone-aware UTC datetime."""
    if isinstance(val, datetime):
        return val if val.tzinfo else val.replace(tzinfo=timezone.utc)
    if isinstance(val, (int, float)):
        try:
            return datetime.fromtimestamp(val, tz=timezone.utc)
        except Exception:
            return None
    if isinstance(val, str):
        try:
            cleaned = val.replace("Z", "+00:00")
            dt = datetime.fromisoformat(cleaned)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            pass
    return None


# --------------------------------------------------------------------------
# 1. CIRCADIAN HEATMAP & WORKING HOURS PATTERN GENERATOR
# --------------------------------------------------------------------------
def generate_circadian_heatmap(timestamps: List[Any]) -> Dict[str, Any]:
    """
    Menghasilkan matriks aktivitas sirkadian 24x7 (7 hari x 24 jam) dan melakukan uji
    statistik Chi-Square vs Uniform Distribution untuk mengidentifikasi pola jam kerja
    operator manusia terstruktur vs otomasi bot 24 jam.
    """
    valid_dts: List[datetime] = []
    for ts in timestamps:
        dt = _parse_timestamp(ts)
        if dt:
            valid_dts.append(dt)

    total_posts = len(valid_dts)
    raw_matrix = [[0 for _ in range(24)] for _ in range(7)]
    hourly_totals = [0 for _ in range(24)]
    daily_totals = [0 for _ in range(7)]

    if total_posts == 0:
        return {
            "total_posts": 0,
            "matrix_7x24": raw_matrix,
            "matrix_24x7": [[0 for _ in range(7)] for _ in range(24)],
            "normalized_matrix": raw_matrix,
            "days": DAY_NAMES_ID,
            "hours": list(range(24)),
            "peak_day": "None",
            "peak_hour": 0,
            "working_hours_ratio": 0.0,
            "night_hours_ratio": 0.0,
            "chi2_statistic": 0.0,
            "chi2_p_value": 1.0,
            "pattern_type": "INSUFFICIENT_DATA",
            "explanation": "Data timestamp tidak mencukupi untuk analisis siklus sirkadian."
        }

    working_hours_count = 0
    night_hours_count = 0

    for dt in valid_dts:
        day_idx = dt.weekday() # 0 = Monday, 6 = Sunday
        hour = dt.hour         # 0 - 23

        raw_matrix[day_idx][hour] += 1
        hourly_totals[hour] += 1
        daily_totals[day_idx] += 1

        # Jam kerja kantor (Senin - Jumat, 08:00 - 17:59)
        if day_idx in range(5) and 8 <= hour <= 17:
            working_hours_count += 1

        # Jam tidur / malam (00:00 - 05:59)
        if 0 <= hour <= 5:
            night_hours_count += 1

    # Matriks transpose (24 jam x 7 hari) untuk fleksibilitas konsumsi frontend
    matrix_24x7 = [[raw_matrix[d][h] for d in range(7)] for h in range(24)]

    # Normalisasi min-max untuk skala warna heatmap [0.0 - 1.0]
    max_val = max(max(row) for row in raw_matrix)
    normalized_matrix = [
        [round(raw_matrix[d][h] / max_val, 4) if max_val > 0 else 0.0 for h in range(24)]
        for d in range(7)
    ]

    # Peak timing
    peak_day_idx = int(np.argmax(daily_totals))
    peak_hour = int(np.argmax(hourly_totals))
    peak_day_name = DAY_NAMES_ID[peak_day_idx]

    working_hours_ratio = round(working_hours_count / total_posts, 4)
    night_hours_ratio = round(night_hours_count / total_posts, 4)

    # Uji Chi-Square Goodness-of-Fit terhadap distribusi seragam E_i = N / 24
    expected = [total_posts / 24.0] * 24
    try:
        chi2_res = stats.chisquare(hourly_totals, f_exp=expected)
        chi2_stat = round(float(chi2_res.statistic), 3)
        chi2_p_val = round(float(chi2_res.pvalue), 6)
    except Exception:
        chi2_stat = 0.0
        chi2_p_val = 1.0

    # Klasifikasi Pola Operasional
    if total_posts < 10:
        pattern_type = "INSUFFICIENT_DATA"
        explanation = f"Sampel data terbatas ({total_posts} postingan). Belum cukup untuk inferensi sirkadian."
    elif working_hours_ratio >= 0.60 and chi2_p_val < 0.05:
        pattern_type = "STRUCTURED_OFFICE_HOURS"
        explanation = (
            f"Terdeteksi pola jam kerja terstruktur: {working_hours_ratio * 100:.1f}% aktivitas "
            f"berlangsung pada hari kerja pukul 08:00 - 18:00 WIB (Uji Chi-Square p={chi2_p_val:.4f}). "
            f"Indikator kuat operasi tim buzzer / operator bayaran."
        )
    elif night_hours_ratio >= 0.20:
        pattern_type = "CONTINUOUS_24_7_AUTOMATION"
        explanation = (
            f"Aktivitas berlangsung merata 24 jam tanpa jeda tidur malam (Aktivitas dini hari: {night_hours_ratio * 100:.1f}%). "
            f"Indikator kuat otomasi skrip bot terjadwal."
        )
    else:
        pattern_type = "ORGANIC_VARIABLE"
        explanation = (
            f"Aktivitas mengikuti ritme sosial alami manusia dengan penurunan tajam pada dini hari "
            f"dan konsentrasi di sore/malam hari (Puncak: {peak_day_name} jam {peak_hour:02d}:00)."
        )

    return {
        "total_posts": total_posts,
        "matrix_7x24": raw_matrix,
        "matrix_24x7": matrix_24x7,
        "normalized_matrix": normalized_matrix,
        "days": DAY_NAMES_ID,
        "hours": list(range(24)),
        "peak_day": peak_day_name,
        "peak_hour": peak_hour,
        "working_hours_ratio": working_hours_ratio,
        "night_hours_ratio": night_hours_ratio,
        "chi2_statistic": chi2_stat,
        "chi2_p_value": chi2_p_val,
        "pattern_type": pattern_type,
        "explanation": explanation
    }


# --------------------------------------------------------------------------
# 2. SHANNON ENTROPY CALCULATOR PADA INTERVAL WAKTU POSTING
# --------------------------------------------------------------------------
def calculate_posting_entropy(timestamps: List[Any]) -> Dict[str, Any]:
    """
    Menghitung Shannon Entropy dari selisih interval waktu posting berturut-turut (Δt).
    
    Formula:
    H = - sum(p_k * log2(p_k))
    H_norm = H / log2(K)
    
    Interpretasi:
    - H_norm < 0.35 : Sangat Deterministik / Skrip Bot Terjadwal (interval statis).
    - 0.35 <= H_norm < 0.65 : Semi-Otomatis / Operator Fokus.
    - H_norm >= 0.65 : Variabilitas Alami Manusia (acak dan adaptif).
    """
    valid_dts: List[datetime] = []
    for ts in timestamps:
        dt = _parse_timestamp(ts)
        if dt:
            valid_dts.append(dt)

    if len(valid_dts) < 3:
        return {
            "total_intervals": 0,
            "entropy": 0.0,
            "normalized_entropy": 0.0,
            "mean_interval_sec": 0.0,
            "median_interval_sec": 0.0,
            "std_interval_sec": 0.0,
            "bins_distribution": {},
            "classification": "INSUFFICIENT_DATA",
            "explanation": "Interval postingan tidak mencukupi untuk penghitungan entropi Shannon (minimal 3 postingan)."
        }

    # Urutkan secara kronologis
    valid_dts.sort()

    intervals_sec = []
    for i in range(len(valid_dts) - 1):
        delta = (valid_dts[i + 1] - valid_dts[i]).total_seconds()
        if delta >= 0:
            intervals_sec.append(delta)

    if not intervals_sec:
        return {
            "total_intervals": 0,
            "entropy": 0.0,
            "normalized_entropy": 0.0,
            "mean_interval_sec": 0.0,
            "median_interval_sec": 0.0,
            "std_interval_sec": 0.0,
            "bins_distribution": {},
            "classification": "INSUFFICIENT_DATA",
            "explanation": "Tidak ada interval waktu yang valid."
        }

    # Hitung distribusi frekuensi ke dalam 8 kategori bin
    bin_counts = [0 for _ in INTERVAL_BINS]
    for sec in intervals_sec:
        for idx, (low, high, _) in enumerate(INTERVAL_BINS):
            if low <= sec < high:
                bin_counts[idx] += 1
                break

    total_intervals = len(intervals_sec)
    entropy = 0.0
    for count in bin_counts:
        if count > 0:
            p = count / total_intervals
            entropy -= p * math.log2(p)

    max_possible_entropy = math.log2(len(INTERVAL_BINS)) # log2(8) = 3.0
    normalized_entropy = round(entropy / max_possible_entropy, 4)
    entropy = round(entropy, 4)

    mean_sec = round(float(np.mean(intervals_sec)), 2)
    median_sec = round(float(np.median(intervals_sec)), 2)
    std_sec = round(float(np.std(intervals_sec)), 2)

    bins_distribution = {
        label: bin_counts[i] for i, (_, _, label) in enumerate(INTERVAL_BINS)
    }

    if normalized_entropy < 0.35:
        classification = "HIGHLY_RIGID_SCHEDULED"
        explanation = (
            f"Entropi interval sangat rendah (H_norm = {normalized_entropy:.2f} < 0.35). "
            f"Interval waktu posting sangat kaku dan teratur, mengindikasikan otomasi bot terjadwal."
        )
    elif normalized_entropy < 0.65:
        classification = "SEMI_AUTOMATED_OR_FOCUSED"
        explanation = (
            f"Entropi interval moderat (H_norm = {normalized_entropy:.2f}). "
            f"Menunjukkan kombinasi postingan terjadwal berkala dengan interaksi terarah."
        )
    else:
        classification = "NATURAL_HUMAN_VARIABILITY"
        explanation = (
            f"Entropi interval tinggi (H_norm = {normalized_entropy:.2f} >= 0.65). "
            f"Distribusi interval waktu sangat acak dan bervariasi, khas perilaku pengguna manusia alami."
        )

    return {
        "total_intervals": total_intervals,
        "entropy": entropy,
        "normalized_entropy": normalized_entropy,
        "mean_interval_sec": mean_sec,
        "median_interval_sec": median_sec,
        "std_interval_sec": std_sec,
        "bins_distribution": bins_distribution,
        "classification": classification,
        "explanation": explanation
    }


# --------------------------------------------------------------------------
# 3. NARRATIVE DRIFT DETECTOR (TEMPORAL EMBEDDING SHIFT)
# --------------------------------------------------------------------------
def detect_narrative_drift(
    activities: List[Dict[str, Any]],
    window_hours: float = 6.0,
    embedder: Optional[EmbeddingService] = None
) -> Dict[str, Any]:
    """
    Mendeteksi pergeseran fokus narasi (Narrative Drift / Topic Pivot / Whataboutism)
    sepanjang waktu menggunakan sliding temporal window pada embedding teks.
    
    Menghitung vektor centroid tiap jendela waktu dan mengukur pergeseran Cosine Drift:
    Drift(W_t, W_{t+1}) = 1.0 - CosineSimilarity(c_t, c_{t+1})
    """
    if not activities:
        return {
            "drift_detected": False,
            "max_drift": 0.0,
            "mean_drift": 0.0,
            "window_count": 0,
            "windows": [],
            "summary": "Tidak ada aktivitas untuk analisis pergeseran narasi."
        }

    # Filter aktivitas yang memiliki teks dan timestamp
    parsed_items = []
    for act in activities:
        content = str(act.get("content") or act.get("text") or "").strip()
        ts = _parse_timestamp(act.get("posted_at") or act.get("created_at") or act.get("published_at"))
        if content and ts:
            parsed_items.append((ts, content))

    if len(parsed_items) < 4:
        return {
            "drift_detected": False,
            "max_drift": 0.0,
            "mean_drift": 0.0,
            "window_count": len(parsed_items),
            "windows": [],
            "summary": "Jumlah postingan teks tidak mencukupi untuk evaluasi pergeseran narasi temporal (minimal 4)."
        }

    # Urutkan secara kronologis
    parsed_items.sort(key=lambda x: x[0])

    t_start = parsed_items[0][0]
    t_end = parsed_items[-1][0]
    total_hours = max(0.1, (t_end - t_start).total_seconds() / 3600.0)

    # Sesuaikan ukuran window jika total durasi pendek
    effective_window_hours = window_hours
    if total_hours < window_hours * 2:
        effective_window_hours = max(0.5, total_hours / 3.0)

    window_delta = timedelta(hours=effective_window_hours)

    # Kelompokkan postingan ke dalam jendela-jendela waktu
    windows_raw: List[Dict[str, Any]] = []
    current_start = t_start

    while current_start < t_end:
        current_end = current_start + window_delta
        items_in_window = [
            text for ts, text in parsed_items
            if current_start <= ts < current_end
        ]
        # Tangani item terakhir tepat pada batas akhir
        if current_end >= t_end:
            items_in_window.extend([
                text for ts, text in parsed_items
                if ts >= current_end and text not in items_in_window
            ])

        if items_in_window:
            windows_raw.append({
                "start": current_start,
                "end": current_end,
                "texts": items_in_window
            })

        current_start = current_end

    if len(windows_raw) < 2:
        # Jika semua postingan terkumpul dalam 1 jendela waktu saja, bagi menjadi 2 paruh
        mid = len(parsed_items) // 2
        windows_raw = [
            {
                "start": parsed_items[0][0],
                "end": parsed_items[mid-1][0],
                "texts": [text for _, text in parsed_items[:mid]]
            },
            {
                "start": parsed_items[mid][0],
                "end": parsed_items[-1][0],
                "texts": [text for _, text in parsed_items[mid:]]
            }
        ]

    # Inisialisasi embedder
    embedder_svc = embedder or get_embedding_service()

    # Hitung vektor centroid untuk setiap window
    centroids: List[np.ndarray] = []
    window_summaries: List[Dict[str, Any]] = []

    for idx, win in enumerate(windows_raw):
        texts = win["texts"]
        emb_vectors = embedder_svc.embed_batch(texts)
        centroid = np.mean(np.array(emb_vectors), axis=0)
        norm = np.linalg.norm(centroid)
        if norm > 0:
            centroid = centroid / norm
        centroids.append(centroid)

        # Ekstrak kata kunci dominan sederhana
        all_words = []
        for t in texts:
            words = [w.lower() for w in re.findall(r"\b[A-Za-z0-9_-]{4,}\b", t)]
            all_words.extend(words)
        top_words = [word for word, _ in Counter(all_words).most_common(5)]

        window_summaries.append({
            "window_index": idx + 1,
            "start_time": win["start"].isoformat(),
            "end_time": win["end"].isoformat(),
            "post_count": len(texts),
            "top_keywords": top_words,
            "drift_from_previous": 0.0,
            "drift_from_start": 0.0
        })

    # Hitung drift antar centroid berurutan dan terhadap awal mula (W_0)
    c0 = centroids[0]
    drift_values: List[float] = []

    for i in range(len(centroids)):
        # Drift dari awal
        sim_from_start = float(np.dot(centroids[i], c0))
        drift_from_start = max(0.0, min(1.0, 1.0 - sim_from_start))
        window_summaries[i]["drift_from_start"] = round(drift_from_start, 4)

        if i > 0:
            sim_prev = float(np.dot(centroids[i], centroids[i - 1]))
            drift_prev = max(0.0, min(1.0, 1.0 - sim_prev))
            window_summaries[i]["drift_from_previous"] = round(drift_prev, 4)
            drift_values.append(drift_prev)

    max_drift = round(float(max(drift_values)), 4) if drift_values else 0.0
    mean_drift = round(float(np.mean(drift_values)), 4) if drift_values else 0.0

    # Kriteria Anomali Narrative Drift:
    # Pergeseran tajam mendadak (drift >= 0.35 antara dua jendela berdekatan)
    is_abrupt_drift = max_drift >= 0.35
    if is_abrupt_drift:
        summary_msg = (
            f"Terdeteksi pembelokan narasi mendadak (Max Drift = {max_drift * 100:.1f}% >= 35.0%). "
            f"Indikasi taktik pengalihan isu / whataboutism pada kampanye kognitif."
        )
    elif mean_drift >= 0.20:
        summary_msg = (
            f"Terdeteksi pergeseran narasi gradual terarah (Rata-rata drift = {mean_drift * 100:.1f}%). "
            f"Fokus narasi berkembang secara terencana antar jendela waktu."
        )
    else:
        summary_msg = (
            f"Narasi konsisten dan stabil (Max Drift = {max_drift * 100:.1f}%, Mean Drift = {mean_drift * 100:.1f}%). "
            f"Tidak ditemukan indikasi manipulasi topik mendadak."
        )

    return {
        "drift_detected": is_abrupt_drift,
        "max_drift": max_drift,
        "mean_drift": mean_drift,
        "window_count": len(window_summaries),
        "windows": window_summaries,
        "summary": summary_msg
    }


# --------------------------------------------------------------------------
# 4. UNIFIED ADVANCED ANALYTICS ORCHESTRATOR
# --------------------------------------------------------------------------
def compute_advanced_analytics(
    activities: List[Dict[str, Any]],
    embedder: Optional[EmbeddingService] = None
) -> Dict[str, Any]:
    """
    Fungsi gabungan utama untuk menghasilkan seluruh laporan analitik tingkat lanjut:
    1. Circadian Heatmap (24x7 Matrix & Chi-Square Pattern)
    2. Posting Interval Shannon Entropy
    3. Narrative Drift Timeline
    """
    timestamps = [
        act.get("posted_at") or act.get("created_at") or act.get("published_at")
        for act in activities
        if act.get("posted_at") or act.get("created_at") or act.get("published_at")
    ]

    circadian = generate_circadian_heatmap(timestamps)
    entropy = calculate_posting_entropy(timestamps)
    narrative_drift = detect_narrative_drift(activities, embedder=embedder)

    return {
        "circadian_heatmap": circadian,
        "posting_entropy": entropy,
        "narrative_drift": narrative_drift
    }

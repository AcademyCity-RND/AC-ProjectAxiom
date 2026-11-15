"""
Kebijakan penilaian bukti (evidence policy) untuk audit percakapan.

Tujuan modul ini adalah mencegah pelabelan BUZZER/BOT yang terlalu agresif:

- Kemiripan teks saja BUKAN bukti koordinasi.
- Komentar berisi tautan atau emoji saja BUKAN bukti koordinasi maupun otomasi.
- Satu komentar berulang atau satu klaster kecil hanya menghasilkan
  indikasi lemah berlabel ``SUSPICIOUS`` dengan status ``NEEDS_REVIEW``.
- ``BUZZER`` hanya diberikan ketika ada bukti koordinasi multi-akun:
  minimal tiga aktor berbeda dengan narasi substantif yang mirip dan
  keterkaitan yang saling menguatkan (bukan sekadar tautan/emoji).
- ``BOT`` hanya diberikan ketika ada bukti pengulangan tekstual oleh
  aktor yang sama, bukan karena aktor tersebut kebetulan berkomentar
  beberapa kali di jendela waktu yang ramai.

Semua penilaian bersifat deterministik dan tidak memanggil LLM maupun
layanan jaringan, sehingga dapat diuji secara offline.
"""

from __future__ import annotations

import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Ambang batas kebijakan (diekspos agar mudah ditinjau dan diuji)
# ---------------------------------------------------------------------------

# Jumlah token substantif minimal agar sebuah komentar dianggap bernarasi.
MIN_SUBSTANTIVE_TOKENS = 4

# Skor kemiripan minimal agar sebuah edge dianggap sebagai kandidat copypasta.
MIN_SIMILARITY_FOR_EVIDENCE = 0.85

# Bukti koordinasi (BUZZER)
COORDINATION_MIN_ACTORS = 3
COORDINATION_MIN_PAIRS = 2
COORDINATION_WINDOW_MINUTES = 60

# Bukti otomasi (BOT) — pengulangan teks oleh aktor yang sama
AUTOMATION_MIN_SUBSTANTIVE_REPEATS = 3
AUTOMATION_MIN_LOW_INFO_REPEATS = 4
AUTOMATION_WINDOW_MINUTES = 60

# Frekuensi yang membuat sebuah aktor perlu ditinjau (bukan divonis)
REVIEW_MIN_COMMENT_FREQUENCY = 2

# Jendela deteksi burst komentar
BURST_WINDOW_MINUTES = 10
BURST_MIN_SHARE = 0.4
BURST_MIN_ACTORS = 3

_URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_MENTION_RE = re.compile(r"@[A-Za-z0-9_]+")
_HASHTAG_RE = re.compile(r"#[A-Za-z0-9_]+")
_WORD_RE = re.compile(r"[A-Za-z\u00C0-\u024F]+")

_STOPWORDS = {
    "yang", "dan", "untuk", "dengan", "dari", "ini", "itu", "akan", "tidak",
    "juga", "kita", "kami", "mereka", "adalah", "pada", "atau", "karena",
    "the", "and", "for", "with", "that", "this", "from", "have", "has",
}

# Kategori akhir yang dipakai UI & ekspor
CATEGORY_BOT = "BOT"
CATEGORY_BUZZER = "BUZZER"
CATEGORY_SUSPICIOUS = "SUSPICIOUS"
CATEGORY_ORGANIC = "ORGANIC"

REVIEW_NEEDS_REVIEW = "NEEDS_REVIEW"
REVIEW_NO_ACTION = "NO_ACTION"


def _strip_noise(text: str) -> str:
    """Buang URL, mention, dan hashtag agar tidak dihitung sebagai narasi."""
    cleaned = _URL_RE.sub(" ", str(text or ""))
    cleaned = _MENTION_RE.sub(" ", cleaned)
    cleaned = _HASHTAG_RE.sub(" ", cleaned)
    return cleaned


def substantive_tokens(text: str) -> List[str]:
    """Token kata bermakna (tanpa URL/mention/hashtag/emoji/stopword)."""
    tokens = []
    for token in _WORD_RE.findall(_strip_noise(text)):
        lowered = token.lower()
        if len(lowered) < 3 or lowered in _STOPWORDS:
            continue
        tokens.append(lowered)
    return tokens


def is_substantive(text: str) -> bool:
    """Sebuah komentar dianggap bernarasi bila cukup kata bermakna."""
    return len(substantive_tokens(text)) >= MIN_SUBSTANTIVE_TOKENS


def normalize_text(text: str) -> str:
    """Normalisasi untuk mendeteksi pengulangan teks identik."""
    cleaned = _URL_RE.sub(lambda m: m.group(0).strip().lower(), str(text or ""))
    cleaned = re.sub(r"\s+", " ", cleaned).strip().lower()
    return cleaned


def parse_timestamp(value: Any) -> Optional[datetime]:
    """Parse timestamp dari datetime, ISO string, atau epoch numerik."""
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(float(value), tz=timezone.utc)
        except (OverflowError, OSError, ValueError):
            return None
    if isinstance(value, str):
        candidate = value.strip()
        if not candidate:
            return None
        if candidate.isdigit():
            return parse_timestamp(int(candidate))
        try:
            parsed = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
        except ValueError:
            return None
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    return None


def _author_of(comment: Dict[str, Any]) -> str:
    raw = (
        comment.get("author_name")
        or comment.get("author_username")
        or comment.get("username")
        or "anon"
    )
    return str(raw).strip().lstrip("@") or "anon"


def _time_of(comment: Dict[str, Any]) -> Optional[datetime]:
    return parse_timestamp(
        comment.get("published_at") or comment.get("created_at") or comment.get("date")
    )


def detect_burst_window(
    comments: Iterable[Dict[str, Any]],
    window_minutes: int = BURST_WINDOW_MINUTES,
) -> Dict[str, Any]:
    """Deteksi jendela waktu dengan kepadatan komentar tertinggi."""
    timed = [(c, _time_of(c)) for c in comments]
    timed = [(c, t) for c, t in timed if t is not None]
    if len(timed) < BURST_MIN_ACTORS:
        return {"is_burst": False, "window_start": None, "window_end": None, "share": 0.0}

    timed.sort(key=lambda item: item[1])
    window = timedelta(minutes=window_minutes)
    best: Tuple[int, Optional[datetime], Optional[datetime]] = (0, None, None)
    left = 0
    for right in range(len(timed)):
        while timed[right][1] - timed[left][1] > window:
            left += 1
        size = right - left + 1
        if size > best[0]:
            best = (size, timed[left][1], timed[right][1])

    count, start, end = best
    total = len(timed)
    share = count / total if total else 0.0
    actors_in_window = {
        _author_of(c)
        for c, t in timed
        if start is not None and end is not None and start <= t <= end
    }
    is_burst = share >= BURST_MIN_SHARE and len(actors_in_window) >= BURST_MIN_ACTORS
    return {
        "is_burst": is_burst,
        "window_start": start.isoformat() if start else None,
        "window_end": end.isoformat() if end else None,
        "share": round(share, 4),
        "count": count,
        "actors": sorted(actors_in_window),
    }


def _within_window(times: List[datetime], minutes: int) -> bool:
    if len(times) < 2:
        return False
    ordered = sorted(times)
    window = timedelta(minutes=minutes)
    left = 0
    for right in range(len(ordered)):
        while ordered[right] - ordered[left] > window:
            left += 1
        if right - left + 1 >= len(ordered):
            return True
    return False


def _any_pair_within_window(times: List[datetime], minutes: int) -> bool:
    if len(times) < 2:
        return False
    ordered = sorted(times)
    window = timedelta(minutes=minutes)
    return ordered[-1] - ordered[0] <= window if len(ordered) == 2 else _within_window(ordered, minutes)


def assess_event_evidence(
    comments: Optional[Iterable[Dict[str, Any]]] = None,
    clusters: Optional[Iterable[Dict[str, Any]]] = None,
    temporal_anomaly: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Menilai bukti percakapan dan menghasilkan kategori per aktor.

    Args:
        comments: daftar komentar/balasan dengan ``author_name``/``text``.
        clusters: edge kemiripan ``{source_actor, target_actor, similarity_score}``.
        temporal_anomaly: hasil deteksi burst eksternal (opsional).

    Returns:
        dict dengan ``overall_class``, ``review_status``,
        ``coordination_indicated``, ``automation_indicated``, ``actors``,
        ``signals``, dan ``reasons``.
    """
    comments = list(comments or [])
    clusters = [c for c in (clusters or []) if isinstance(c, dict)]

    per_actor_comments: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for comment in comments:
        if not isinstance(comment, dict):
            continue
        per_actor_comments[_author_of(comment)].append(comment)

    actor_stats: Dict[str, Dict[str, Any]] = {}
    for actor, items in per_actor_comments.items():
        texts = [str(c.get("text", "")) for c in items]
        substantive_texts = [t for t in texts if is_substantive(t)]
        low_info_texts = [t for t in texts if not is_substantive(t)]
        times = [t for t in (_time_of(c) for c in items) if t is not None]
        normalized = [normalize_text(t) for t in texts if normalize_text(t)]
        norm_substantive = [normalize_text(t) for t in substantive_texts]
        norm_low_info = [normalize_text(t) for t in low_info_texts if normalize_text(t)]

        actor_stats[actor] = {
            "comment_count": len(items),
            "substantive_count": len(substantive_texts),
            "low_information_count": len(low_info_texts),
            "substantive_ratio": round(len(substantive_texts) / max(1, len(items)), 4),
            "times": times,
            "text_repeats": max(Counter(normalized).values()) if normalized else 0,
            "substantive_repeats": max(Counter(norm_substantive).values()) if norm_substantive else 0,
            "low_information_repeats": max(Counter(norm_low_info).values()) if norm_low_info else 0,
            "total_repeat_share": (
                round(max(Counter(normalized).values()) / len(normalized), 4) if normalized else 0.0
            ),
        }

    # ------------------------------------------------------------------
    # Edge kemiripan: hanya dihitung bila kedua aktor punya narasi
    # substantif. Ini yang mencegah tautan/emoji dianggap koordinasi.
    # ------------------------------------------------------------------
    evidence_pairs: List[Tuple[str, str, float]] = []
    raw_pairs: List[Tuple[str, str, float]] = []
    ignored_pairs: List[Tuple[str, str, float]] = []

    for cl in clusters:
        source = str(cl.get("source_actor") or "").strip().lstrip("@")
        target = str(cl.get("target_actor") or "").strip().lstrip("@")
        if not source or not target or source == target:
            continue
        try:
            score = float(cl.get("similarity_score") or 0.0)
        except (TypeError, ValueError):
            score = 0.0
        if score < MIN_SIMILARITY_FOR_EVIDENCE:
            continue
        pair = (source, target, score)
        raw_pairs.append(pair)
        src_ok = actor_stats.get(source, {}).get("substantive_count", 0) > 0
        tgt_ok = actor_stats.get(target, {}).get("substantive_count", 0) > 0
        if src_ok and tgt_ok:
            evidence_pairs.append(pair)
        else:
            ignored_pairs.append(pair)

    partners: Dict[str, set] = defaultdict(set)
    for source, target, _score in evidence_pairs:
        partners[source].add(target)
        partners[target].add(source)

    # ------------------------------------------------------------------
    # Pengulangan narasi identik lintas aktor (copypasta sungguhan)
    # ------------------------------------------------------------------
    substantive_owners: Dict[str, set] = defaultdict(set)
    substantive_times: Dict[str, List[datetime]] = defaultdict(list)
    for actor, stats in actor_stats.items():
        for comment in per_actor_comments[actor]:
            text = str(comment.get("text", ""))
            if not is_substantive(text):
                continue
            key = normalize_text(text)
            if len(substantive_tokens(text)) < MIN_SUBSTANTIVE_TOKENS:
                continue
            substantive_owners[key].add(actor)
            t = _time_of(comment)
            if t is not None:
                substantive_times[key].append(t)

    copypasta_groups = {
        key: owners for key, owners in substantive_owners.items() if len(owners) >= COORDINATION_MIN_ACTORS
    }
    for owners in copypasta_groups.values():
        ordered = sorted(owners)
        for i, source in enumerate(ordered):
            for target in ordered[i + 1:]:
                partners[source].add(target)
                partners[target].add(source)

    coordination_actors = {actor for actor, others in partners.items() if others}
    # Aktor harus punya narasi substantif agar bisa menjadi bagian dari bukti koordinasi.
    coordination_actors = {
        actor for actor in coordination_actors
        if actor_stats.get(actor, {}).get("substantive_count", 0) > 0
    }
    coordination_pair_count = len({frozenset((s, t)) for s, t, _ in evidence_pairs})
    coordination_pair_count += max(
        0, sum(len(owners) - 1 for owners in copypasta_groups.values())
    )

    burst = temporal_anomaly if isinstance(temporal_anomaly, dict) and temporal_anomaly else detect_burst_window(comments)
    burst_flag = bool(
        burst.get("is_anomaly") if "is_anomaly" in burst else burst.get("is_burst")
    )

    # Waktu koordinasi: komentar substantif aktor-aktor terkait terkonsentrasi.
    coordination_window_times: List[datetime] = []
    for actor in coordination_actors:
        coordination_window_times.extend(actor_stats[actor]["times"])
    has_timestamps = len(coordination_window_times) >= COORDINATION_MIN_ACTORS
    temporal_concentrated = (
        _within_window(coordination_window_times, COORDINATION_WINDOW_MINUTES)
        if has_timestamps else False
    )

    coordination_indicated = (
        len(coordination_actors) >= COORDINATION_MIN_ACTORS
        and coordination_pair_count >= COORDINATION_MIN_PAIRS
        and (temporal_concentrated or not has_timestamps)
    )
    # Bila timestamp tersedia tetapi tidak terkonsentrasi, bukti dianggap lemah.
    if has_timestamps and not temporal_concentrated:
        coordination_indicated = False

    # ------------------------------------------------------------------
    # Bukti otomasi: pengulangan teks identik oleh aktor yang sama
    # ------------------------------------------------------------------
    automation_actors = set()
    for actor, stats in actor_stats.items():
        repeated_substantive = (
            stats["substantive_repeats"] >= AUTOMATION_MIN_SUBSTANTIVE_REPEATS
            and stats["comment_count"] >= AUTOMATION_MIN_SUBSTANTIVE_REPEATS
        )
        repeated_low_info = (
            stats["low_information_repeats"] >= AUTOMATION_MIN_LOW_INFO_REPEATS
            and stats["comment_count"] >= AUTOMATION_MIN_LOW_INFO_REPEATS
        )
        if not (repeated_substantive or repeated_low_info):
            continue
        window_ok = (
            _any_pair_within_window(stats["times"], AUTOMATION_WINDOW_MINUTES)
            if stats["times"] else False
        )
        if window_ok or len(stats["times"]) < 2:
            automation_actors.add(actor)

    automation_indicated = bool(automation_actors)

    # ------------------------------------------------------------------
    # Kategori per aktor
    # ------------------------------------------------------------------
    actors_result: Dict[str, Dict[str, Any]] = {}
    ignored_pair_actors = {
        actor for pair in ignored_pairs for actor in pair[:2]
    }
    for actor, stats in actor_stats.items():
        partner_count = len(partners.get(actor, set()))
        reasons: List[str] = []

        if actor in automation_actors:
            category = CATEGORY_BOT
            confidence = 0.62
            reasons.append(
                "Teks identik diulang oleh akun yang sama dalam jendela waktu singkat"
            )
            if stats["low_information_repeats"] >= AUTOMATION_MIN_LOW_INFO_REPEATS:
                reasons.append("Mayoritas isi komentar hanya tautan atau emoji")
        elif coordination_indicated and actor in coordination_actors and partner_count >= 2:
            category = CATEGORY_BUZZER
            confidence = round(min(0.9, 0.5 + 0.1 * partner_count), 2)
            reasons.append(
                f"Narasi substantif serupa dengan {partner_count} akun berbeda"
            )
            reasons.append("Pola kemunculan terkonsentrasi pada jendela waktu yang sama")
        elif partner_count > 0 or actor in ignored_pair_actors or stats["comment_count"] >= REVIEW_MIN_COMMENT_FREQUENCY:
            category = CATEGORY_SUSPICIOUS
            confidence = 0.3
            if actor in ignored_pair_actors or (
                stats["low_information_count"] and stats["low_information_count"] == stats["comment_count"]
            ):
                reasons.append("Isi komentar hanya tautan/emoji, belum cukup bukti otomasi")
            if partner_count:
                reasons.append(f"Kemiripan teks dengan {partner_count} akun, bukti koordinasi belum memadai")
            if stats["comment_count"] >= REVIEW_MIN_COMMENT_FREQUENCY:
                reasons.append(f"Berkomentar {stats['comment_count']} kali pada percakapan ini")
            if not reasons:
                reasons.append("Sinyal lemah, perlu peninjauan manual")
        else:
            category = CATEGORY_ORGANIC
            confidence = 0.2
            reasons.append("Tidak ada indikasi koordinasi atau pengulangan otomatis")

        actors_result[actor] = {
            "estimated_category": category,
            "confidence": confidence,
            "comment_count": stats["comment_count"],
            "substantive_count": stats["substantive_count"],
            "low_information_count": stats["low_information_count"],
            "distinct_cluster_partners": partner_count,
            "in_burst_window": actor in set(burst.get("actors") or []),
            "reasons": reasons,
        }

    if automation_indicated:
        overall = CATEGORY_BOT
    elif coordination_indicated:
        overall = CATEGORY_BUZZER
    elif any(a["estimated_category"] == CATEGORY_SUSPICIOUS for a in actors_result.values()):
        overall = CATEGORY_SUSPICIOUS
    else:
        overall = CATEGORY_ORGANIC

    review_status = REVIEW_NO_ACTION if overall == CATEGORY_ORGANIC else REVIEW_NEEDS_REVIEW

    signals = {
        "burst_detected": burst_flag,
        "burst_share": burst.get("share", 0.0),
        "similarity_pairs_used": len(evidence_pairs),
        "similarity_pairs_ignored_low_information": len(ignored_pairs),
        "copypasta_groups": len(copypasta_groups),
        "coordination_actors": sorted(coordination_actors),
        "automation_actors": sorted(automation_actors),
        "temporal_concentrated": temporal_concentrated,
        "timestamps_available": has_timestamps,
    }

    reasons: List[str] = []
    if overall == CATEGORY_BOT:
        reasons.append("Terdeteksi pengulangan teks identik oleh akun yang sama")
    elif overall == CATEGORY_BUZZER:
        reasons.append(
            f"Terdeteksi {len(coordination_actors)} akun dengan narasi substantif serupa dalam jendela waktu berdekatan"
        )
    elif overall == CATEGORY_SUSPICIOUS:
        reasons.append("Sinyal mencurigakan ditemukan, namun bukti koordinasi/otomasi belum memadai")
    else:
        reasons.append("Tidak ditemukan indikasi koordinasi atau otomasi")

    if ignored_pairs:
        reasons.append(
            f"{len(ignored_pairs)} pasangan kemiripan diabaikan karena isinya hanya tautan/emoji"
        )

    return {
        "overall_class": overall,
        "review_status": review_status,
        "coordination_indicated": coordination_indicated,
        "automation_indicated": automation_indicated,
        "actors": actors_result,
        "signals": signals,
        "reasons": reasons,
    }

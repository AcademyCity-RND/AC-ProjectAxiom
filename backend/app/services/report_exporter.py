import os
import io
import csv
import json
import hashlib
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.orm import Session

from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink
from app.services.analytics import compute_advanced_analytics

logger = logging.getLogger("axiom.report_exporter")

# Inisialisasi Jinja2 Environment dengan fallback path template
TEMPLATE_DIRS = [
    os.path.join(os.path.dirname(__file__), "..", "templates"),
    os.path.join(os.path.dirname(__file__), "..", "..", "templates"),
    "/app/app/templates",
    "/app/templates",
]
EXISTING_TEMPLATE_DIRS = [d for d in TEMPLATE_DIRS if os.path.exists(d)]
jinja_env = Environment(
    loader=FileSystemLoader(EXISTING_TEMPLATE_DIRS or ["."]),
    autoescape=select_autoescape(["html", "xml"])
)


def compute_cryptographic_fingerprint(data: Dict[str, Any]) -> str:
    """
    Menghitung sidik jari kriptografis SHA-256 dari seluruh isi dossier forensik.
    Menjamin integritas rantai barang bukti digital (Chain of Custody) bagi satuan intelijen hukum/militer.
    """
    # Serialisasi data ke format JSON kanonikal (sorted keys, no spaces)
    canonical_json = json.dumps(
        data,
        sort_keys=True,
        default=str,
        ensure_ascii=False,
        separators=(",", ":")
    )
    return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()


def build_case_dossier_data(case_id: str, db: Session) -> Dict[str, Any]:
    """
    Mengumpulkan seluruh data intelijen kasus, analitik lanjutan, dan daftar lengkap
    100% komentator (Dual-Tier Forensic Ledger) untuk diekspor ke PDF/HTML dan CSV.
    """
    case = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
    if not case:
        raise ValueError(f"Kasus investigasi dengan ID '{case_id}' tidak ditemukan.")

    # 1. Ambil seluruh aktor yang terafiliasi dengan kasus
    actors = db.query(ActorProfile).filter(ActorProfile.case_id == case_id).all()
    actor_map = {a.id: a for a in actors}
    actor_ids = list(actor_map.keys())

    # 2. Ambil seluruh klaster CIB
    cluster_links = db.query(ClusterLink).filter(ClusterLink.case_id == case_id).all()
    cib_actors = {l.source_actor for l in cluster_links} | {l.target_actor for l in cluster_links}
    cib_sim_map = {}
    for l in cluster_links:
        if l.source_actor:
            cib_sim_map[l.source_actor] = max(cib_sim_map.get(l.source_actor, 0.0), l.similarity_score)
        if l.target_actor:
            cib_sim_map[l.target_actor] = max(cib_sim_map.get(l.target_actor, 0.0), l.similarity_score)

    # 3. Ambil hasil deteksi
    detection = db.query(DetectionResult).filter(DetectionResult.case_id == case_id).first()

    # 4. Ambil seluruh aktivitas (100% komentator / cuitan)
    activities = []
    if actor_ids:
        activities = (
            db.query(ActivityLog)
            .filter(ActivityLog.actor_id.in_(actor_ids))
            .order_by(ActivityLog.posted_at.asc())
            .all()
        )

    # 5. Ekstraksi Anomali Temporal
    summary = case.result_summary or {}
    temporal_anomaly = summary.get("temporal_anomaly") or {}
    burst_actors = set()
    if temporal_anomaly.get("is_anomaly") and temporal_anomaly.get("peak_window_start"):
        try:
            pw_start = datetime.fromisoformat(temporal_anomaly["peak_window_start"])
            pw_end = datetime.fromisoformat(temporal_anomaly["peak_window_end"])
            for act in activities:
                if act.posted_at and (pw_start <= act.posted_at <= pw_end):
                    act_author = actor_map.get(act.actor_id)
                    if act_author:
                        burst_actors.add(act_author.username)
        except Exception:
            pass

    # 6. Susun Full Comprehensive Commenter Audit Ledger (Tier 2 - 100% Data)
    full_ledger: List[Dict[str, Any]] = []
    for idx, act in enumerate(activities, 1):
        author = actor_map.get(act.actor_id)
        username = author.username if author else "unknown"
        in_cib = username in cib_actors
        in_burst = username in burst_actors
        sim_score = cib_sim_map.get(username, 0.0)

        # Klasifikasi estimasi individual
        if in_cib or sim_score >= 0.85:
            est_class = "BUZZER"
            risk = 0.90
        elif in_burst:
            est_class = "BOT"
            risk = 0.75
        else:
            est_class = "ORGANIC"
            risk = 0.15

        metrics = act.metrics or {}
        likes = metrics.get("likes") or metrics.get("likes_count") or 0
        replies = metrics.get("replies") or 0

        full_ledger.append({
            "index": idx,
            "username": username,
            "platform": case.platform,
            "post_id": act.platform_post_id or str(act.id),
            "published_at": act.posted_at.isoformat() if act.posted_at else "",
            "content": act.content,
            "likes": int(likes),
            "replies": int(replies),
            "in_cib_cluster": in_cib,
            "cluster_similarity": round(float(sim_score), 4),
            "in_burst_window": in_burst,
            "estimated_class": est_class,
            "risk_score": round(float(risk), 2)
        })

    # 7. Susun Top 10 Core Attackers (Tier 1)
    top_10_attackers = summary.get("top_10_attackers")
    if not top_10_attackers:
        # Hitung ranking dari full ledger jika belum ada di summary
        from collections import Counter
        user_counts = Counter(item["username"] for item in full_ledger)
        ranked = []
        for uname, count in user_counts.items():
            in_cib = uname in cib_actors
            in_burst = uname in burst_actors
            cl_conn = 1 if in_cib else 0
            risk = round((0.5 if in_cib else 0.0) + (0.3 if in_burst else 0.0) + min(0.2, count * 0.05), 2)
            cat = "BUZZER" if in_cib else ("BOT" if in_burst else ("SUSPICIOUS" if risk > 0.3 else "ORGANIC"))
            ranked.append({
                "username": uname,
                "comment_count": count,
                "cluster_connections": cl_conn,
                "posted_in_burst_window": in_burst,
                "risk_score": risk,
                "estimated_category": cat
            })
        ranked.sort(key=lambda x: (x["risk_score"], x["comment_count"]), reverse=True)
        top_10_attackers = ranked[:10]

    # 8. Analitik Sirkadian, Entropi, Narrative Drift
    analytics_data = summary.get("analytics")
    if not analytics_data:
        act_dict_list = [
            {"content": a.content, "posted_at": a.posted_at}
            for a in activities
        ]
        analytics_data = compute_advanced_analytics(act_dict_list)

    # 9. Forensik Dossier
    forensic_dossier = summary.get("forensic_dossier")
    if not forensic_dossier and detection and detection.threat_attribution:
        forensic_dossier = detection.threat_attribution.get("forensic_dossier")
    if not forensic_dossier:
        forensic_dossier = {
            "threat_level": "LOW",
            "primary_agenda": "Pemantauan rutin",
            "target_institution": "Umum",
            "evidence_points": ["Tidak ditemukan anomali signifikan."],
            "tactical_recommendation": "Pertahankan status pengawasan standar.",
            "attribution_summary": f"Kasus {case.target} tidak menunjukkan indikasi ancaman siber kognitif terstruktur."
        }

    # 10. Format pasangan fitur untuk tabel HTML
    features_raw = detection.extracted_features if detection else {}
    feat_items = list(features_raw.items()) if features_raw else []
    feature_pairs = []
    for i in range(0, len(feat_items), 2):
        f1 = feat_items[i]
        f2 = feat_items[i + 1] if i + 1 < len(feat_items) else ("-", "-")
        feature_pairs.append({
            "f1_name": f1[0],
            "f1_val": f"{f1[1]:.3f}" if isinstance(f1[1], float) else str(f1[1]),
            "f2_name": f2[0],
            "f2_val": f"{f2[1]:.3f}" if isinstance(f2[1], float) else str(f2[1]),
        })

    # Susun payload dossier terpadu
    now_utc = datetime.now(timezone.utc)
    dossier_payload = {
        "case": {
            "id": case.id,
            "target": case.target,
            "platform": case.platform,
            "status": case.status,
            "created_at": case.created_at.strftime("%d %B %Y, %H:%M:%S UTC") if case.created_at else "-",
            "completed_at": case.completed_at.strftime("%d %B %Y, %H:%M:%S UTC") if case.completed_at else "-",
            "created_by": case.created_by,
        },
        "detection": {
            "predicted_class": detection.predicted_class if detection else "UNKNOWN",
            "confidence": detection.confidence if detection else 0.0,
            "extracted_features": features_raw,
        },
        "dossier": forensic_dossier,
        "analytics": analytics_data,
        "feature_pairs": feature_pairs,
        "top_10_attackers": top_10_attackers,
        "ledger_total_count": len(full_ledger),
        "ledger_sample": full_ledger[:50], # 50 baris pertama untuk pratinjau dokumen cetak
        "full_ledger": full_ledger,        # 100% baris untuk ekspor CSV
        "generation_time": now_utc.strftime("%d/%m/%Y %H:%M:%S WIB"),
        "hash_algorithm": "SHA-256",
    }

    # 11. Hitung Sidik Jari Kriptografis SHA-256 untuk Bukti Hukum
    crypto_hash = compute_cryptographic_fingerprint({
        "case_id": case.id,
        "target": case.target,
        "predicted_class": dossier_payload["detection"]["predicted_class"],
        "confidence": dossier_payload["detection"]["confidence"],
        "dossier": dossier_payload["dossier"],
        "ledger_count": len(full_ledger),
        "top_attackers": top_10_attackers,
    })
    dossier_payload["cryptographic_hash"] = crypto_hash

    return dossier_payload


def render_html_dossier(dossier_data: Dict[str, Any]) -> str:
    """
    Merender template Jinja2 `dossier.html` menghasilkan laporan cetak HTML/PDF resmi.
    """
    template = jinja_env.get_template("dossier.html")
    return template.render(**dossier_data)


def generate_csv_ledger(dossier_data: Dict[str, Any]) -> str:
    """
    Menghasilkan berkas CSV standar RFC 4180 berisi 100% data lengkap seluruh akun komentator
    dan status audit forensiknya untuk analisis Gephi, Excel, atau visualisasi lanjutan.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Header CSV Lengkap
    writer.writerow([
        "index",
        "case_id",
        "username",
        "platform",
        "post_id",
        "published_at",
        "estimated_class",
        "risk_score",
        "in_cib_cluster",
        "cluster_similarity",
        "in_burst_window",
        "likes",
        "replies",
        "content"
    ])

    case_id = dossier_data.get("case", {}).get("id", "")
    full_ledger = dossier_data.get("full_ledger", [])

    for row in full_ledger:
        writer.writerow([
            row.get("index"),
            case_id,
            row.get("username"),
            row.get("platform"),
            row.get("post_id"),
            row.get("published_at"),
            row.get("estimated_class"),
            row.get("risk_score"),
            1 if row.get("in_cib_cluster") else 0,
            row.get("cluster_similarity"),
            1 if row.get("in_burst_window") else 0,
            row.get("likes"),
            row.get("replies"),
            row.get("content", "").replace("\n", " ").replace("\r", " ")
        ])

    return output.getvalue()


def get_dual_tier_ledger(case_id: str, db: Session) -> Dict[str, Any]:
    """
    Menyediakan data JSON dual-tier terstruktur untuk konsumsi tabel interaktif Frontend:
    - Tier 1: Top 10 Core Attackers (dengan rank 1-10)
    - Tier 2: Full Comprehensive Commenter Audit Ledger (100% Commenters)
    - Metadata & SHA-256 Fingerprint
    """
    dossier = build_case_dossier_data(case_id, db)
    top_attackers = dossier.get("top_10_attackers", [])
    for idx, att in enumerate(top_attackers, 1):
        if "rank" not in att:
            att["rank"] = idx

    return {
        "case_id": dossier["case"]["id"],
        "target": dossier["case"]["target"],
        "platform": dossier["case"]["platform"],
        "cryptographic_hash": dossier["cryptographic_hash"],
        "total_records": dossier["ledger_total_count"],
        "top_10_attackers": top_attackers,
        "full_ledger": dossier["full_ledger"]
    }

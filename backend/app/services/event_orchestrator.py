import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import Counter
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink

from app.services.youtube_auditor import fetch_youtube_comments, detect_temporal_influx_anomaly, audit_youtube_event
from app.services.instagram_auditor import fetch_instagram_comments, audit_instagram_event
from app.services.x_auditor import fetch_x_tweet_replies, audit_x_tweet_event
from app.services.vector_store import VectorStoreService
from app.services.llm_analyst import get_llm_analyst_service
from app.services.analytics import compute_advanced_analytics

logger = logging.getLogger("axiom.event_orchestrator")


async def run_event_investigation_pipeline(
    case_id: str,
    event_url: str,
    platform: str,
    max_comments: int = 200,
) -> Dict[str, Any]:
    """
    Background Task yang mengorkestrasikan audit massal komentar postingan YouTube/Instagram:
    1. Update status kasus -> in_progress
    2. Ekstraksi komentar publik via engine masing-masing platform
    3. Deteksi Temporal Influx Anomaly (lonjakan komentar terkoordinasi di menit awal)
    4. Persistensi profil komentator unik & aktivitas komentar ke PostgreSQL
    5. Vectorize narasi ke ChromaDB & deteksi klaster copypasta CIB (Cosine Similarity >= 0.85)
    6. Identifikasi Top 10 Core Attackers (Penyerang Inti)
    7. Sintesis Intelijen Forensik & XAI via Groq Llama 3.3
    8. Simpan hasil deteksi & finalisasi kasus -> completed
    """
    logger.info(f"Memulai pipeline audit event '{case_id}' (URL: {event_url}, platform: {platform})...")

    db: Session = SessionLocal()
    try:
        case: Optional[InvestigationCase] = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
        if not case:
            logger.error(f"Kasus {case_id} tidak ditemukan di database.")
            return {"error": "Case not found"}

        case.status = "in_progress"
        db.commit()

        # ---------------------------------------------------------
        # 1. SCRAPING KOMENTAR & METADATA DARI PLATFORM
        # ---------------------------------------------------------
        host_metadata: Dict[str, Any] = {}
        pre_scraped_attackers: List[Dict[str, Any]] = []

        if platform == "youtube":
            audit_res = audit_youtube_event(event_url, max_comments=max_comments)
            comments = audit_res["comments"]
            host_metadata = audit_res.get("host_metadata", {})
            pre_scraped_attackers = audit_res.get("top_attackers", [])
        elif platform == "instagram":
            audit_res = audit_instagram_event(event_url, max_comments=max_comments)
            comments = audit_res["comments"]
            host_metadata = audit_res.get("host_metadata", {})
            pre_scraped_attackers = audit_res.get("top_attackers", [])
        elif platform == "x":
            audit_res = await audit_x_tweet_event(event_url, max_comments=max_comments)
            comments = audit_res["comments"]
            host_metadata = audit_res.get("host_metadata", {})
            pre_scraped_attackers = audit_res.get("top_attackers", [])
        else:
            raise ValueError(f"Platform tidak didukung untuk event audit: {platform}")

        total_comments = len(comments)
        logger.info(f"Berhasil menarik {total_comments} komentar dari {platform} ({event_url}).")

        # ---------------------------------------------------------
        # 2. DETEKSI TEMPORAL INFLUX ANOMALY
        # ---------------------------------------------------------
        temporal_anomaly = detect_temporal_influx_anomaly(comments, window_minutes=10)

        # ---------------------------------------------------------
        # 3. PERSISTENSI KE POSTGRESQL (Actors & Activities)
        # ---------------------------------------------------------
        # Hapus relasi sebelumnya jika ada (idempotency)
        db.query(ActorProfile).filter(ActorProfile.case_id == case_id).delete()
        db.flush()

        # Petakan author unik
        unique_author_names = list({
            c.get("author_name") or c.get("username") or "anon"
            for c in comments
        })
        unique_commenters_count = len(unique_author_names)

        pre_scraped_attacker_dates = {
            a["username"]: a.get("account_created_at")
            for a in pre_scraped_attackers if a.get("account_created_at")
        }

        actor_record_map: Dict[str, ActorProfile] = {}
        for author_name in unique_author_names:
            join_date_str = pre_scraped_attacker_dates.get(author_name)
            join_dt = None
            if join_date_str:
                try:
                    join_dt = datetime.fromisoformat(join_date_str.replace("Z", "+00:00"))
                except Exception:
                    pass

            author_profile = ActorProfile(
                case_id=case_id,
                username=author_name,
                platform=platform,
                display_name=author_name,
                followers_count=0,
                following_count=0,
                is_verified=False,
                account_created_at=join_dt
            )
            db.add(author_profile)
            actor_record_map[author_name] = author_profile
        
        db.flush()

        # Simpan seluruh komentar ke ActivityLog
        for idx, c in enumerate(comments):
            author_name = c.get("author_name") or c.get("username") or "anon"
            actor = actor_record_map.get(author_name)
            if not actor:
                continue

            pub_time = c.get("published_at") or c.get("created_at") or datetime.now(timezone.utc)
            if isinstance(pub_time, str):
                try:
                    pub_time = datetime.fromisoformat(pub_time.replace("Z", "+00:00"))
                except Exception:
                    pub_time = datetime.now(timezone.utc)

            cid = c.get("comment_id") or f"cmt_{idx}"
            activity = ActivityLog(
                actor_id=actor.id,
                platform_post_id=cid,
                activity_type="comment",
                content=c.get("text", ""),
                posted_at=pub_time,
                conversation_id=event_url,
                metrics={
                    "likes": c.get("likes") or c.get("likes_count") or 0,
                    "replies": c.get("replies") or 0
                },
                embedding_id=f"{case_id}_{actor.id}_{cid}"
            )
            db.add(activity)

        db.flush()

        # ---------------------------------------------------------
        # 4. CHROMADB EMBEDDING & KLASTERISASI CIB COPYPASTA
        # ---------------------------------------------------------
        vector_items = []
        for idx, c in enumerate(comments):
            text = str(c.get("text", "")).strip()
            author_name = c.get("author_name") or c.get("username") or "anon"
            cid = c.get("comment_id") or f"cmt_{idx}"
            if text:
                vector_items.append({
                    "id": f"{case_id}_{cid}",
                    "text": text,
                    "metadata": {
                        "actor_username": author_name,
                        "case_id": case_id,
                        "activity_type": "comment",
                        "posted_at": str(c.get("published_at") or c.get("created_at")),
                        "lang": "id"
                    }
                })

        clusters = []
        if vector_items:
            try:
                vector_store = VectorStoreService()
                vector_store.upsert_narratives(vector_items)
                clusters = vector_store.detect_semantic_clusters(case_id=case_id, threshold=0.85)

                for cl in clusters:
                    link = ClusterLink(
                        case_id=case_id,
                        source_actor=cl.get("source_actor", "unknown"),
                        target_actor=cl.get("target_actor", "unknown"),
                        similarity_score=float(cl.get("similarity_score", 0.0)),
                        link_type="semantic_copypasta",
                        evidence_snippet=cl.get("source_sample")
                    )
                    db.add(link)
                db.flush()
            except Exception as e:
                logger.warning(f"Embedding narasi event ke ChromaDB terhambat ({e}). Melanjutkan pipeline...")

        # ---------------------------------------------------------
        # 5. IDENTIFIKASI TOP 10 CORE ATTACKERS
        # ---------------------------------------------------------
        # Hitung frekuensi komentar per akun
        comment_counts = Counter(
            c.get("author_name") or c.get("username") or "anon"
            for c in comments
        )

        # Hitung keterlibatan dalam klaster copypasta
        cluster_actor_counter = Counter()
        for cl in clusters:
            src = cl.get("source_actor")
            tgt = cl.get("target_actor")
            if src:
                cluster_actor_counter[src] += 1
            if tgt:
                cluster_actor_counter[tgt] += 1

        # Cek akun yang beroperasi saat rentang burst temporal
        burst_actors = set()
        if temporal_anomaly.get("is_anomaly") and temporal_anomaly.get("peak_window_start"):
            try:
                pw_start = datetime.fromisoformat(temporal_anomaly["peak_window_start"])
                pw_end = datetime.fromisoformat(temporal_anomaly["peak_window_end"])
                for c in comments:
                    c_time = c.get("published_at") or c.get("created_at")
                    if isinstance(c_time, datetime) and (pw_start <= c_time <= pw_end):
                        burst_actors.add(c.get("author_name") or c.get("username") or "anon")
            except Exception:
                pass

        # Ranking skor kecurigaan untuk penyerang inti
        ranked_attackers = []
        for author in unique_author_names:
            c_freq = comment_counts.get(author, 0)
            cl_freq = cluster_actor_counter.get(author, 0)
            in_burst = author in burst_actors

            # Skor risiko tertimbang
            risk_score = round(
                (min(1.0, c_freq / 5.0) * 0.3) +
                (min(1.0, cl_freq / 2.0) * 0.5) +
                (0.2 if in_burst else 0.0),
                2
            )

            if risk_score > 0.15 or c_freq > 1 or cl_freq > 0:
                ranked_attackers.append({
                    "username": author,
                    "comment_count": c_freq,
                    "cluster_connections": cl_freq,
                    "posted_in_burst_window": in_burst,
                    "risk_score": risk_score,
                    "estimated_category": "BUZZER" if cl_freq > 0 else ("BOT" if in_burst else "SUSPICIOUS")
                })

        ranked_attackers.sort(key=lambda x: (x["risk_score"], x["cluster_connections"], x["comment_count"]), reverse=True)
        top_10_attackers = ranked_attackers[:10]

        # ---------------------------------------------------------
        # 6. SINTESIS INTELIJEN FORENSIK (GROQ LLAMA 3.3)
        # ---------------------------------------------------------
        llm_service = get_llm_analyst_service()
        dossier = llm_service.generate_event_forensic_dossier(
            event_url=event_url,
            platform=platform,
            total_comments=total_comments,
            unique_commenters=unique_commenters_count,
            temporal_anomaly=temporal_anomaly,
            cib_clusters=clusters,
            top_attackers=top_10_attackers,
            sample_comments=comments[:15]
        )
        dossier_data = dossier.model_dump()

        # Simpan hasil deteksi agregat ke DetectionResult
        overall_threat = "BUZZER" if (len(clusters) > 0 or len(top_10_attackers) >= 3) else ("BOT" if temporal_anomaly.get("is_anomaly") else "HUMAN")
        confidence = 0.92 if overall_threat == "BUZZER" else (0.85 if overall_threat == "BOT" else 0.75)

        detection = DetectionResult(
            case_id=case_id,
            actor_username=f"EVENT_{platform.upper()}",
            predicted_class=overall_threat,
            confidence=confidence,
            class_probabilities={
                "BUZZER": 0.85 if overall_threat == "BUZZER" else 0.10,
                "BOT": 0.80 if overall_threat == "BOT" else 0.15,
                "HUMAN": 0.75 if overall_threat == "HUMAN" else 0.05
            },
            extracted_features={
                "total_comments": float(total_comments),
                "unique_commenters": float(unique_commenters_count),
                "burst_ratio": float(temporal_anomaly.get("burst_ratio", 0.0)),
                "anomaly_score": float(temporal_anomaly.get("anomaly_score", 0.0)),
                "cluster_links_count": float(len(clusters)),
                "top_attackers_count": float(len(top_10_attackers))
            },
            threat_attribution={
                "forensic_dossier": dossier_data,
                "temporal_anomaly": temporal_anomaly,
                "top_attackers": top_10_attackers
            }
        )
        db.add(detection)

        # ---------------------------------------------------------
        # 7. FINALISASI STATUS KASUS
        # ---------------------------------------------------------
        # Analitik Mendalam (Circadian, Entropy, Narrative Drift)
        analytics_data = compute_advanced_analytics(comments)

        summary = {
            "target": event_url,
            "platform": platform,
            "host_metadata": host_metadata,
            "total_comments": total_comments,
            "unique_commenters": unique_commenters_count,
            "temporal_anomaly": temporal_anomaly,
            "cib_clusters_count": len(clusters),
            "top_10_attackers": top_10_attackers,
            "forensic_dossier": dossier_data,
            "predicted_class": overall_threat,
            "confidence": confidence,
            "analytics": analytics_data
        }

        case.status = "completed"
        case.completed_at = datetime.now(timezone.utc)
        case.result_summary = summary
        db.commit()

        logger.info(
            f"Pipeline audit event '{case_id}' selesai. "
            f"Komentar: {total_comments}, Klaster: {len(clusters)}, Threat: {dossier.threat_level}"
        )
        return summary

    except Exception as e:
        logger.error(f"Kegagalan fatal pada pipeline audit event '{case_id}': {e}", exc_info=True)
        db.rollback()
        try:
            case = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
            if case:
                case.status = "failed"
                case.completed_at = datetime.now(timezone.utc)
                case.result_summary = {"error": str(e)}
                db.commit()
        except Exception:
            pass
        return {"error": str(e)}
    finally:
        db.close()

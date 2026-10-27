import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink

from app.services.scraper.x_scraper import XScraperService
from app.services.vector_store import VectorStoreService
from app.services.features import extract_actor_features
from app.services.classifier import get_classifier
from app.services.llm_analyst import get_llm_analyst_service

logger = logging.getLogger("axiom.orchestrator")


async def run_investigation_pipeline(
    case_id: str,
    target: str,
    platform: str = "x",
    max_interactions: int = 150,
) -> Dict[str, Any]:
    """
    Background Task yang mengorkestrasikan seluruh alur investigasi intelijen:
    1. Update status kasus -> in_progress
    2. Scraping profil & cuitan via XScraper (dengan auto-fallback ke mock)
    3. Simpan data profil & aktivitas ke PostgreSQL
    4. Simpan narasi & embedding ke ChromaDB
    5. Analisis klaster koordinasi CIB (Copypasta)
    6. Ekstraksi 21 fitur statistik & inferensi XGBoost (HUMAN, BOT, BUZZER)
    7. Sintesis Intelijen Forensik & XAI via Groq Llama 3.3
    8. Simpan hasil deteksi & finalisasi kasus -> completed
    """
    logger.info(f"Memulai pipeline investigasi untuk kasus '{case_id}' (target: @{target})...")
    
    db: Session = SessionLocal()
    try:
        case: Optional[InvestigationCase] = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
        if not case:
            logger.error(f"Kasus {case_id} tidak ditemukan di database.")
            return {"error": "Case not found"}

        case.status = "in_progress"
        db.commit()

        # ---------------------------------------------------------
        # 1. SCRAPING DATA TARGET
        # ---------------------------------------------------------
        scraper = XScraperService()
        logger.info(f"Mengambil profil target @{target}...")
        try:
            profile_data = await scraper.get_user_profile(target)
            tweets_data = await scraper.get_user_tweets(target, count=max_interactions)
            replies_data = await scraper.get_user_replies(target, count=min(50, max_interactions))
        except Exception as e:
            logger.warning(f"Scraping live gagal ({e}). Menggunakan data fallback mock...")
            from app.services.scraper.mock_data import get_mock_data
            mock = get_mock_data(target)
            profile_data = mock["profile"]
            tweets_data = mock["tweets"]
            replies_data = []

        # Gabungkan aktivitas dan deduplikasi berdasarkan platform_post_id
        seen_ids = set()
        all_activities: List[Dict[str, Any]] = []
        for t in tweets_data + replies_data:
            pid = t.get("platform_post_id") or f"act_{len(seen_ids)}"
            if pid not in seen_ids:
                seen_ids.add(pid)
                all_activities.append(t)

        # ---------------------------------------------------------
        # 2. PERSISTENSI KE POSTGRESQL (Actor & Activities)
        # ---------------------------------------------------------
        # Hapus actor lama pada case yang sama jika ada (idempotency)
        db.query(ActorProfile).filter(ActorProfile.case_id == case_id).delete()
        db.flush()

        actor = ActorProfile(
            case_id=case_id,
            username=profile_data.get("username", target),
            platform=platform,
            display_name=profile_data.get("display_name"),
            bio=profile_data.get("bio"),
            followers_count=profile_data.get("followers_count", 0),
            following_count=profile_data.get("following_count", 0),
            is_verified=profile_data.get("is_verified", False),
            account_created_at=profile_data.get("account_created_at"),
            profile_metadata=profile_data.get("profile_metadata")
        )
        db.add(actor)
        db.flush()

        for act in all_activities:
            activity = ActivityLog(
                actor_id=actor.id,
                platform_post_id=act.get("platform_post_id"),
                activity_type=act.get("activity_type", "tweet"),
                content=act.get("content", ""),
                posted_at=act.get("posted_at") or datetime.now(timezone.utc),
                in_reply_to_user=act.get("in_reply_to_user"),
                conversation_id=act.get("conversation_id"),
                metrics=act.get("metrics"),
                embedding_id=f"{case_id}_{actor.id}_{act.get('platform_post_id')}"
            )
            db.add(activity)
        db.flush()

        # ---------------------------------------------------------
        # 3. CHROMADB EMBEDDING & DETEKSI KLASTER CIB
        # ---------------------------------------------------------
        vector_items = []
        for idx, act in enumerate(all_activities):
            content = str(act.get("content", "")).strip()
            if content:
                vector_items.append({
                    "id": f"{case_id}_{actor.username}_{act.get('platform_post_id') or idx}",
                    "text": content,
                    "metadata": {
                        "actor_username": actor.username,
                        "case_id": case_id,
                        "activity_type": act.get("activity_type", "tweet"),
                        "posted_at": str(act.get("posted_at")),
                        "lang": act.get("lang", "in")
                    }
                })

        cluster_links_count = 0
        max_similarity = 0.0
        cluster_size = 1.0

        if vector_items:
            try:
                vector_store = VectorStoreService()
                vector_store.upsert_narratives(vector_items)
                clusters = vector_store.detect_semantic_clusters(case_id=case_id, threshold=0.85)

                for cl in clusters:
                    sim = float(cl.get("similarity_score", 0.0))
                    if sim > max_similarity:
                        max_similarity = sim
                    link = ClusterLink(
                        case_id=case_id,
                        source_actor=cl.get("source_actor", actor.username),
                        target_actor=cl.get("target_actor", "unknown"),
                        similarity_score=sim,
                        link_type="semantic_copypasta",
                        evidence_snippet=cl.get("source_sample")
                    )
                    db.add(link)
                
                cluster_links_count = len(clusters)
                if cluster_links_count > 0:
                    cluster_size = float(cluster_links_count + 1)
                db.flush()
            except Exception as e:
                logger.warning(f"Proses ChromaDB / deteksi klaster mengalami kendala ({e}). Melanjutkan pipeline...")

        # ---------------------------------------------------------
        # 4. EKSTRAKSI FITUR & INFERENSI XGBOOST
        # ---------------------------------------------------------
        cluster_info = {
            "max_semantic_similarity": max_similarity,
            "cluster_size": cluster_size
        }
        features = extract_actor_features(
            actor_profile=profile_data,
            activities=all_activities,
            cluster_info=cluster_info
        )

        classifier = get_classifier()
        predicted_class, confidence, class_probs, top_features = classifier.predict(features)

        # ---------------------------------------------------------
        # 5. SINTESIS FORENSIK INTELIJEN (GROQ LLAMA 3.3)
        # ---------------------------------------------------------
        llm_service = get_llm_analyst_service()
        dossier = llm_service.generate_forensic_dossier(
            target=actor.username,
            platform=platform,
            predicted_class=predicted_class,
            confidence=confidence,
            features=features,
            top_xai_features=top_features,
            sample_activities=all_activities,
            cluster_info=cluster_info
        )
        dossier_data = dossier.model_dump()

        # Simpan hasil deteksi & XAI
        detection = DetectionResult(
            case_id=case_id,
            actor_username=actor.username,
            predicted_class=predicted_class,
            confidence=confidence,
            class_probabilities=class_probs,
            extracted_features=features,
            threat_attribution={
                "top_features": top_features,
                "forensic_dossier": dossier_data
            }
        )
        db.add(detection)

        # ---------------------------------------------------------
        # 6. FINALISASI STATUS KASUS
        # ---------------------------------------------------------
        summary = {
            "target": target,
            "platform": platform,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "class_probabilities": class_probs,
            "total_activities": len(all_activities),
            "cluster_links_count": cluster_links_count,
            "top_features": top_features,
            "forensic_dossier": dossier_data
        }
        case.status = "completed"
        case.completed_at = datetime.now(timezone.utc)
        case.result_summary = summary
        db.commit()

        logger.info(f"Pipeline investigasi kasus '{case_id}' selesai. Hasil: {predicted_class} ({confidence * 100:.1f}%), Threat: {dossier.threat_level}")
        return summary

    except Exception as e:
        logger.error(f"Kegagalan fatal pada pipeline investigasi '{case_id}': {e}", exc_info=True)
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

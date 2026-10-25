import pytest
from datetime import datetime, timezone
from app.db.session import SessionLocal
from app.models.user import User
from app.models.audit import AuditLog
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink
from app.models.watchlist import Watchlist
from app.core.security import hash_password


def test_database_connection_and_crud():
    """Uji coba koneksi database, pembuatan relasi, dan integritas data ORM."""
    db = SessionLocal()
    try:
        # 1. Test User Creation
        ts = int(datetime.now().timestamp())
        test_username = f"analyst_test_{ts}"
        user = User(
            username=test_username,
            hashed_password=hash_password("Secret123!"),
            role="user",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        assert user.id is not None
        assert user.username == test_username
        assert user.role == "user"

        # 2. Test AuditLog Creation
        audit = AuditLog(
            operator_username=user.username,
            action="INVESTIGATE_TARGET",
            target="x:test_target",
            ip_address="127.0.0.1",
            details={"depth": 100},
            status="SUCCESS"
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        assert audit.id is not None
        assert audit.action == "INVESTIGATE_TARGET"

        # 3. Test InvestigationCase and Relationships
        case = InvestigationCase(
            target=f"target_buzz_{ts}",
            platform="x",
            status="queued",
            max_interactions=150,
            depth_level=2,
            created_by=user.username
        )
        db.add(case)
        db.commit()
        db.refresh(case)
        assert case.id is not None

        # 4. Test ActorProfile linked to Case
        actor = ActorProfile(
            case_id=case.id,
            username=f"target_buzz_{ts}",
            platform="x",
            display_name="Target Buzzer",
            followers_count=120,
            following_count=450,
            is_verified=False
        )
        db.add(actor)
        db.commit()
        db.refresh(actor)
        assert actor.id is not None
        assert actor.case_id == case.id

        # 5. Test ActivityLog linked to Actor
        activity = ActivityLog(
            actor_id=actor.id,
            platform_post_id=f"tweet_{ts}_01",
            activity_type="tweet",
            content="Narasi terkoordinasi disinformasi siber.",
            posted_at=datetime.now(timezone.utc),
            metrics={"likes": 5, "retweets": 12}
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        assert activity.id is not None
        assert activity.actor_id == actor.id

        # 6. Test DetectionResult linked to Case
        detection = DetectionResult(
            case_id=case.id,
            actor_username=actor.username,
            predicted_class="BUZZER",
            confidence=0.92,
            class_probabilities={"bot": 0.04, "buzzer": 0.92, "human": 0.04},
            extracted_features={"temporal_entropy": 2.14}
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)
        assert detection.id is not None
        assert detection.predicted_class == "BUZZER"

        # 7. Test ClusterLink
        link = ClusterLink(
            case_id=case.id,
            source_actor=actor.username,
            target_actor=f"coordinated_bot_{ts}",
            similarity_score=0.88,
            link_type="semantic_copypasta",
            evidence_snippet="Pola kata identik 88%"
        )
        db.add(link)
        db.commit()
        db.refresh(link)
        assert link.id is not None

        # 8. Test Watchlist
        watch = Watchlist(
            username=f"watch_{actor.username}",
            platform="x",
            tag="psyops_investigation",
            notes="Akun buzzer terkoordinasi.",
            added_by=user.username
        )
        db.add(watch)
        db.commit()
        db.refresh(watch)
        assert watch.id is not None

    finally:
        db.close()

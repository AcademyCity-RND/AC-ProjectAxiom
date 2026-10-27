import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.models.detection import DetectionResult
from app.core.security import create_access_token

from app.services.youtube_auditor import (
    extract_youtube_video_id,
    detect_temporal_influx_anomaly,
    generate_mock_youtube_comments,
    fetch_youtube_comments,
)
from app.services.instagram_auditor import (
    extract_instagram_shortcode,
    generate_mock_instagram_comments,
    fetch_instagram_comments,
)
from app.services.event_orchestrator import run_event_investigation_pipeline
from app.schemas.investigation import EventInvestigationRequest


# --------------------------------------------------------------------------
# 1. TEST URL EXTRACTION & VALIDATION
# --------------------------------------------------------------------------
def test_extract_youtube_video_id():
    # Format watch?v=
    assert extract_youtube_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    # Format youtu.be/
    assert extract_youtube_video_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    # Format /shorts/
    assert extract_youtube_video_id("https://www.youtube.com/shorts/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    # Format /embed/
    assert extract_youtube_video_id("https://www.youtube.com/embed/dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    # Raw 11-char ID
    assert extract_youtube_video_id("dQw4w9WgXcQ") == "dQw4w9WgXcQ"
    # URL tidak valid
    assert extract_youtube_video_id("https://google.com") is None
    assert extract_youtube_video_id("") is None


def test_extract_instagram_shortcode():
    # Format /p/
    assert extract_instagram_shortcode("https://www.instagram.com/p/C_abc123XYZ/") == "C_abc123XYZ"
    # Format /reel/
    assert extract_instagram_shortcode("https://www.instagram.com/reel/DA987654321/") == "DA987654321"
    # Format /tv/
    assert extract_instagram_shortcode("https://www.instagram.com/tv/DB112233445/") == "DB112233445"
    # Raw shortcode
    assert extract_instagram_shortcode("C_abc123XYZ") == "C_abc123XYZ"
    # URL tidak valid
    assert extract_instagram_shortcode("https://twitter.com/post/123") is None
    assert extract_instagram_shortcode("") is None


# --------------------------------------------------------------------------
# 2. TEST TEMPORAL INFLUX ANOMALY DETECTION
# --------------------------------------------------------------------------
def test_detect_temporal_influx_anomaly_normal():
    # Distribusi waktu komentar menyebar alami (1 komentar tiap 15 menit)
    base = datetime.now(timezone.utc) - timedelta(hours=5)
    comments = [
        {"published_at": base + timedelta(minutes=i * 15), "text": f"Komentar normal {i}"}
        for i in range(20)
    ]
    res = detect_temporal_influx_anomaly(comments, window_minutes=10)
    assert res["total_comments"] == 20
    assert res["is_anomaly"] is False
    assert res["burst_ratio"] < 0.25


def test_detect_temporal_influx_anomaly_burst():
    # Distribusi waktu dengan lonjakan tajam (30 komentar dalam 5 menit)
    base = datetime.now(timezone.utc) - timedelta(hours=2)
    comments = []
    # 30 komentar burst
    for i in range(30):
        comments.append({
            "published_at": base + timedelta(seconds=i * 8), # dalam 4 menit
            "text": f"Komentar serbuan bot {i}"
        })
    # 10 komentar organik sesudahnya
    for i in range(10):
        comments.append({
            "published_at": base + timedelta(minutes=20 + (i * 10)),
            "text": f"Komentar organik {i}"
        })

    res = detect_temporal_influx_anomaly(comments, window_minutes=10)
    assert res["total_comments"] == 40
    assert res["is_anomaly"] is True
    assert res["burst_ratio"] >= 0.60
    assert res["anomaly_score"] > 0.5
    assert "lonjakan temporal" in res["explanation"].lower()


def test_detect_temporal_influx_anomaly_empty():
    res = detect_temporal_influx_anomaly([])
    assert res["total_comments"] == 0
    assert res["is_anomaly"] is False
    assert res["peak_burst_count"] == 0


# --------------------------------------------------------------------------
# 3. TEST SCRAPER & FALLBACK ENGINE
# --------------------------------------------------------------------------
def test_fetch_youtube_comments_mock_fallback():
    # Memastikan fallback mock berfungsi jika library raise exception / offline
    with patch("youtube_comment_downloader.YoutubeCommentDownloader.get_comments_from_url", side_effect=RuntimeError("Offline")):
        comments = fetch_youtube_comments("https://www.youtube.com/watch?v=dQw4w9WgXcQ", max_comments=30)
        assert len(comments) == 30
        assert comments[0]["platform"] == "youtube"
        assert "comment_id" in comments[0]
        assert "published_at" in comments[0]


def test_fetch_instagram_comments_mock_fallback():
    # Memastikan fallback mock Instagram berfungsi
    with patch("instaloader.Post.from_shortcode", side_effect=Exception("Login required")):
        comments = fetch_instagram_comments("https://www.instagram.com/p/DA12345XYZ/", max_comments=25)
        assert len(comments) == 25
        assert comments[0]["platform"] == "instagram"
        assert "username" in comments[0]
        assert "created_at" in comments[0]


# --------------------------------------------------------------------------
# 4. TEST ANTI-SSRF & SCHEMA VALIDATION
# --------------------------------------------------------------------------
def test_event_investigation_schema_anti_ssrf():
    # Valid YouTube & Instagram
    req_yt = EventInvestigationRequest(url="https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert req_yt.detected_platform.value == "youtube"

    req_ig = EventInvestigationRequest(url="https://www.instagram.com/p/DA12345XYZ/")
    assert req_ig.detected_platform.value == "instagram"

    # Rejection of localhost
    with pytest.raises(ValueError, match="Anti-SSRF"):
        EventInvestigationRequest(url="http://localhost:8000/secret")

    # Rejection of internal private IP
    with pytest.raises(ValueError, match="Anti-SSRF"):
        EventInvestigationRequest(url="http://192.168.1.1/admin")

    # Rejection of non-whitelisted domain
    with pytest.raises(ValueError, match="tidak didukung"):
        EventInvestigationRequest(url="https://malicious-domain.com/video")


# --------------------------------------------------------------------------
# 5. TEST API ENDPOINT (POST /api/v1/investigate/event)
# --------------------------------------------------------------------------
def test_post_event_investigation_endpoint():
    client = TestClient(app)
    token = create_access_token(subject="operator_siber", role="user")
    headers = {"Authorization": f"Bearer {token}"}

    # Patch background pipeline agar eksekusi instan
    with patch("app.api.v1.endpoints.investigate.run_event_investigation_pipeline") as mock_pipeline:
        mock_pipeline.return_value = None
        response = client.post(
            "/api/v1/investigate/event",
            headers=headers,
            json={
                "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "max_comments": 50,
                "depth_level": 1
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        assert data["platform"] == "youtube"
        assert "case_id" in data


def test_post_event_investigation_ssrf_rejection():
    client = TestClient(app)
    token = create_access_token(subject="operator_siber", role="user")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/investigate/event",
        headers=headers,
        json={
            "url": "http://127.0.0.1:8000/api/v1/users",
            "max_comments": 50
        }
    )
    assert response.status_code == 422


# --------------------------------------------------------------------------
# 6. TEST FULL PIPELINE INTEGRATION
# --------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_full_event_investigation_pipeline():
    db = SessionLocal()
    case_id = "test_event_case_001"

    # Setup kasus dummy di database
    db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
    db.commit()

    case = InvestigationCase(
        id=case_id,
        target="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        platform="youtube",
        status="queued",
        max_interactions=40,
        created_by="operator_test"
    )
    db.add(case)
    db.commit()
    db.close()

    try:
        # Jalankan pipeline orkestrasi
        summary = await run_event_investigation_pipeline(
            case_id=case_id,
            event_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            platform="youtube",
            max_comments=40
        )

        assert "total_comments" in summary
        assert summary["total_comments"] > 0
        assert "temporal_anomaly" in summary
        assert "forensic_dossier" in summary
        assert "top_10_attackers" in summary

        # Verifikasi persistensi database
        db = SessionLocal()
        saved_case = db.query(InvestigationCase).filter(InvestigationCase.id == case_id).first()
        assert saved_case is not None
        assert saved_case.status == "completed"

        actors = db.query(ActorProfile).filter(ActorProfile.case_id == case_id).all()
        assert len(actors) > 0

        activities = db.query(ActivityLog).join(ActorProfile).filter(ActorProfile.case_id == case_id).all()
        assert len(activities) > 0

        detection = db.query(DetectionResult).filter(DetectionResult.case_id == case_id).first()
        assert detection is not None
        assert "forensic_dossier" in detection.threat_attribution
        db.close()

    finally:
        # Cleanup
        db = SessionLocal()
        db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
        db.commit()
        db.close()

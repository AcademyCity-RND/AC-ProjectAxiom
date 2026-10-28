from unittest.mock import patch
import pytest
import uuid
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.core.rate_limiter import InMemoryRateLimiter
from app.db.session import SessionLocal
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink
from app.services.investigation_orchestrator import run_investigation_pipeline

client = TestClient(app)


@pytest.fixture
def auth_headers():
    """Menyediakan token JWT terautentikasi untuk role user/investigator."""
    token = create_access_token(subject="investigator_tester", role="user")
    return {"Authorization": f"Bearer {token}"}


def test_rate_limiter_logic():
    """Menguji logika batas request (Sliding Window) pada InMemoryRateLimiter."""
    limiter = InMemoryRateLimiter(requests_per_minute=3, window_seconds=60)
    client_key = "test_user_ip_1"

    # Request 1, 2, 3 diizinkan
    allowed1, rem1, retry1 = limiter.is_allowed(client_key)
    assert allowed1 is True
    assert rem1 == 2

    allowed2, rem2, retry2 = limiter.is_allowed(client_key)
    assert allowed2 is True
    assert rem2 == 1

    allowed3, rem3, retry3 = limiter.is_allowed(client_key)
    assert allowed3 is True
    assert rem3 == 0

    # Request 4 ditolak
    allowed4, rem4, retry4 = limiter.is_allowed(client_key)
    assert allowed4 is False
    assert rem4 == 0
    assert retry4 > 0


def test_post_investigate_actor_success(auth_headers):
    """Menguji pemanggilan POST /api/v1/investigate/actor dengan input valid."""
    payload = {
        "platform": "x",
        "target": "infiltrator_01",
        "max_interactions": 100,
        "depth_level": 2
    }
    with patch("app.api.v1.endpoints.investigate.run_investigation_pipeline") as mock_pipeline:
        response = client.post("/api/v1/investigate/actor", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "queued"
        assert "case_id" in data
        assert data["sanitized_target"] == "infiltrator_01"
        assert data["platform"] == "x"
        mock_pipeline.assert_called_once()

    # Verifikasi kasus tersimpan di database
    db = SessionLocal()
    try:
        case = db.query(InvestigationCase).filter(InvestigationCase.id == data["case_id"]).first()
        assert case is not None
        assert case.target == "infiltrator_01"
        assert case.status in ("queued", "in_progress", "completed")
    finally:
        db.close()


def test_post_investigate_rate_limiting(auth_headers):
    """Menguji penolakan HTTP 429 jika melebihi kuota 10 request/menit."""
    # Gunakan token dengan sub unik agar tidak berbenturan dengan test lain
    token = create_access_token(subject=f"spam_operator_{uuid.uuid4().hex[:6]}", role="user")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "platform": "x",
        "target": "target_user",
        "max_interactions": 50,
        "depth_level": 1
    }

    with patch("app.api.v1.endpoints.investigate.run_investigation_pipeline"):
        # Kirim 10 request cepat (semua harus 200)
        for _ in range(10):
            res = client.post("/api/v1/investigate/actor", json=payload, headers=headers)
            assert res.status_code == 200

        # Request ke-11 harus 429
        res_limit = client.post("/api/v1/investigate/actor", json=payload, headers=headers)
        assert res_limit.status_code == 429
        assert "Retry-After" in res_limit.headers
        assert res_limit.headers.get("X-RateLimit-Remaining") == "0"


def test_post_investigate_invalid_target_regex(auth_headers):
    """Menguji validasi regex input ilegal dan percobaan SSRF."""
    # Karakter ilegal pada username
    res_illegal = client.post("/api/v1/investigate/actor", json={
        "platform": "x",
        "target": "bad;user--injection",
        "max_interactions": 50
    }, headers=auth_headers)
    assert res_illegal.status_code == 422

    # SSRF IP internal
    res_ssrf = client.post("/api/v1/investigate/actor", json={
        "platform": "x",
        "target": "http://192.168.1.1/profile",
        "max_interactions": 50
    }, headers=auth_headers)
    assert res_ssrf.status_code == 422


@pytest.mark.asyncio
async def test_investigation_orchestrator_pipeline_flow():
    """Menguji eksekusi end-to-end background pipeline orchestrator."""
    case_id = str(uuid.uuid4())
    db = SessionLocal()
    try:
        # Siapkan case awal
        case = InvestigationCase(
            id=case_id,
            target="infiltrator_01",
            platform="x",
            status="queued",
            created_at=datetime.now(timezone.utc)
        )
        db.add(case)
        db.commit()

        # Eksekusi pipeline
        summary = await run_investigation_pipeline(
            case_id=case_id,
            target="infiltrator_01",
            platform="x",
            max_interactions=50
        )

        assert "error" not in summary
        assert summary["predicted_class"] in ("BOT", "BUZZER", "HUMAN")
        assert summary["confidence"] > 0.5
        assert "class_probabilities" in summary

        # Cek data di database
        db.refresh(case)
        assert case.status == "completed"
        assert case.completed_at is not None
        assert case.result_summary is not None

        actor = db.query(ActorProfile).filter(ActorProfile.case_id == case_id).first()
        assert actor is not None
        assert actor.username == "infiltrator_01"

        detection = db.query(DetectionResult).filter(DetectionResult.case_id == case_id).first()
        assert detection is not None
        assert detection.predicted_class == summary["predicted_class"]
        assert len(detection.extracted_features) == 21
    finally:
        db.close()


def test_get_investigation_case_detail_and_graph(auth_headers):
    """Menguji endpoint GET /api/v1/investigate/{case_id} dan format Cytoscape graf."""
    case_id = str(uuid.uuid4())
    db = SessionLocal()
    try:
        # Buat dummy data investigasi selesai
        case = InvestigationCase(
            id=case_id,
            target="relawan_buzzer_1",
            platform="x",
            status="completed",
            created_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            result_summary={"predicted_class": "BUZZER", "confidence": 0.95}
        )
        db.add(case)
        db.flush()

        actor = ActorProfile(
            case_id=case_id,
            username="relawan_buzzer_1",
            platform="x",
            followers_count=1000,
            following_count=1500,
            is_verified=False
        )
        db.add(actor)

        detection = DetectionResult(
            case_id=case_id,
            actor_username="relawan_buzzer_1",
            predicted_class="BUZZER",
            confidence=0.95,
            class_probabilities={"BUZZER": 0.95, "BOT": 0.03, "HUMAN": 0.02},
            extracted_features={"cluster_size": 5.0, "max_semantic_similarity": 0.92},
            threat_attribution={"top_features": [{"feature": "cluster_size", "importance": 0.25}]}
        )
        db.add(detection)

        # Tambahkan link klaster CIB
        link = ClusterLink(
            case_id=case_id,
            source_actor="relawan_buzzer_1",
            target_actor="relawan_buzzer_2",
            similarity_score=0.92,
            link_type="semantic_copypasta",
            evidence_snippet="Narasi terkoordinasi pemilu siber."
        )
        db.add(link)
        db.commit()

        # 1. Uji GET /api/v1/investigate/{case_id}
        res_case = client.get(f"/api/v1/investigate/{case_id}", headers=auth_headers)
        assert res_case.status_code == 200
        case_data = res_case.json()
        assert case_data["case_id"] == case_id
        assert case_data["status"] == "completed"
        assert case_data["actor"]["username"] == "relawan_buzzer_1"
        assert case_data["detection"]["predicted_class"] == "BUZZER"

        # 2. Uji GET /api/v1/investigate/{case_id}/graph
        res_graph1 = client.get(f"/api/v1/investigate/{case_id}/graph", headers=auth_headers)
        assert res_graph1.status_code == 200
        graph1 = res_graph1.json()
        assert graph1["case_id"] == case_id
        assert graph1["total_nodes"] == 2
        assert graph1["total_edges"] == 1
        assert "nodes" in graph1["elements"]
        assert "edges" in graph1["elements"]

        # 3. Uji GET /api/v1/network/graph/{case_id}
        res_graph2 = client.get(f"/api/v1/network/graph/{case_id}", headers=auth_headers)
        assert res_graph2.status_code == 200
        graph2 = res_graph2.json()
        assert graph2["total_nodes"] == 2
        assert graph2["total_edges"] == 1

        # Cek detail node Cytoscape
        target_node = graph2["elements"]["nodes"][0]["data"]
        assert target_node["id"] == "actor_relawan_buzzer_1"
        assert target_node["class_label"] == "BUZZER"
        assert target_node["color"] == "#ef4444"

        # Cek edge
        edge = graph2["elements"]["edges"][0]["data"]
        assert edge["source"] == "actor_relawan_buzzer_1"
        assert edge["target"] == "actor_relawan_buzzer_2"
        assert edge["weight"] == 0.92
    finally:
        db.close()


def test_get_nonexistent_case(auth_headers):
    """Memastikan 404 jika kasus tidak ditemukan."""
    random_id = str(uuid.uuid4())
    res = client.get(f"/api/v1/investigate/{random_id}", headers=auth_headers)
    assert res.status_code == 404

    res_graph = client.get(f"/api/v1/network/graph/{random_id}", headers=auth_headers)
    assert res_graph.status_code == 404


def test_get_investigation_stats(auth_headers):
    """Menguji endpoint statistik agregat sistem /api/v1/investigate/stats."""
    res = client.get("/api/v1/investigate/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_cases" in data
    assert "completed_cases" in data
    assert "total_actors" in data
    assert "bot_count" in data
    assert "buzzer_count" in data
    assert "human_count" in data
    assert "avg_confidence" in data
    assert "model_accuracy" in data
    assert data["system_status"] == "ONLINE"


def test_list_investigation_cases(auth_headers):
    """Menguji endpoint daftar riwayat kasus riil /api/v1/investigate/cases."""
    res = client.get("/api/v1/investigate/cases?limit=10&offset=0", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "cases" in data
    assert isinstance(data["cases"], list)


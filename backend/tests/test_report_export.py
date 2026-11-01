import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.models.detection import DetectionResult
from app.models.cluster import ClusterLink
from app.core.security import create_access_token
from app.services.report_exporter import (
    compute_cryptographic_fingerprint,
    build_case_dossier_data,
    render_html_dossier,
    generate_csv_ledger,
    get_dual_tier_ledger,
)


# --------------------------------------------------------------------------
# 1. TEST CRYPTOGRAPHIC HASHING & INTEGRITY
# --------------------------------------------------------------------------
def test_cryptographic_fingerprint_deterministic_and_tamper_evident():
    data1 = {"case_id": "case_101", "verdict": "BUZZER", "score": 0.95}
    data2 = {"case_id": "case_101", "verdict": "BUZZER", "score": 0.95}
    data_tampered = {"case_id": "case_101", "verdict": "HUMAN", "score": 0.95}

    h1 = compute_cryptographic_fingerprint(data1)
    h2 = compute_cryptographic_fingerprint(data2)
    h_tampered = compute_cryptographic_fingerprint(data_tampered)

    # Bersifat deterministik
    assert h1 == h2
    assert len(h1) == 64 # 64 hex chars SHA-256
    # Sensitif terhadap modifikasi data
    assert h1 != h_tampered


# --------------------------------------------------------------------------
# 2. TEST DOSSIER DATA BUILDER & DUAL-TIER STRUCTURE
# --------------------------------------------------------------------------
def test_build_case_dossier_data():
    db = SessionLocal()
    case_id = "test_dossier_case_001"

    # Bersihkan jika ada
    db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
    db.commit()

    case = InvestigationCase(
        id=case_id,
        target="target_propaganda",
        platform="youtube",
        status="completed",
        created_by="analis_siber",
        result_summary={
            "forensic_dossier": {
                "threat_level": "CRITICAL",
                "primary_agenda": "Disinformasi Kedaulatan Negara",
                "target_institution": "TNI AD",
                "evidence_points": ["Lonjakan komentar terkoordinasi", "Klaster narasi 89%"],
                "tactical_recommendation": "Blokir akun dan lakukan kontra-narasi",
                "attribution_summary": "Operasi siber kognitif terstruktur"
            }
        }
    )
    db.add(case)
    db.flush()

    actor = ActorProfile(
        case_id=case_id,
        username="buzzer_utama_01",
        platform="youtube",
        display_name="Buzzer Utama"
    )
    db.add(actor)
    db.flush()

    for i in range(5):
        act = ActivityLog(
            actor_id=actor.id,
            platform_post_id=f"yt_cmt_{i}",
            activity_type="comment",
            content=f"Narasi provokatif serbuan bot ke-{i}",
            posted_at=datetime.now(timezone.utc)
        )
        db.add(act)

    link = ClusterLink(
        case_id=case_id,
        source_actor="buzzer_utama_01",
        target_actor="buzzer_sekunder_02",
        similarity_score=0.91,
        link_type="semantic_copypasta"
    )
    db.add(link)

    detection = DetectionResult(
        case_id=case_id,
        actor_username="buzzer_utama_01",
        predicted_class="BUZZER",
        confidence=0.94,
        extracted_features={"retweet_ratio": 0.85, "posts_per_day": 45.0}
    )
    db.add(detection)
    db.commit()

    try:
        dossier = build_case_dossier_data(case_id, db)
        assert dossier["case"]["id"] == case_id
        assert dossier["dossier"]["threat_level"] == "CRITICAL"
        assert dossier["cryptographic_hash"] is not None
        assert len(dossier["cryptographic_hash"]) == 64
        # Format Dual-Tier
        assert len(dossier["top_10_attackers"]) > 0 # Tier 1
        assert dossier["ledger_total_count"] == 5    # Tier 2
        assert len(dossier["full_ledger"]) == 5

        # Verifikasi item ledger
        item = dossier["full_ledger"][0]
        assert item["username"] == "buzzer_utama_01"
        assert item["in_cib_cluster"] is True
        assert item["estimated_class"] == "BUZZER"

        # Test HTML rendering
        html = render_html_dossier(dossier)
        assert "PUSAT SIBER TNI ANGKATAN DARAT" in html
        assert "RAHASIA / CLASSIFIED" in html
        assert "Disinformasi Kedaulatan Negara" in html
        assert dossier["cryptographic_hash"] in html

        # Test CSV rendering
        csv_text = generate_csv_ledger(dossier)
        assert "index,case_id,username,platform,post_id" in csv_text
        assert "buzzer_utama_01" in csv_text
        assert "Narasi provokatif" in csv_text

    finally:
        db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
        db.commit()
        db.close()


# --------------------------------------------------------------------------
# 3. TEST EXPORT API ENDPOINTS
# --------------------------------------------------------------------------
def test_export_report_api_endpoints():
    client = TestClient(app)
    token = create_access_token(subject="analis_pusat", role="user")
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    case_id = "test_api_export_case_999"

    db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
    db.commit()

    case = InvestigationCase(
        id=case_id,
        target="target_api_export",
        platform="youtube",
        status="completed",
        created_by="analis_pusat",
        result_summary={"dossier": {"threat_level": "HIGH"}}
    )
    db.add(case)
    db.commit()
    db.close()

    try:
        # 1. Test HTML Report
        res_html = client.get(f"/api/v1/export/report/{case_id}?format=html", headers=headers)
        assert res_html.status_code == 200
        assert "text/html" in res_html.headers["content-type"]
        assert "X-Evidence-SHA256" in res_html.headers
        assert "PUSSIBERAD" in res_html.text

        # 2. Test PDF alias Report
        res_pdf = client.get(f"/api/v1/export/report/{case_id}?format=pdf", headers=headers)
        assert res_pdf.status_code == 200
        assert "text/html" in res_pdf.headers["content-type"]

        # 3. Test CSV Report
        res_csv = client.get(f"/api/v1/export/report/{case_id}?format=csv", headers=headers)
        assert res_csv.status_code == 200
        assert "text/csv" in res_csv.headers["content-type"]
        assert "attachment; filename=" in res_csv.headers["content-disposition"]
        assert "case_id" in res_csv.text

        # 4. Test Invalid Format 400
        res_bad = client.get(f"/api/v1/export/report/{case_id}?format=docx", headers=headers)
        assert res_bad.status_code == 400

        # 5. Test JSON Ledger endpoint
        res_ledger = client.get(f"/api/v1/export/ledger/{case_id}", headers=headers)
        assert res_ledger.status_code == 200
        ledger_json = res_ledger.json()
        assert ledger_json["case_id"] == case_id
        assert "top_10_attackers" in ledger_json
        assert "full_ledger" in ledger_json
        assert "cryptographic_hash" in ledger_json

        # 6. Test 404 for missing case
        res_404 = client.get("/api/v1/export/report/missing_case_000?format=html", headers=headers)
        assert res_404.status_code == 404

    finally:
        db = SessionLocal()
        db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
        db.commit()
        db.close()

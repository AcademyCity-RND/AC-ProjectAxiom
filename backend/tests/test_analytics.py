import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models.case import InvestigationCase
from app.models.actor import ActorProfile
from app.models.activity import ActivityLog
from app.core.security import create_access_token
from app.services.analytics import (
    generate_circadian_heatmap,
    calculate_posting_entropy,
    detect_narrative_drift,
    compute_advanced_analytics
)


# --------------------------------------------------------------------------
# 1. TEST CIRCADIAN HEATMAP & WORKING HOURS PATTERN
# --------------------------------------------------------------------------
def test_circadian_heatmap_empty():
    res = generate_circadian_heatmap([])
    assert res["total_posts"] == 0
    assert len(res["matrix_7x24"]) == 7
    assert len(res["matrix_7x24"][0]) == 24
    assert res["pattern_type"] == "INSUFFICIENT_DATA"


def test_circadian_heatmap_structured_office_hours():
    # Buat 30 postingan pada hari kerja (Senin - Jumat) pukul 09:00 - 15:00
    base_monday = datetime(2026, 11, 2, 9, 0, tzinfo=timezone.utc) # 2 Nov 2026 adalah hari Senin
    timestamps = []
    for day_offset in range(5): # Senin s/d Jumat
        for hour_offset in range(6): # 09:00 - 15:00 (6 jam)
            timestamps.append(base_monday + timedelta(days=day_offset, hours=hour_offset))

    res = generate_circadian_heatmap(timestamps)
    assert res["total_posts"] == 30
    assert res["working_hours_ratio"] == 1.0 # 100% di jam kerja
    assert res["night_hours_ratio"] == 0.0
    assert res["pattern_type"] == "STRUCTURED_OFFICE_HOURS"
    assert "jam kerja terstruktur" in res["explanation"].lower()


def test_circadian_heatmap_continuous_automation():
    # Buat postingan merata setiap 2 jam selama beberapa hari (termasuk jam 00:00 - 05:00)
    base = datetime(2026, 11, 1, 0, 0, tzinfo=timezone.utc)
    timestamps = [base + timedelta(hours=i * 2) for i in range(40)]

    res = generate_circadian_heatmap(timestamps)
    assert res["total_posts"] == 40
    assert res["night_hours_ratio"] >= 0.20
    assert res["pattern_type"] == "CONTINUOUS_24_7_AUTOMATION"
    assert "24 jam" in res["explanation"].lower()


# --------------------------------------------------------------------------
# 2. TEST POSTING INTERVAL SHANNON ENTROPY
# --------------------------------------------------------------------------
def test_posting_entropy_insufficient():
    res = calculate_posting_entropy([datetime.now(timezone.utc)])
    assert res["total_intervals"] == 0
    assert res["classification"] == "INSUFFICIENT_DATA"


def test_posting_entropy_rigid_bot():
    # Bot terjadwal dengan interval konstan tepat 60 detik (semua masuk bin '1m - 5m')
    base = datetime(2026, 11, 1, 10, 0, tzinfo=timezone.utc)
    timestamps = [base + timedelta(seconds=i * 60) for i in range(25)]

    res = calculate_posting_entropy(timestamps)
    assert res["total_intervals"] == 24
    # Karena semua interval identik dalam 1 bin, entropi bernilai 0.0
    assert res["entropy"] == 0.0
    assert res["normalized_entropy"] < 0.35
    assert res["classification"] == "HIGHLY_RIGID_SCHEDULED"


def test_posting_entropy_organic_human():
    # Variasi interval acak alami: burst cepat, browsing lambat, jeda makan, tidur malam, libur
    base = datetime(2026, 11, 1, 8, 0, tzinfo=timezone.utc)
    intervals = [5, 45, 120, 900, 3600, 14400, 36000, 90000, 12, 180, 7200, 28000]
    
    current = base
    timestamps = [current]
    for sec in intervals:
        current += timedelta(seconds=sec)
        timestamps.append(current)

    res = calculate_posting_entropy(timestamps)
    assert res["total_intervals"] == len(intervals)
    assert res["normalized_entropy"] >= 0.65
    assert res["classification"] == "NATURAL_HUMAN_VARIABILITY"


# --------------------------------------------------------------------------
# 3. TEST NARRATIVE DRIFT DETECTOR
# --------------------------------------------------------------------------
def test_narrative_drift_insufficient():
    res = detect_narrative_drift([{"content": "cuitan", "posted_at": datetime.now(timezone.utc)}])
    assert res["drift_detected"] is False
    assert res["window_count"] == 1


def test_narrative_drift_stable_narrative():
    # Narasi konsisten dengan domain pertahanan & siber
    base = datetime(2026, 11, 1, 10, 0, tzinfo=timezone.utc)
    activities = [
        {"content": f"Penguatan kedaulatan siber pertahanan nasional episode {i}", "posted_at": base + timedelta(hours=i * 3)}
        for i in range(8)
    ]
    res = detect_narrative_drift(activities, window_hours=6.0)
    assert res["drift_detected"] is False
    assert res["max_drift"] < 0.35
    assert len(res["windows"]) >= 2


def test_narrative_drift_abrupt_pivot():
    # Narasi berubah drastis dari isu militer/alutsista ke gosip artis / resep masakan
    base = datetime(2026, 11, 1, 8, 0, tzinfo=timezone.utc)
    activities = []
    # Paruh awal: militer & pertahanan
    for i in range(4):
        activities.append({
            "content": f"Modernisasi persenjataan pertahanan dan alutsista angkatan darat nomor {i}",
            "posted_at": base + timedelta(hours=i)
        })
    # Paruh akhir: resep kue manis & kosmetik bibir
    for i in range(4):
        activities.append({
            "content": f"Resep cara memasak kue bolu kukus pandan manis dan lipstik kosmetik glowing {i}",
            "posted_at": base + timedelta(hours=12 + i)
        })

    res = detect_narrative_drift(activities, window_hours=6.0)
    assert res["drift_detected"] is True
    assert res["max_drift"] >= 0.35
    assert "pembelokan narasi mendadak" in res["summary"].lower()


# --------------------------------------------------------------------------
# 4. TEST COMBINED ANALYTICS & API ENDPOINT
# --------------------------------------------------------------------------
def test_compute_advanced_analytics():
    base = datetime(2026, 11, 1, 10, 0, tzinfo=timezone.utc)
    activities = [
        {"content": f"Aktivitas akun ke-{i}", "posted_at": base + timedelta(minutes=i * 20)}
        for i in range(10)
    ]
    combined = compute_advanced_analytics(activities)
    assert "circadian_heatmap" in combined
    assert "posting_entropy" in combined
    assert "narrative_drift" in combined


def test_get_case_analytics_api():
    client = TestClient(app)
    token = create_access_token(subject="operator_siber", role="user")
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    case_id = "test_analytics_case_101"

    # Bersihkan jika ada
    db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
    db.commit()

    case = InvestigationCase(
        id=case_id,
        target="target_analytics",
        platform="x",
        status="completed",
        created_by="operator_siber",
        result_summary={"analytics": {"status": "precomputed"}}
    )
    db.add(case)
    db.commit()
    db.close()

    try:
        response = client.get(f"/api/v1/investigate/{case_id}/analytics", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["case_id"] == case_id
        assert "analytics" in data

        # Test non-existent case 404
        response_404 = client.get("/api/v1/investigate/non_existent_case_999/analytics", headers=headers)
        assert response_404.status_code == 404
    finally:
        db = SessionLocal()
        db.query(InvestigationCase).filter(InvestigationCase.id == case_id).delete()
        db.commit()
        db.close()

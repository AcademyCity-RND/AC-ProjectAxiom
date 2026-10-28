import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.models.watchlist import Watchlist

client = TestClient(app)


@pytest.fixture
def auth_headers():
    token = create_access_token(subject="investigator_tester", role="user")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    token = create_access_token(subject="admin", role="admin")
    return {"Authorization": f"Bearer {token}"}


def test_watchlist_unauthenticated():
    """Menguji bahwa akses tanpa token ditolak (401/403)."""
    response = client.get("/api/v1/watchlist")
    assert response.status_code in [401, 403]


def test_watchlist_crud_lifecycle(auth_headers):
    """Menguji siklus hidup CRUD Watchlist dari penambahan, listing, hingga penghapusan."""
    # Bersihkan target uji jika ada
    db = SessionLocal()
    try:
        db.query(Watchlist).filter(Watchlist.username == "@test_target_cib").delete()
        db.commit()
    finally:
        db.close()

    # 1. Tambah target baru ke Watchlist
    payload = {
        "username": "test_target_cib",
        "platform": "x",
        "tag": "propaganda_botnet",
        "notes": "Diduga terhubung sindikat CIB region Jawa Barat"
    }
    create_resp = client.post("/api/v1/watchlist", json=payload, headers=auth_headers)
    assert create_resp.status_code == 201
    created_data = create_resp.json()
    assert created_data["username"] == "@test_target_cib"
    assert created_data["platform"] == "x"
    assert created_data["tag"] == "propaganda_botnet"
    assert created_data["added_by"] == "investigator_tester"
    watchlist_id = created_data["id"]

    # 2. Tambah duplikat harus menghasilkan 409 Conflict
    dup_resp = client.post("/api/v1/watchlist", json=payload, headers=auth_headers)
    assert dup_resp.status_code == 409

    # 3. List Watchlist
    list_resp = client.get("/api/v1/watchlist", headers=auth_headers)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(item["id"] == watchlist_id for item in items)

    # 4. Filter by Tag
    tag_resp = client.get("/api/v1/watchlist?tag=propaganda_botnet", headers=auth_headers)
    assert tag_resp.status_code == 200
    filtered_items = tag_resp.json()
    assert all(item["tag"] == "propaganda_botnet" for item in filtered_items)

    # 5. Hapus target dari Watchlist
    del_resp = client.delete(f"/api/v1/watchlist/{watchlist_id}", headers=auth_headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

    # 6. Hapus target yang sudah tidak ada harus menghasilkan 404
    del_again_resp = client.delete(f"/api/v1/watchlist/{watchlist_id}", headers=auth_headers)
    assert del_again_resp.status_code == 404

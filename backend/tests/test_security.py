import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import hash_password, verify_password, create_access_token

client = TestClient(app)


def test_password_hashing():
    """Memastikan enkripsi password bcrypt berfungsi dengan aman."""
    plain = "RahasiaMiliter2026!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_generation_and_login():
    """Uji coba autentikasi login dan penerbitan JWT Bearer Token."""
    # 1. Login gagal jika kredensial salah
    res_fail = client.post("/api/v1/auth/login", json={
        "username": "analis",
        "password": "WrongPassword123"
    })
    assert res_fail.status_code == 401

    # 2. Login berhasil dengan akun demonstrasi
    res_success = client.post("/api/v1/auth/login", json={
        "username": "analis",
        "password": "AxiomUser2026!"
    })
    assert res_success.status_code == 200
    data = res_success.json()
    assert "access_token" in data
    assert data["role"] == "user"
    assert data["token_type"] == "bearer"

    # 3. Akses route profil terproteksi (/api/v1/auth/me)
    token = data["access_token"]
    res_me = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert res_me.status_code == 200
    assert res_me.json()["username"] == "analis"


def test_protected_investigation_endpoint_without_token():
    """Memastikan endpoint investigasi menolak akses jika tidak ada token otentikasi."""
    res = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "target_akun"
    })
    assert res.status_code in (401, 403)


def test_investigation_input_validation_and_anti_ssrf():
    """Uji coba validasi ketat Pydantic dan mekanisme pencegahan Anti-SSRF."""
    # Dapatkan token pengguna sah
    res_login = client.post("/api/v1/auth/login", json={
        "username": "analis",
        "password": "AxiomUser2026!"
    })
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Input target sah (username Twitter dengan @)
    res_valid = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "@infiltrator_01",
        "max_interactions": 100
    }, headers=headers)
    assert res_valid.status_code == 200
    assert res_valid.json()["sanitized_target"] == "infiltrator_01"

    # 2. Upaya SQL Injection / Karakter Ilegal pada target
    res_sql = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "user'; DROP TABLE users;--"
    }, headers=headers)
    assert res_sql.status_code == 422  # Unprocessable Entity (Ditolak oleh Pydantic validator)

    # 3. Anti-SSRF: Upaya meminta server men-scrape localhost / IP internal
    res_ssrf_local = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "http://localhost:8000/internal-secrets"
    }, headers=headers)
    assert res_ssrf_local.status_code == 422

    res_ssrf_ip = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "http://127.0.0.1:5432/db"
    }, headers=headers)
    assert res_ssrf_ip.status_code == 422

    # 4. Domain di luar Whitelist
    res_untrusted = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "https://malicious-external-site.com/fake-tweet"
    }, headers=headers)
    assert res_untrusted.status_code == 422

    # 5. URL Whitelist sah (Twitter / X)
    res_whitelisted_url = client.post("/api/v1/investigate/target", json={
        "platform": "x",
        "target": "https://x.com/infiltrator_01"
    }, headers=headers)
    assert res_whitelisted_url.status_code == 200

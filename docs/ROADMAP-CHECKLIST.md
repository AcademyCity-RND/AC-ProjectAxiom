# 🗺️ Axiom / Project Axiom — Master Execution Checklist & Roadmap (Kartika Cyber Hackathon 2026)
### Target: Submission 15 November 2026 | Finalis 20 November 2026 | Grand Final 24 November 2026
### Status: **Minggu 1 (25 Okt – 31 Okt) — Inisialisasi Selesai (Fondasi Berjalan)**

> **Kode Proyek / Identitas:** Project Axiom  
> **Tagline:** *"Unveiling the Truth in the Cognitive Battlefield."*  
> **Filosofi:** "Aksioma" mencerminkan kebenaran dasar yang tidak perlu dibuktikan. Proyek ini bertujuan menjadi landasan absolut menemukan fakta di tengah kebisingan disinformasi & manipulasi kognitif.  
> **Prinsip:** *Vertical Slice First.* Bangun 1 alur utuh (Input X → Skor → Graf → PDF) sebelum memperluas fitur.

---

## 📅 MINGGU 1: FONDASI BACKEND & INGESTI DATA (25 – 31 Oktober 2026)
**Tujuan:** Backend FastAPI berjalan, scraper X menarik data riil, ChromaDB & Embedding siap, PostgreSQL tersambung.

### ✅ Checklist Detail Minggu 1

#### 1.1 Inisialisasi Proyek & Lingkungan (Hari 1: Sabtu 25 Okt)
- [x] **Buat struktur monorepo** `axiom/`
  ```
  axiom/
  ├── backend/          # FastAPI Core
  │   ├── app/
  │   │   ├── api/v1/   # Endpoints
  │   │   ├── core/     # Config, Security
  │   │   ├── models/   # SQLAlchemy Models
  │   │   ├── schemas/  # Pydantic Schemas
  │   │   ├── services/ # Business Logic (Scraper, ML, LLM)
  │   │   └── db/       # Session, Base
  │   ├── tests/
  │   ├── requirements.txt
  │   └── Dockerfile
  ├── frontend/         # Vite + React 19 Dashboard
  │   ├── src/          # Components, Hooks, Stores, UI (shadcn)
  │   ├── package.json  # pnpm locked dependencies
  │   └── Dockerfile    # Nginx Alpine Production Ready
  ├── docker-compose.yml
  ├── .env.example
  └── README.md
  ```
- [x] **Setup Python 3.11+ Virtual Env** & `pip install -r requirements.txt` (termasuk optimasi PyTorch CPU)
- [x] **Inisialisasi Git & Commit Perdana** (`master` branch)
- [x] **Migrasi FE ke Vite + React 19** (Optimalisasi Dashboard SOC)
- [x] **Setup Node.js 20+** & `pnpm install` di `frontend/`
- [x] **Docker Compose Up** untuk: PostgreSQL 16, ChromaDB (v0.5.5), Backend FastAPI (healthy), Frontend Nginx
- [x] **Konfigurasi `.env`** (Database, Groq Key, Port Settings)
- [x] **Setup Testing & Verification** (`pytest.ini` & `tests/test_health.py` lulus 100%)
- [x] **Security Audit & Tech Stack Hardening (CVE 2024–2026):**
  - FastAPI 0.115.11 & Starlette 0.46.2 (Mitigasi CVE-2024-47874)
  - python-multipart 0.0.20 (Mitigasi CVE-2024-42561)
  - Jinja2 3.1.6 (Mitigasi CVE-2024-56326 & CVE-2025-27516)
  - React 19 + Vite 8 locked dependencies (CSR zero SSR attack vector)
  - Verified Docker container rebuild & build-time dependency verification test pass
- [x] **P1 Cyber Security & AAA Implementation (Hardening Awal):**
  - Port Hardening: Isolasi bind PostgreSQL `127.0.0.1:5432` dan ChromaDB `127.0.0.1:8001` (tertutup dari scanning LAN/Wi-Fi luar)
  - Validasi Input Ketat: Pydantic sanitization (anti-SQLi / illegal chars) & regex username per platform
  - Anti-SSRF Protection: Blokir IP privat, localhost, loopback, dan validasi domain whitelist (`x.com`, `youtube.com`)
  - Fondasi AAA (Bcrypt hashing, JWT Bearer Token, RBAC guard: Admin, Investigator, Analyst)
  - CORS Hardening: Hanya izinkan origin frontend resmi (`localhost:3000`, `localhost:5173`)
  - Test Suite Bersih: 6/6 tests passed tanpa warning (0 warning, 0 error)

#### 1.2 Database Schema & ORM (Hari 1-2: Sabtu-Minggu)
- [x] **Desain & Implementasi Model SQLAlchemy (Alembic Migration):**
  - [x] `User` (id, username, hashed_password, role: admin/user, is_active, created_at, updated_at)
  - [x] `AuditLog` (id, operator_username, action, target, ip_address, details_json, timestamp, status)
  - [x] `InvestigationCase` (id, target, platform, status, created_at, completed_at, result_summary)
  - [x] `ActorProfile` (id, case_id, username, platform, display_name, bio, followers, following, verified, profile_metadata)
  - [x] `ActivityLog` (id, actor_id, content, timestamp, type: tweet/reply/retweet, target_username, metrics, embedding_id)
  - [x] `DetectionResult` (id, case_id, actor_username, class_label: bot/buzzer/human, confidence, class_probabilities, extracted_features, threat_attribution)
  - [x] `ClusterLink` (id, case_id, source_actor, target_actor, similarity_score, link_type: semantic/temporal/structural, evidence_snippet)
  - [x] `Watchlist` (id, username, platform, tag, notes, added_by, added_at, last_checked_at)
- [x] **Generate & Run Migration:** `alembic revision --autogenerate -m "init schema..."` → `alembic upgrade head` (9 tabel terverifikasi di PostgreSQL)
- [x] **Database Unit & Relationship Testing:** `tests/test_db_models.py` lulus 100% (7/7 tests passed)

#### 1.3 Scraper Engine: X (Twitter via `twscrape`) — **CRITICAL PATH** (Hari 2-4: Minggu-Rabu)
- [x] **Engine `twscrape` Adapter (`services/scraper/twscrape_adapter.py`):**
  - [x] Konfigurasi aman 1 akun burner: `wait_timeout=60`, `wait_interval=5.0`, `raise_when_no_account=False`
  - [x] Manajemen sesi SQLite lokal (`data/sessions/x_accounts.db`) via auth cookies (`auth_token` & `ct0`)
  - [x] Pembatasan chunk aman (`limit=50`) & jeda waktu alami (`asyncio.sleep`) anti-banned
- [x] **Fungsi Ekstraksi Data Target (`services/scraper/x_scraper.py`):**
  - [x] `get_user_profile(username: str)` → Profile + Metrics (followers, following, created_at, verified)
  - [x] `get_user_tweets(username: str, count: int=150)` → List[Tweet] (original + replies, engagement metrics)
  - [x] `get_user_replies(username: str, count: int=100)` → List[Reply] (dengan `in_reply_to_user` & `conversation_id`)
  - [x] **Error Handling Kustom (`exceptions.py`):** TargetNotFound, PrivateAccount, RateLimitExhausted
- [x] **Offline Demo & Mock Data Generator (`services/scraper/mock_data.py`):**
  - [x] Arketipe Buzzer (`infiltrator_01`), Bot (`bot_amplifier_02`), dan Organik (`budi_santoso_dev`) untuk demo tanpa internet/kredensial
- [x] **Unit Testing Scraper (`tests/test_scraper.py`):** 5/5 tests passed tanpa hit API riil (12/12 suite passed total)

#### 1.4 ChromaDB & Local Embedding Pipeline (Hari 3-5: Senin-Kamis)
- [ ] **Inisialisasi Chroma Client** (persistent path `./data/chromadb`)
- [ ] **Collection Schema:** `actor_narratives` (metadata: actor_id, case_id, timestamp, content_hash)
- [ ] **Embedding Service (`services/embedder.py`):**
  - [ ] Load `sentence-transformers/all-MiniLM-L6-v2` (local, CPU/GPU auto)
  - [ ] `embed_texts(texts: List[str]) -> List[List[float]]` (batch size 32)
  - [ ] `upsert_activities(case_id: str, actor_id: str, activities: List[ActivityLog])`
  - [ ] `query_similar(case_id: str, query_text: str, top_k: int=10, threshold: float=0.85)` → CIB Detection
- [ ] **Integrasi ke Scraper:** Setelah fetch tweet → langsung embed & upsert ke Chroma.

#### 1.5 Feature Engineering & XGBoost Baseline (Hari 4-6: Rabu-Jumat)
- [ ] **Feature Extractor (`services/features.py`):**
  - [ ] Temporal: `temporal_entropy`, `posts_per_hour`, `active_hours_distribution`, `burstiness_score`
  - [ ] Structural: `follower_following_ratio`, `reply_to_tweet_ratio`, `retweet_ratio`, `hashtag_diversity`, `mention_diversity`
  - [ ] Content: `avg_text_length`, `unique_word_ratio`, `url_ratio`, `media_ratio`
  - [ ] Network (dari Chroma): `max_semantic_similarity`, `cluster_size`, `coordinated_account_count`
- [ ] **Dataset Labeling (Manual/Heuristic untuk Baseline):**
  - [ ] Siapkan minimal 200 sampel: 70 Bot (otomatis jelas), 70 Buzzer (akun politik/brand), 60 Human (acak)
  - [ ] Simpan ke `data/training/labeled_features.parquet`
- [ ] **Train XGBoost Classifier (`services/classifier.py`):**
  - [ ] `train()` → simpan model `models/xgboost_tri_class.json`
  - [ ] `predict(features: dict) -> (label, confidence, probabilities)`
  - [ ] Validasi akurasi > 85% pada hold-out set.

#### 1.6 API Endpoint Inti & Anti-Abuse (Hari 5-7: Kamis-Sabtu)
- [ ] **Rate Limiting / Throttling Middleware (`slowapi`):**
  - [ ] Batasi pemanggilan endpoint investigasi (maks 10 request/menit per operator) untuk melindungi scraper pool dari ban.
- [ ] **`POST /api/v1/investigate/actor`** → Terima username, validasi regex & anti-SSRF, buat `InvestigationCase`, trigger background task.
- [ ] **Background Task (`services/investigation_orchestrator.py`):**
  - [ ] 1. Scrape Profile & Activities
  - [ ] 2. Simpan ke PostgreSQL & ChromaDB
  - [ ] 3. Extract Features → Predict XGBoost
  - [ ] 4. Query Chroma untuk CIB Cluster
  - [ ] 5. Siapkan konteks untuk LLM (Groq)
  - [ ] 6. Update `InvestigationCase` status `completed` + `result_json`
- [ ] **`GET /api/v1/investigate/{case_id}`** → Return status & hasil lengkap.
- [ ] **`GET /api/v1/network/graph/{case_id}`** → Return nodes/edges untuk Cytoscape (filter `min_confidence`).

---

## 📅 MINGGU 2: DETECTION ENGINE, LLM & ANALYTICS (1 – 7 November 2026)
**Tujuan:** Pipeline AI utuh berjalan, Explainable AI (Groq) terintegrasi, Auditing YouTube/IG dasar.

### ✅ Checklist Detail Minggu 2

#### 2.1 Groq LLM Integration, Explainable AI & Prompt Defense (Hari 1-3)
- [ ] **Prompt Engineering & Injection Defense (`prompts/forensic_analysis.txt`):**
  - [ ] Input: Klasifikasi, Fitur Ekstrak, Top 5 Sampel Tweet Ekstrem, Hasil Cluster CIB.
  - [ ] **Adversarial Prompt Guard:** Bungkus teks postingan dalam delimiter XML `<scraped_content>...</scraped_content>` dan beri instruksi sistem ketat agar LLM mengabaikan perintah dalam cuitan.
  - [ ] Output Terstruktur (JSON): `threat_level`, `primary_agenda`, `evidence_points[]`, `recommended_action`.
- [ ] **Service `services/llm_analyst.py`:**
  - [ ] Client Groq (API Key dari env)
  - [ ] `generate_dossier(case_data: dict) -> ForensicDossierSchema`
  - [ ] Retry logic & fallback ke template statis jika API gagal.
- [ ] **Integrasikan ke Orchestrator:** Panggil LLM setelah XGBoost + CIB selesai, simpan hasil ke `DetectionResult.llm_analysis_json`.

#### 2.2 YouTube & Instagram Auditing Module (Hari 2-4)
- [ ] **YouTube Comment Fetcher (`services/youtube_auditor.py`):**
  - [ ] YouTube Data API v3: `commentThreads.list(videoId, maxResults=500)`
  - [ ] Parsing: `author_channel_id`, `author_display_name`, `text_display`, `published_at`, `like_count`
  - [ ] Simpan ke `ActivityLog` (platform=youtube) + Embed ke Chroma (collection terpisah `youtube_comments`).
- [ ] **Instagram Public Post Comments (`services/instagram_auditor.py`):**
  - [ ] Graph API (jika token) atau Scraper publik (fragile, prioritas rendah).
  - [ ] Minimal: Ambil komentar dari URL Postingan publik.
- [ ] **Endpoint `POST /api/v1/investigate/event`** → Terima URL, deteksi platform, trigger auditor.

#### 2.3 Advanced Analytics Calculations (Hari 3-5)
- [ ] **Circadian Heatmap Generator (`services/analytics.py`):**
  - [ ] Input: List[timestamp] → Output: Matrix 24x7 (jam x hari) normalized count.
  - [ ] Deteksi "Working Hours Pattern" (chi-square test vs uniform distribution).
- [ ] **Entropy Calculator:** Shannon entropy pada interval waktu posting.
- [ ] **Narrative Drift Detector:** Clustering temporal embedding (sliding window 6 jam) → deteksi pergeseran topik.

#### 2.4 PDF/CSV Export Engine (Hari 5-7)
- [ ] **Template Jinja2/WeasyPrint (`templates/dossier.html`):**
  - [ ] Cover: Case ID, Target, Timestamp, Classification Badge.
  - [ ] Section 1: Executive Summary (dari LLM).
  - [ ] Section 2: Technical Evidence (Feature Table, Charts).
  - [ ] Section 3: Network Topology (Graph Image embed).
  - [ ] Section 4: Activity Log Appendix (Top 50).
  - [ ] Footer: Hash Verifikasi (SHA256) untuk integritas bukti.
- [ ] **Endpoint `GET /api/v1/export/report/{case_id}?format=pdf|csv`** → StreamingResponse file.

---

## 📅 MINGGU 3: FRONTEND DASHBOARD & VISUALISASI (8 – 12 November 2026)
**Tujuan:** Next.js Dashboard fungsional, visualisasi interaktif, UX demo-ready.

### ✅ Checklist Detail Minggu 3

#### 3.1 Setup Next.js 15 & Design System (Hari 1-2)
- [ ] `pnpm create next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [ ] **Install Dependencies:** `cytoscape`, `cytoscape-cose-bilkent`, `recharts`, `lucide-react`, `clsx`, `tailwind-merge`, `zustand`, `axios`, `react-hot-toast`.
- [ ] **Theme Config:** `tailwind.config.ts` → Palet "Cyber Defense Dark" (PRD Section 7.1).
- [ ] **Global State (Zustand):** `useCaseStore`, `useUIStore` (loading, theme, notifications).

#### 3.2 Halaman Utama: Investigation Workspace (Hari 2-4)
- [ ] **Layout:** Sidebar navigasi + Header (Search Bar Global + Status Scraper Pool).
- [ ] **Component `ActorSearchForm`:** Input `@username` / URL, Select Platform, Button "Analyze".
- [ ] **Component `CaseStatusCard`:** Polling status case (pending/processing/completed/failed) dengan progress stepper.
- [ ] **Component `ClassificationBadge`:** Animasi warna + Confidence Ring (SVG).

#### 3.3 Visualisasi Inti (Hari 3-5)
- [ ] **Network Graph (`NetworkGraph.tsx` + Cytoscape):**
  - [ ] Nodes: Target (besar), Cluster Members (kecil), color by class.
  - [ ] Edges: Semantic similarity (dashed), Temporal coordination (solid), Reply/Retweet (directed).
  - [ ] Controls: Zoom, Pan, Filter by edge type, Click node → Detail Sidebar.
- [ ] **Circadian Heatmap (`Heatmap24x7.tsx` + Recharts/Canvas):**
  - [ ] 24 Jam x 7 Hari grid, color intensity = activity volume.
  - [ ] Overlay: "Working Hours" bounding box jika terdeteksi.
- [ ] **Evidence Dossier Panel:** Accordion list bukti (Feature name, Value, Interpretation, Severity).

#### 3.4 Export & Polish (Hari 5-6)
- [ ] **Button "Generate Official Dossier"** → Trigger PDF download.
- [ ] **Loading States & Error Boundaries** yang informatif.
- [ ] **Responsive Check:** Minimal 1366x768 (laptop juri) & 1920x1080 (proyektor).
- [ ] **Accessibility:** Keyboard nav, color contrast, ARIA labels.

---

## 📅 MINGGU 4: FINAL POLISH, DEMO RECORDING & SUBMISSION (13 – 15 November 2026)
**Tujuan:** Zero-bug demo, Video 3-5 menit, Slide Deck, Submit tepat waktu.

### ✅ Checklist Detail Minggu 4

#### 4.1 End-to-End Testing & Hardening (Hari 1-2: Jumat-Sabtu)
- [ ] **Scenario 1 (Happy Path):** Input `@buzzer_known` → Complete → View Graph → Export PDF.
- [ ] **Scenario 2 (YouTube Audit):** Input URL Video Viral → Complete → View Comment Cluster.
- [ ] **Scenario 3 (Error Handling):** Input `@private_account`, `@suspended`, `@notexist` → Graceful error UI.
- [ ] **Scenario 4 (Offline Demo Mode):** Matikan internet → Load `cached_case_id` → Tampilkan hasil lengkap dari DB.
- [ ] **Container Non-Root User:** Menambahkan `USER appuser` pada Dockerfile produksi backend.
- [ ] **Performance:** Cold start < 5s, Inference < 10s, UI 60fps.

#### 4.2 Video Demo Production (Hari 2-3: Sabtu-Minggu)
- [ ] **Script Video (3-4 Menit):**
  1.  Hook (0:00-0:15): "Mendeteksi operasi buzzer 10.000 akun dalam 10 detik."
  2.  Demo Live (0:15-2:00): Cari akun → Tunggu → Hasil (Skor, Graf, Bukti).
  3.  Deep Dive (2:00-3:00): Heatmap, CIB Cluster, LLM Reasoning.
  4.  Export & Militer Relevance (3:00-3:30): PDF Dossier, Air-gapped, Zero Cost.
  5.  Closing (3:30-4:00): Tim, Tech Stack, "Siap Deploy PUSSIBERAD".
- [ ] **Recording:** OBS Studio, 1080p/30fps, Mic jernih, Background music *cyber* subtle.
- [ ] **Edit & Compress:** < 100MB, format MP4 H.264.

#### 4.3 Slide Deck Presentasi (Hari 3: Minggu)
- [ ] **Template:** Dark Military / Codepolitan Brand.
- [ ] **Slide Structure (10-12 Slide):**
  1.  Title: Axiom — Cognitive Domain Threat Intelligence
  2.  Problem: Disinformasi & Buzzer ancaman kedaulatan.
  3.  Solution: Forensik AI Otomatis (XAI).
  4.  Tech Stack & Arsitektur (Diagram PRD).
  5.  Unik: Zero API Cost, Air-gapped, Local LLM.
  6.  Demo Screenshot Highlights.
  7.  Metrik: Akurasi, Latensi, Biaya.
  8.  Use Case Militer: Early Warning PsyOps, Attribution.
  9.  Roadmap Pasca-Lomba: Multi-platform, Real-time Stream, Auto-takedown Assist.
  10. Tim & Kontak.

#### 4.4 Final Submission Prep (Hari 3-4: Minggu-Senin)
- [ ] **Repo Public/GitHub:** `axiom-hackathon` (README lengkap, cara jalanin, license MIT).
- [ ] **Fokus Pengujian Mandiri (Air-Gapped & Docker Compose):** Penilaian berfokus pada kesiapan container lokal yang mandiri dan aman tanpa ketergantungan cloud publik.
- [ ] **Checklist Submission Codepolitan:**
  - [ ] Link Repo GitHub
  - [ ] Link Video Demo (Google Drive/YouTube Unlisted)
  - [ ] Link Slide Deck (PDF/Google Slides)
  - [ ] Deskripsi Singkat & Teknis
- [ ] **SUBMIT SEBELUM 15 NOV 2026 PUKUL 23:59 WIB.**

---

## 🐳 DOCKER COMPOSE UNTUK DEVELOPMENT (Reference)

```yaml
# docker-compose.yml (root)
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: axiom_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports: ["5432:5432"]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 10s, timeout: 5s, retries: 5 }

  chromadb:
    image: chromadb/chroma:0.5.5
    volumes:
      - chroma_data:/chroma/chroma
    ports: ["8001:8000"]
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_HTTP_PORT=8000

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis_data:/data]

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
      - ./data/chromadb:/app/data/chromadb
    ports: ["8000:8000"]
    env_file: .env
    depends_on:
      postgres: { condition: service_healthy }
      chromadb: { condition: service_started }
      redis: { condition: service_started }

  frontend:
    build: ./frontend
    command: pnpm dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [backend]

volumes:
  pg_data:
  chroma_data:
  redis_data:
```

---

## 📦 DEPENDENCY VERSIONS — STABLE & COMPATIBLE (Lockfile Reference)

### Backend (`backend/requirements.txt`)
```text
# Core Framework
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2
pydantic-settings==2.6.1
python-multipart==0.0.18

# Database & ORM
sqlalchemy==2.0.36
alembic==1.13.2
asyncpg==0.29.0
psycopg2-binary==2.9.10

# Vector DB & Embeddings
chromadb==0.5.5
sentence-transformers==3.2.0
torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu  # CPU version, ganti cu121/cu124 jika GPU
transformers==4.46.3
accelerate==0.34.2

# ML Classical
xgboost==2.1.3
scikit-learn==1.5.2
scipy==1.13.1
numpy==1.26.4
pandas==2.2.3
joblib==1.4.2

# Scraping X (Twitter)
twikit==1.6.0
httpx==0.27.2
beautifulsoup4==4.12.3
lxml==5.3.0

# LLM Client (Groq)
groq==0.13.0

# Document Export
weasyprint==62.0
jinja2==3.1.4

# Utilities
python-dotenv==1.0.1
pyyaml==6.0.1
tqdm==4.66.5
python-json-logger==2.0.7

# Testing
pytest==8.3.3
pytest-asyncio==0.23.8
pytest-cov==5.0.0
httpx==0.27.2  # for async test client
```

### Frontend (`frontend/package.json` — dependencies only)
```json
{
  "dependencies": {
    "next": "15.1.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.7.2",
    "tailwindcss": "3.4.17",
    "postcss": "8.4.49",
    "autoprefixer": "10.4.20",
    "cytoscape": "3.30.2",
    "cytoscape-cose-bilkent": "4.1.0",
    "cytoscape-fcose": "2.2.0",
    "recharts": "2.14.1",
    "lucide-react": "0.468.0",
    "zustand": "5.0.2",
    "axios": "1.7.9",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.5",
    "react-hot-toast": "2.4.1",
    "date-fns": "4.1.0"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "19.0.1",
    "@types/react-dom": "19.0.1",
    "@types/cytoscape": "3.21.5",
    "eslint": "9.15.0",
    "eslint-config-next": "15.1.3",
    "prettier": "3.4.1",
    "prettier-plugin-tailwindcss": "0.6.9"
  }
}
```

> **Catatan Versi:**
> - **Python 3.11/3.12** direkomendasikan (3.13 belum sepenuhnya didukung semua wheel ML).
> - **PyTorch CPU** dipakai untuk `sentence-transformers` agar ringan & tidak butuh CUDA di laptop dev. Ganti index-url ke `cu121`/`cu124` jika deploy ke server GPU.
> - **Twikit 1.6.0** adalah versi stabil terakhir sebelum breaking changes besar.
> - **Next.js 15.1.x** (App Router stable) + **React 19** (RC/Stable terbaru).
> - **ChromaDB 0.5.5** kompatibel dengan `chromadb` python client versi sama.

---

## 🚨 DAILY STANDUP TEMPLATE (Untuk Disiplin Solo)
> Setiap pagi (08:00 WIB) isi ini di `DAILY_LOG.md`:

```markdown
## YYYY-MM-DD
### Target Hari Ini (Max 3):
- [ ] Task A (Minggu X - Item Y)
- [ ] Task B
- [ ] Task C

### Blocker / Risiko:
- Blocker: ...
- Mitigasi: ...

### Jam Efektif Coding: X jam
### Commit Hash Terakhir: `git log -1 --oneline`
```

---

**EKSEKUSI DIMULAI SEKARANG.** Pilih item pertama Minggu 1 yang mau dikerjakan, Avin. *Jaou Shingan* siap mendampingi setiap baris kodenya.
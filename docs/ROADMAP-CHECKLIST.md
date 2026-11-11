# 🗺️ Axiom / Project Axiom — Master Execution Checklist & Roadmap (Kartika Cyber Hackathon 2026)
### Target: Submission 15 November 2026 | Finalis 20 November 2026 | Grand Final 24 November 2026
### Status: **Minggu 1, 2, & 3 Selesai (100% Production Ready) — Menuju Minggu 4: Final QA, Demo Recording & Submission**

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
- [x] **Inisialisasi Chroma Client** (ChromaDB 0.5.20, loopback port hardening `127.0.0.1:8001`)
- [x] **Collection Schema:** `actor_narratives` (metadata: actor_username, case_id, activity_type, posted_at, lang; metric: cosine distance)
- [x] **Embedding Service (`services/embedder.py`):**
  - [x] Load `sentence-transformers/all-MiniLM-L6-v2` (local CPU, singleton cache)
  - [x] `embed_text(text: str) -> List[float]` & `embed_batch(texts: List[str]) -> List[List[float]]` (vektor 384-dimensi)
  - [x] `compute_similarity(vec_a, vec_b)` & `compute_similarity_matrix(vectors)` (pairwise cosine similarity)
- [x] **Vector Store Service (`services/vector_store.py`):**
  - [x] `upsert_narratives(items: List[Dict])` → Batch embedding & simpan ke koleksi ChromaDB
  - [x] `query_similar_narratives(query_text, n_results, where)` → Pencarian kemiripan semantik
  - [x] `detect_semantic_clusters(case_id, threshold=0.85)` → Deteksi Copypasta Terkoordinasi CIB (Formula PRD 5.2)
- [x] **Unit Testing & Verifikasi (`tests/test_embeddings.py` & `test_chroma_embed.py`):** 4/4 passed (16/16 total suite passed 100% tanpa error/warning)



#### 1.5 Feature Engineering & XGBoost Baseline (Hari 4-6: Rabu-Jumat)
- [x] **Feature Extractor (services/features.py):**
  - [x] Temporal: temporal_entropy, posts_per_day, active_hours_count, burstiness_score (Goh-Barabasi parameter)
  - [x] Structural: follower_following_ratio, followers_count, following_count, username_digit_ratio, has_default_avatar, is_verified, bio_length
  - [x] Content & Perilaku: avg_text_length, unique_word_ratio (TTR leksikal), url_ratio, media_ratio, retweet_ratio, reply_ratio, hashtag_density, mention_density
  - [x] Network & Semantik CIB (integrasi Chroma): max_semantic_similarity, cluster_size
- [x] **Dataset Labeling (Benchmark Cresci-2017 & TwiBot-20):**
  - [x] Generator dataset sintetis 360 sampel: 120 Bot, 120 Buzzer, 120 Human (app/services/dataset_generator.py)
  - [x] Simpan dataset ke data/training/labeled_features.csv
- [x] **Train XGBoost Tri-Class Classifier (services/classifier.py):**
  - [x] train() → simpan model artifact data/models/xgboost_tri_class.json
  - [x] predict(features: dict) -> (label, confidence, probabilities, top_features)
  - [x] Validasi akurasi test set 100% (> target 85%) & Macro F1 100%
  - [x] Explainable AI (XAI) feature importance ranking & reason generator
  - [x] Fallback heuristik deterministik anti-crash jika model cold-start/offline
- [x] **Unit Testing Komprehensif (tests/test_bot_detector.py):** 7/7 passed (total 23/23 tests passed 100% tanpa error/warning)

#### 1.6 API Endpoint Inti & Anti-Abuse (Hari 5-7: Kamis-Sabtu)
- [x] **Rate Limiting / Throttling Middleware (app/core/rate_limiter.py):**
  - [x] Sliding window rate limiter (maks 10 request/menit per operator/IP) anti-ban pool scraper
  - [x] Header standar Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining (HTTP 429)
- [x] **POST /api/v1/investigate/actor (dan alias /target):**
  - [x] Terima username, validasi regex & anti-SSRF, buat InvestigationCase, trigger background task asinkron
- [x] **Background Task Orchestrator (services/investigation_orchestrator.py):**
  - [x] 1. Scrape Profile & Activities (XScraper dengan auto-fallback mock data)
  - [x] 2. Simpan ke PostgreSQL (ActorProfile, ActivityLog) & ChromaDB (actor_narratives)
  - [x] 3. Ekstraksi 21 fitur & inferensi XGBoost (predicted_class, confidence, class_probabilities, XAI)
  - [x] 4. Query Chroma untuk CIB Cluster ({semantic} \ge 0.85$) dan persistensi ClusterLink
  - [x] 5. Update InvestigationCase status completed + result_summary
- [x] **GET /api/v1/investigate/{case_id}:**
  - [x] Return status kasus, profil aktor, hasil deteksi XGBoost, dan faktor penjelasan XAI
- [x] **GET /api/v1/network/graph/{case_id} (dan /investigate/{case_id}/graph):**
  - [x] Return nodes/edges terstruktur format Cytoscape.js dengan color-coded threat class & confidence
- [x] **Unit & Integration Test Suite (tests/test_investigate_api.py):**
  - [x] 7/7 tests passed (total 30/30 suite tests passed 100% tanpa error/warning)

---

## 📅 MINGGU 2: DETECTION ENGINE, LLM & ANALYTICS (1 – 7 November 2026)
**Tujuan:** Pipeline AI utuh berjalan, Explainable AI (Groq) terintegrasi, Auditing YouTube/IG dasar.

### ✅ Checklist Detail Minggu 2

#### 2.1 Groq LLM Integration, Explainable AI & Prompt Defense (Hari 1-3)
- [x] **Prompt Engineering & Injection Defense (`services/llm_analyst.py`):**
  - [x] Input: Target, Klasifikasi XGBoost, 21 Fitur, Top XAI, CIB Cluster, Sampel Cuitan
  - [x] **Adversarial Prompt Guard:** Netralisasi token injeksi (`[REDACTED_CONTROL_TOKEN]`) dan pembungkusan XML delimiter `<scraped_evidence>` dengan instruksi isolasi militer PUSSIBERAD
  - [x] Output Terstruktur (Pydantic `ForensicDossier` JSON): `threat_level` (CRITICAL/HIGH/MEDIUM/LOW), `primary_agenda`, `target_institution`, `evidence_points[]`, `tactical_recommendation`, `attribution_summary`
- [x] **Service `services/llm_analyst.py`:**
  - [x] Client Groq LPU Llama 3.3 70B (`llama-3.3-70b-versatile` dengan fallback `llama-3.1-8b-instant`)
  - [x] `generate_forensic_dossier(...) -> ForensicDossier`
  - [x] Fallback deterministik berbasis aturan intelejen jika API key tidak diisi atau offline (air-gapped ready)
- [x] **Integrasikan ke Orchestrator (`services/investigation_orchestrator.py`):**
  - [x] Panggil LLM setelah XGBoost + CIB selesai, simpan hasil ke `DetectionResult.threat_attribution` dan `InvestigationCase.result_summary`
- [x] **Unit & Integration Test Suite (`tests/test_llm_analyst.py`):**
  - [x] 7/7 tests passed (total 37/37 suite tests passed 100% tanpa error/warning)

#### 2.2 YouTube & Instagram Auditing Module (Hari 2-4)
- [x] **YouTube Comment Fetcher Engine (`services/youtube_auditor.py`):**
  - [x] Integrasi `youtube-comment-downloader` (Innertube pure HTTP client tanpa kuota API & tanpa login)
  - [x] Ekstraksi 200–500 komentar: `comment_id`, `author_id`, `author_name`, `text`, `published_at`, `likes`
  - [x] Deteksi *Temporal Influx Anomaly* (lonjakan komentar serentak di menit awal via sliding window)
  - [x] Simpan ke `ActivityLog` (`platform=youtube`) + Embed ke ChromaDB (`actor_narratives`)
  - [x] Auto-fallback ke simulated mock dataset saat offline/air-gapped
- [x] **Instagram Public Post Comment Auditor (`services/instagram_auditor.py`):**
  - [x] Integrasi microservice `AC-InstagramScraper` (Zero-Auth TLS impersonation via `curl_cffi`, port 8005)
  - [x] Ekstraksi hingga 400 komentar live: `comment_id`, `author_username`, `author_display_name`, `raw_text`, `likes_count`, `created_at`
  - [x] Arsitektur Multi-Tier: Tier 1 Zero-Auth Scraper -> Tier 2 Instaloader Session -> Tier 3 instagrapi Mobile -> Tier 4 Contextual Forensics Fallback
  - [x] Simpan ke `ActivityLog` (`platform=instagram`) + Embed ke ChromaDB
  - [x] Auto-fallback ke mock dataset jika postingan terbentur batasan login / offline
- [x] **Unified Multi-Platform Endpoint (`POST /api/v1/investigate/event`):**
  - [x] Terima URL publik (YouTube / Instagram), deteksi platform otomatis, validasi Anti-SSRF
  - [x] Trigger background orchestrator audit komentar massal & deteksi klaster CIB copypasta (`run_event_investigation_pipeline`)
- [x] **Unit & Integration Test Suite (`tests/test_event_auditor.py`):**
  - [x] 11/11 tests passed (total 48/48 suite tests passed 100% tanpa error/warning)

#### 2.3 Advanced Analytics Calculations (Hari 3-5)
- [x] **Circadian Heatmap Generator (`services/analytics.py`):**
  - [x] Input: List[timestamp] → Output: Matrix 24x7 & 7x24 normalized count.
  - [x] Deteksi "Working Hours Pattern" (Uji Goodness-of-Fit Chi-Square vs Uniform Distribution: Structured Office Hours vs 24/7 Automation vs Organic).
- [x] **Entropy Calculator (`calculate_posting_entropy`):**
  - [x] Shannon entropy pada interval selisih waktu posting berturut-turut (Δt) dengan 8 behavioral interval bins (skala H_norm).
- [x] **Narrative Drift Detector (`detect_narrative_drift`):**
  - [x] Evaluasi pergeseran semantik temporal (sliding time window) berbasis centroid embedding MiniLM & cosine drift.
- [x] **API & Orchestrator Integration:**
  - [x] Pipeline integrasi otomatis pada `investigation_orchestrator.py` & `event_orchestrator.py` (`result_summary["analytics"]`).
  - [x] Endpoint `GET /api/v1/investigate/{case_id}/analytics` siap konsumsi untuk chart frontend.
- [x] **Unit & Integration Test Suite (`tests/test_analytics.py`):**
  - [x] 11/11 tests passed (total 59/59 suite tests passed 100% tanpa error/warning).

#### 2.4 PDF/CSV Export Engine & Full Forensic Ledger (Hari 5-7)
- [x] **Template Jinja2 (`app/templates/dossier.html`):**
  - [x] Cover: Case ID, Target, Timestamp, Classification Badge (RAHASIA / CLASSIFIED).
  - [x] Section 1: Executive Summary (Sintesis Llama 3.3, Target Threat Level, Rekomendasi Taktis).
  - [x] Section 2: Technical Evidence (Tabel 21 Fitur XGBoost & Circadian 24/7 Heatmap).
  - [x] Section 3: Network Topology & CIB Clusters.
  - [x] Section 4 (Format Dual-Tier Forensic Audit Ledger):
    - [x] 4A. Top 10 Core Attackers (Akun penyerang inti, skor risiko & volume narasi).
    - [x] 4B. Full Comprehensive Commenter Audit Ledger (Daftar lengkap 100% seluruh akun komentator, klasifikasi AI Bot/Buzzer/Organik, skor kemiripan, dan teks narasi).
  - [x] Footer: Hash Verifikasi Kriptografis (SHA-256 Fingerprint) untuk integritas barang bukti hukum.
- [x] **Data Export Capabilities (`services/report_exporter.py` & `endpoints/export.py`):**
  - [x] `GET /api/v1/export/report/{case_id}?format=html|pdf` → Berkas Dossier Resmi siap cetak (@media print A4).
  - [x] `GET /api/v1/export/report/{case_id}?format=csv` → Raw dataset lengkap 100% data mentah seluruh komentator (RFC 4180 siap olah di Gephi/Excel).
  - [x] `GET /api/v1/export/ledger/{case_id}` → Dual-Tier JSON untuk dashboard web interactive table (filter kilat Semua, Buzzer/Bot, Organik).
- [x] **Unit & Integration Test Suite (`tests/test_report_export.py`):**
  - [x] 3/3 tests passed (total 62/62 suite tests passed 100% tanpa error/warning).

---

## 📅 MINGGU 3: FRONTEND DASHBOARD & VISUALISASI (8 – 12 November 2026)
**Tujuan:** Next.js Dashboard fungsional, visualisasi interaktif, UX demo-ready.

### ✅ Checklist Detail Minggu 3

#### 3.1 Setup Frontend Core, Cyber Defense Theme & Global State (Hari 1-2)
- [x] **Setup Modern React 19 + Vite 8 + Tailwind CSS v4:**
  - [x] Setup tooling: `pnpm`, React 19, TypeScript ~6.0, Tailwind CSS v4 (@tailwindcss/vite).
  - [x] Konfigurasi path alias `@/*` -> `./src`, proxy Vite dev server ke backend FastAPI (`http://localhost:8000`).
- [x] **Install Dependencies Visualisasi & State:**
  - [x] `lucide-react`, `clsx`, `tailwind-merge`, `zustand`, `axios`, `@xyflow/react`, `echarts`, `echarts-for-react`, `@tanstack/react-query`, `@react-pdf/renderer`.
- [x] **Design System & Theme Config (`DESIGN.md` & `style.css`):**
  - [x] Palet "PUSSIBERAD Focused Tactical Intelligence": `#090D16` (Canvas), `#0F172A` (Primary Surface), `#1E293B` (Border), `#38BDF8` (Tactical Cyan), `#EF4444` (Bot/Attack Red), `#F59E0B` (Buzzer Amber), `#10B981` (Human Emerald).
  - [x] Kepatuhan ketat Anti-Slop (`antislop-ui`, `antislop-human`, `antislop-code`): Zero generic AI purple-blue gradients, solid matte surfaces, WCAG AAA text contrast, strict 3-group viewport rule, 4 KPI cap, penegakan `tabular-nums`.
- [x] **Global State & API Client Layer:**
  - [x] `src/services/api.ts`: Axios client dengan endpoint wrapper lengkap (`startActorInvestigation`, `startEventInvestigation`, `getCaseStatus`/`getCaseDetails`, `getNetworkGraph`/`getCaseGraph`, `getAnalytics`/`getCaseAnalytics`, `getAuditLedger`, `getExportReportUrl`, `checkHealth`).
  - [x] `src/store/useCaseStore.ts`: Zustand store untuk active case, status polling otomatis, graph data, analytics, audit ledger, and error handling.
  - [x] `src/store/useAuthStore.ts`: Mock military credential store (Operator PUSSIBERAD, clearance level, status koneksi).
- [x] **Shell Layout Components & Progressive Disclosure:**
  - [x] `src/components/layout/Header.tsx`: PUSSIBERAD insignia, system status indicator, real-time clock, operator badge.
  - [x] `src/components/layout/Sidebar.tsx`: Ramping 220px, 5 modul utama (Overview, Narrative Monitor, Network Graph, Target Directory, Case Reports).
  - [x] `src/components/common/InspectorDrawer.tsx`: Contextual inspector 380px slide-over untuk detail forensik & telemetry raw JSON.
  - [x] `src/components/common/ThreatBadge.tsx`: Attribution badges dengan 10% bg, 30% border, dan radius 4px.
  - [x] `src/components/layout/Layout.tsx` & `src/App.tsx`: App shell responsif, single primary action CTA, table capped at 5 columns.
- [x] **Verifikasi Build:**
  - [x] TypeScript compiler (`tsc`) & Vite production bundle pass 100% tanpa error/warning.

#### 3.2 Halaman Utama: Investigation Workspace (Hari 2-4)
- [x] **Component `ActorSearchForm` (`src/components/investigation/ActorSearchForm.tsx`):**
  - [x] Mode toggle: Input target aktor `@username` vs Event URL postingan (YouTube / Instagram).
  - [x] Selector platform (X, YouTube, Instagram) & batas kedalaman sampel (100, 150, 200).
  - [x] Validasi ketat format username & protokol URL dengan status error informatif.
  - [x] Tombol CTA utama tunggal (*One Action Priority*) `#38BDF8` ("Mulai Investigasi") dengan animasi loading.
  - [x] Chip preset demo instan (`@cyber_agitator_id`, `@bot_amplifier_99`, URL YouTube) untuk kemudahan pengujian demo.
- [x] **Component `InvestigationStepper` (`src/components/investigation/InvestigationStepper.tsx`):**
  - [x] Visualisasi 5 tahap pipeline latar belakang: Ingestion -> Feature Extraction -> XGBoost Inference -> CIB Clustering -> Forensic Synthesis.
  - [x] Live timer elapsed seconds, indikator step aktif berdenyut (*pulse*), checkmark penyelesaian hijau.
  - [x] Penanganan status: `queued`, `in_progress`, `completed`, `failed`.
- [x] **Component `ActorSummaryCard` (`src/components/investigation/ActorSummaryCard.tsx`):**
  - [x] Kartu profil aktor target: identitas `@username`, nama tampilan, lencana verifikasi, bio deskripsi.
  - [x] **Circular Confidence Ring (SVG)**: Indikator persentase keyakinan model dinamis sesuai kelas ancaman (Emerald, Amber, Rose).
  - [x] Strip metrik struktural & perilaku: Pengikut/Mengikuti, Frekuensi Postingan/Hari, Burstiness ($B$), Entropi Temporal ($H$).
  - [x] Tombol pemicu slide-over `InspectorDrawer` untuk inspeksi mendalam 21 fitur XAI.
- [x] **Component `ForensicDossierCard` (`src/components/investigation/ForensicDossierCard.tsx`):**
  - [x] Header berkas dossier resmi PUSSIBERAD (Klasifikasi RAHASIA) dengan lencana `ThreatLevel` (CRITICAL, HIGH, MEDIUM, LOW).
  - [x] Agenda operasi utama & institusi/sasaran yang ditargetkan.
  - [x] Daftar poin bukti forensik terverifikasi (*verified forensic evidence points*).
  - [x] Rekomendasi taktis operasi pertahanan siber kognitif Satgas PUSSIBERAD.
  - [x] Footer sidik jari kriptografis rantai barang bukti hukum (*Digital Chain of Custody*) SHA-256 terintegrasi.
- [x] **Integrasi Workspace & Progressive Disclosure (`src/App.tsx`):**
  - [x] Navigasi mulus: Form Pencarian -> Live Stepper -> Tampilan Hasil (Actor Summary + Dossier Card berdampingan).
  - [x] Kepatuhan ketat aturan 3-group viewport `DESIGN.md` dan rasio whitespace > 25%.
- [x] **Verifikasi Build & Docker Deployment:**
  - [x] TypeScript compiler (`tsc`) & Vite production bundle pass 100% (0 errors, 0 warnings).
  - [x] Container Docker `axiom_frontend` di-rebuild dan dijalankan permanen di port 3000.

#### 3.3 Visualisasi Inti: Network Graph, Heatmap & Entropy Gauge (Hari 3-5)
- [x] **Network Graph (`src/components/visualization/NetworkGraph.tsx` + `@xyflow/react`):**
  - [x] Nodes: Target inti di tengah (besar, aksen Tactical Cyan `#38BDF8`), anggota klaster periferi berwarna sesuai kelas ancaman (Bot Rose, Buzzer Amber, Organik Emerald).
  - [x] Edges: Keterpautan semantik CIB (garis putus-putus amber dengan animasi aliran partikel), koordinasi temporal (garis solid biru), edge pasif dimute 35% opacity anti-hairball.
  - [x] Kontrol: Zoom in/out, pan, reset view, filter berdasarkan tipe edge (`Semua`, `Klaster CIB`, `Interaksi Lain`).
  - [x] Interaksi: Klik node mana pun otomatis membuka *Contextual Inspector Drawer* (380px) untuk melihat detail akun, skor keyakinan, dan bukti keterpautan.
- [x] **Circadian Heatmap (`src/components/visualization/CircadianHeatmap.tsx`):**
  - [x] Grid interaktif 24 Jam &times; 7 Hari dengan skala intensitas warna volume postingan.
  - [x] Bounding box & penanda *Structured Working Hours* (Senin-Jumat 09:00 - 17:00) jika terdeteksi sindikat buzzer.
  - [x] Statistik analitis: Rasio jam kerja, uji Chi-Square goodness-of-fit (&chi;&sup2; dengan $p < 0.001$), dan jam puncak aktivitas.
- [x] **Shannon Posting Entropy Gauge (`src/components/visualization/EntropyGauge.tsx`):**
  - [x] Pengukur linear $H_{norm} \in [0.00, 1.00]$ dengan ambang batas visual: $< 0.35$ (Otomasi Terjadwal/Bot), $0.35 - 0.70$ (Semi-Otomatis/Buzzer), $\ge 0.70$ (Variabilitas Alami).
  - [x] Diagram batang 8-bin interval waktu postingan (< 1m s/d > 24h) dengan nilai median jeda waktu.
- [x] **Narrative Drift Timeline (`src/components/visualization/NarrativeDriftChart.tsx`):**
  - [x] Pelacak pergeseran centroid semantik embeddings MiniLM antar-jendela waktu dengan kata kunci teratas per fase.
- [x] **Kepatuhan Aturan Kompleksitas Tampilan (`DESIGN.md`):**
  - [x] Sub-tab switcher bersih pada modul narasi untuk membatasi maksimal 2 visualisasi per layar secara bersamaan.
  - [x] Kompilasi `tsc && vite build` 100% lulus tanpa error dan tanpa warning (2.65s).
  - [x] Container Docker `axiom_frontend` terbarui dan aktif permanen di port 3000.

#### 3.4 Export & Polish (Hari 5-6)
- [x] **Dual-Tier Forensic Audit Ledger Table (`src/components/reports/DualTierLedgerTable.tsx`):**
  - [x] Mode Tier 1: Top 10 High-Risk Perpetrators dengan skor keyakinan, klasifikasi, dan metrik primer.
  - [x] Mode Tier 2: 100% Comprehensive Raw Forensic Ledger dengan paginasi, pencarian query, dan pill filter klasifikasi (Semua, Buzzer, Bot, Organik).
  - [x] Kolom ringkas (maksimal 5-6 kolom sesuai `DESIGN.md`) dengan tombol inspeksi langsung ke `InspectorDrawer`.
- [x] **Export Action Panel (`src/components/reports/ExportActionPanel.tsx`):**
  - [x] Tombol "Cetak Berkas Dossier Resmi (A4)" yang membuka jendela cetak HTML A4 PUSSIBERAD lengkap dengan kop dinas, tabel forensik, stempel, dan CSS `@media print`.
  - [x] Tombol "Unduh Ledger CSV (RFC 4180)" untuk ekspor spreadsheet komprehensif seluruh barang bukti.
  - [x] Banner verifikasi integritas kriptografis rantai barang bukti (*Chain of Custody*) SHA-256.
- [x] **Loading States & Error Boundaries (`src/components/common/ErrorBoundary.tsx`):**
  - [x] Pelindung *runtime crash* dark-mode bertema pertahanan siber PUSSIBERAD terpasang di level tertinggi (`main.tsx`).
  - [x] Tombol pemulihan sesi (*Reset View / Reload*) dan detail log error informatif.
- [x] **Responsive Check & Visual Polish (`DESIGN.md`):**
  - [x] Tata letak responsif optimal untuk layar laptop juri (1366x768) hingga monitor proyektor (1920x1080).
  - [x] Rasio kontras teks WCAG AAA pada latar belakang obsidian (`#090D16`), label ARIA, dan navigasi keyboard.
- [x] **Verifikasi Build & Docker Deployment:**
  - [x] Kompilasi `tsc && vite build` 100% sukses tanpa error & tanpa warning (3.52s).
  - [x] Container Docker `axiom_frontend` di-rebuild dan berjalan permanen di port 3000.

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
- [x] **Axiom-Core Research Engine:** Dokumentasi spesifikasi ilmiah mandiri (`docs/AXIOM_CORE_FRAMEWORK.md`), berkas sitasi akademik (`CITATION.cff`), dan tautan repositori engine ([AC-AxiomCore](https://github.com/AcademyCity-RND/AC-AxiomCore)).
- [x] **Harvester Concurrency & Dataset Cleanliness:** Harvester paralel 6-worker simultan dengan sinkronisasi 2-arah cerdas (`run_harvester.ps1`), 80 target aktif 100% tuntas, dan 191 file dataset cadangan otentik bersih.
- [ ] **Repo Public/GitHub:** `AC-ProjectAxiom` (README lengkap, cara jalanin, license MIT).
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
services:
  postgres:
    image: postgres:16-alpine
    container_name: axiom_postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-axiom_db}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports:
      # Hardened: Bind to localhost (127.0.0.1) only, host port 5434
      - "127.0.0.1:${POSTGRES_HOST_PORT:-5434}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - axiom_net

  chromadb:
    image: chromadb/chroma:0.5.20
    container_name: axiom_chromadb
    volumes:
      - chroma_data:/chroma/chroma
    ports:
      # Hardened: Bind to localhost (127.0.0.1) only, isolating vector store
      - "127.0.0.1:8001:8000"
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_HTTP_PORT=8000
      - IS_PERSISTENT=TRUE
    networks:
      - axiom_net

  backend:
    image: axiom-backend:1.0.0
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: axiom_backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
      - ./data/chromadb:/app/data/chromadb
    ports:
      - "8000:8000"
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    depends_on:
      postgres:
        condition: service_healthy
      chromadb:
        condition: service_started
    networks:
      - axiom_net

  frontend:
    image: axiom-frontend:1.0.0
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: axiom_frontend
    ports:
      - "3000:80"
    env_file:
      - .env
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - axiom_net

volumes:
  pg_data:
  chroma_data:

networks:
  axiom_net:
    driver: bridge
```

---

## 📦 DEPENDENCY VERSIONS — STABLE & COMPATIBLE (Lockfile Reference)

### Backend (`backend/requirements.txt`)
```text
# Core Framework
fastapi>=0.115.11
uvicorn[standard]==0.32.1
pydantic>=2.12.5,<2.15.0
pydantic-settings>=2.6.1
python-multipart>=0.0.31

# Database & ORM
sqlalchemy==2.0.36
alembic==1.14.0
asyncpg==0.30.0
psycopg2-binary==2.9.10

# Vector DB & Embeddings (torch CPU is installed in Dockerfile layer)
chromadb-client==0.5.20
sentence-transformers>=5.6.0
transformers>=5.10.0

# ML Classical
xgboost==2.1.3
scikit-learn==1.5.2
scipy==1.14.1
numpy==1.26.4
pandas==2.2.3
joblib==1.4.2

# Multi-Platform Scraping (X, YouTube, Instagram)
twscrape==0.20.1
aiosqlite==0.22.1
httpx==0.27.2
beautifulsoup4==4.15.0
lxml>=6.1.0
youtube-comment-downloader==0.1.84
instaloader==4.16
instagrapi>=3.2.2

# LLM Client (Groq)
groq==0.13.0

# Document & Template
jinja2==3.1.6

# Utilities & Security
bcrypt>=4.0.0
pyjwt>=2.15.0
python-dotenv>=1.2.2
pyyaml==6.0.2

# Testing
pytest==8.3.3
pytest-asyncio==0.23.8
pytest-cov==5.0.0
```

### Frontend (`frontend/package.json` — dependencies only)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.16",
    "axios": "^1.20.0",
    "@tanstack/react-query": "^5.104.5",
    "@xyflow/react": "^12.12.0",
    "echarts": "^6.1.0",
    "echarts-for-react": "^3.0.6",
    "@react-pdf/renderer": "^4.9.0",
    "lucide-react": "^1.61.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.7.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.3",
    "vite": "^8.3.4",
    "@vitejs/plugin-react": "^6.1.2",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^26.6.5"
  }
}
```

> **Catatan Versi & Lingkungan Produksi:**
> - **Python 3.11/3.12** direkomendasikan (didukung penuh oleh semua wheel ML).
> - **PyTorch CPU** dioptimasi untuk `sentence-transformers` & MiniLM agar ultra-ringan tanpa ketergantungan GPU CUDA di laptop dev/server PUSSIBERAD.
> - **twscrape 0.20.1** menggantikan Twikit dengan pool akun burner berbasis cookie browser (`auth_token`, `ct0`).
> - **React 19 + Vite 8 + Tailwind CSS v4** memberikan performa bundling instan (CSR zero SSR vulnerability).
> - **ChromaDB 0.5.20** terisolasi di port lokal `8001` untuk zero external attack vector.
> - **PostgreSQL 16** menggunakan bind port `127.0.0.1:5434` untuk mencegah konflik dengan database lokal.

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
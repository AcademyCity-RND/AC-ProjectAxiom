# 🛡️ Axiom — Cognitive Domain Threat Intelligence & Inauthentic Behavior Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI Pipeline](https://github.com/AcademyCity-RND/AC-ProjectAxiom/actions/workflows/ci.yml/badge.svg)](https://github.com/AcademyCity-RND/AC-ProjectAxiom/actions/workflows/ci.yml)
[![Tests: 62/62 Passed](https://img.shields.io/badge/Tests-62%2F62%20Passed-brightgreen.svg?logo=pytest&logoColor=white)](https://github.com/AcademyCity-RND/AC-ProjectAxiom/actions)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%2B-brightgreen.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI: 0.115.11](https://img.shields.io/badge/FastAPI-0.115.11-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vite: 8](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React: 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)](https://react.dev/)
[![Target: PUSSIBERAD](https://img.shields.io/badge/Competition-Kartika%20Cyber%20Hackathon%202026-red.svg)](https://kartikacyberhackathon.id/)

> **Kategori:** 04 Cognitive Domain (Siber Sosial)  
> **Institusi:** Pusat Siber TNI Angkatan Darat (PUSSIBERAD) & CODEPOLITAN  
> **Status:** MVP Prototype Development (Target Submission: 15 November 2026)

---

## 🎯 Gambaran Umum (Executive Overview)

### Filosofi Axiom
"Aksioma" (Axiom) mencerminkan kebenaran dasar yang tidak perlu dibuktikan lagi. Project Axiom bertujuan menjadi landasan absolut dalam menemukan fakta di tengah kebisingan disinformasi, kampanye buzzer, dan manipulasi kognitif di ruang siber. Kami percaya bahwa di balik setiap narasi terkoordinasi, terdapat jejak perilaku yang dapat diverifikasi secara empiris.

### Tagline
*"Unveiling the Truth in the Cognitive Battlefield."*

**Axiom** adalah platform intelijen forensik siber sosial yang dirancang untuk mendeteksi, mengklasifikasikan, dan memetakan aktor inautentik (**Bot**, **Buzzer/Astroturfer**, dan **Manusia Autentik**) serta operasi pengaruh (*Psychological Operations / PsyOps*) di media sosial secara *real-time*, berbasis bukti (*Explainable AI*), dan mandiri tanpa biaya API eksternal.

Sistem ini mentransformasi proses investigasi manual yang memakan waktu berhari-hari menjadi analisis otomatis dalam hitungan detik, memberikan atribusi ancaman nyata bagi pertahanan kedaulatan informasi nasional.

---

## ⚡ Fitur Utama (Core Capabilities)

1. **Target Actor Profiling (X / Twitter Engine):**
   - Investigasi mendalam riwayat akun `@username`: tweet orisinal, replies, reposts, dan jejaring interaksi via `twscrape` (1 akun burner aman via cookies browser tanpa risiko banned).
2. **Multi-Platform Event & Incident Auditing:**
   - Deteksi amplifikasi terkoordinasi pada konten viral lintas platform:
     - **X (Twitter):** Cuitan tunggal & seluruh pohon balasan (*replies*).
     - **Instagram:** Feed Post (`/p/`) & Reels (`/reel/`) via Mobile Private API & Instaloader.
     - **YouTube:** Video Panjang (`/watch`) & Shorts (`/shorts/`) via streaming parser Innertube HTTP.
3. **Tri-Class AI Classification Engine:**
   - Membedakan tiga entitas dengan presisi tinggi menggunakan XGBoost Classifier:
     - **Bot (Automated):** Skrip terjadwal, entropi waktu rendah, minim variasi kata.
     - **Buzzer (Astroturfer):** Akun manusia/semi-otomatis dengan pola jam kerja terstruktur (08.00–18.00 WIB) dan konsentrasi narasi ekstrem pada figur/isu tertentu.
     - **Manusia (Autentik):** Pola sirkadian alami, minat heterogen, interaksi sosial organik.
4. **Coordinated Inauthentic Behavior (CIB) Cluster Mapping:**
   - Visualisasi graf interaktif (React Flow / Cytoscape) yang memetakan keterkaitan antar-akun yang menyebarkan narasi parafrase serupa dalam jendela waktu sempit via ChromaDB vector similarity (`all-MiniLM-L6-v2`).
5. **Circadian 24/7 Heatmap & Temporal Entropy:**
   - Visualisasi jadwal aktif mingguan (24x7 matrix & uji Chi-Square goodness-of-fit) untuk mendeteksi jam kerja buzzer bayaran vs operasional bot 24 jam nonstop.
6. **Explainable AI (XAI) Threat Attribution & Prompt Defense:**
   - Menggunakan Llama 3.3 70B (via Groq LPU) untuk menghasilkan poin-poin pembuktian logis (*evidence points*) mengapa akun dicap berbahaya.
   - Dilengkapi *Adversarial Prompt Guard* (`[REDACTED_CONTROL_TOKEN]`) anti-jailbreak dari komentar bot/buzzer.
7. **Dual-Tier Forensic Ledger & Dossier Export:**
   - Tabel ringkasan Top 10 Attackers serta Audit Ledger 100% seluruh komentator.
   - Ekspor berkas dossier resmi siap cetak (A4 PDF/HTML dengan kop dinas PUSSIBERAD) disertai rantai bukti kriptografis (*Digital Chain of Custody* SHA-256).
8. **Research Dataset Harvester (RFC 4180):**
   - CLI Tooling mandiri untuk ekstraksi dataset riset empiris aktual pasca-2020 di 6 skenario (X User, X Tweet, IG Post, IG Reels, YT Shorts, YT Video) dengan fitur auto-resume & checkpoint.

---

## 🏗️ Arsitektur Sistem (High-Level Architecture)

```
┌────────────────────────────────────────────────────────┐
│          FRONTEND DASHBOARD (Vite + React 19)          │
│  - Target Search (@user / Event URL)  - React Flow     │
│  - 24/7 Circadian Heatmap             - Dual-Tier Ledger│
│  - Forensic Dossier Card (SHA-256)    - Export A4/CSV  │
└───────────────────────────┬────────────────────────────┘
                            │ (REST / JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│             CORE BACKEND API (FastAPI Async)           │
│  - Investigation Orchestrator     - Event Orchestrator │
│  - Rate Limiting Middleware       - Anti-SSRF Guard    │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────┐ ┌──────────────┐ ┌──────────────┐
│ MULTI-PLATFORM ENGINE│ │ VECTOR STORE │ │ AI / ML CORE │
│ - X (twscrape)       │ │ - ChromaDB   │ │ - XGBoost    │
│ - Instagram (Private)│ │   (MiniLM)   │ │ - Groq Llama │
│ - YouTube (Innertube)│ │              │ │   3.3 (XAI)  │
└──────────────────────┘ └──────────────┘ └──────────────┘
       │                    │                    │
       └────────────────────┴────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            PERSISTENCE (PostgreSQL 16)                 │
│  - Investigation Cases  - Actor Profiles  - Audit Trail│
└────────────────────────────────────────────────────────┘
```

---

## 📂 Struktur Repositori (Repository Structure)

```text
axiom/
├── docs/                      # Dokumentasi Teknis & Panduan
│   ├── PRD-Axiom.md           # Product Requirements Document Acuan
│   ├── ROADMAP-CHECKLIST.md   # Master Roadmap & Checklist 4 Minggu
│   └── SCRAPING_DATA_FORMAT.md# Unified Scraping & AI Feature Specification
├── backend/                   # FastAPI Backend Service
│   ├── app/
│   │   ├── api/v1/endpoints/  # Route Handlers (investigate, network, export)
│   │   ├── core/              # Config, Security, Database Sessions
│   │   ├── models/            # SQLAlchemy DB Models
│   │   ├── schemas/           # Pydantic Schemas (Request/Response)
│   │   ├── templates/         # Jinja2 Dossier HTML Templates (@media print A4)
│   │   └── services/          # Core Engines:
│   │       ├── scraper/       # twscrape, instaloader, youtube adapters
│   │       ├── features.py    # 21-Feature Extractor (Temporal, Structural, Content)
│   │       ├── classifier.py  # XGBoost Tri-Class Bot Classifier & XAI
│   │       ├── embedder.py    # MiniLM-L6-v2 Local Vector Embedder
│   │       ├── vector_store.py# ChromaDB Client & CIB Cluster Detector
│   │       ├── llm_analyst.py # Groq Llama 3.3 Cognitive Analyst & Prompt Defense
│   │       ├── x_auditor.py   # X Profile & Tweet Replies Investigator
│   │       ├── instagram_auditor.py # IG Post & Reels Investigator
│   │       ├── youtube_auditor.py   # YT Video & Shorts Investigator
│   │       └── investigation_orchestrator.py # Pipeline Coordinator
│   ├── alembic/               # Database Migration Scripts
│   ├── tests/                 # 62/62 Unit & Integration Tests Passed
│   ├── Dockerfile             # Container Definition Backend
│   └── requirements.txt       # Locked Python Dependencies
├── frontend/                  # Vite + React 19 Web Dashboard
│   ├── src/
│   │   ├── components/        # Tactical Cyber Dark Theme Components
│   │   │   ├── common/        # InspectorDrawer, ThreatBadge, ErrorBoundary
│   │   │   ├── investigation/ # ActorSearchForm, Stepper, DossierCard
│   │   │   ├── visualization/ # NetworkGraph (React Flow), Heatmap, Entropy
│   │   │   └── reports/       # DualTierLedgerTable, ExportActionPanel
│   │   ├── stores/            # Zustand State Management (useCaseStore, useAuthStore)
│   │   └── services/api.ts    # Axios REST API Client Layer
│   ├── package.json           # Locked Dependencies (pnpm)
│   ├── tailwind.config.ts     # Cyber Defense Dark Palette (v4)
│   ├── vite.config.ts         # Vite Configuration & Backend Proxy
│   └── tsconfig.json          # TypeScript Config
├── tools/                     # Operational & Research Tooling
│   └── dataset_harvester/     # Standalone Harvester (60 Targets RFC 4180 CSV)
│       ├── harvester.py       # Multi-Channel CLI Engine
│       └── targets.json       # 60 Verified Target Scenarios (Post-2020)
├── data/                      # Local Embedded Storage
│   ├── chromadb/              # Persistent Vector Collections
│   ├── models/                # Trained XGBoost Artifacts (xgboost_tri_class.json)
│   └── raw_datasets/          # Harvested Datasets (X, Instagram, YouTube)
├── docker-compose.yml         # Local Infrastructure Orchestration (4 Containers)
├── run_harvester.ps1          # One-Click Harvester Execution Script
├── .env.example               # Complete Environment Configuration Template
├── .gitignore                 # Sanitized Git Ignore (PII & Sessions Locked)
└── README.md                  # Project Overview (This File)
```

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat Sistem
- Docker & Docker Compose
- Python 3.11+
- Node.js 20+ & pnpm
- Akun Groq Cloud (API Key gratis di [console.groq.com](https://console.groq.com))

### 2. Kloning & Konfigurasi Lingkungan
```bash
git clone https://github.com/AcademyCity-RND/AC-ProjectAxiom.git
cd AC-ProjectAxiom
cp .env.example .env
```
Buka file `.env` dan masukkan:
- `GROQ_API_KEY`: API Key Groq Anda
- Kredensial burner X (`TWITTER_USERNAME`, `TWITTER_AUTH_TOKEN`, `TWITTER_CT0`)
- Kredensial burner Instagram (`INSTAGRAM_SESSIONID`)

### 3. Menjalankan via Docker Compose (Rekomendasi)
```bash
docker-compose up -d --build
```
Layanan akan tersedia di:
- **Frontend Dashboard:** `http://localhost:3000`
- **FastAPI Interactive Docs:** `http://localhost:8000/docs`
- **ChromaDB Vector Endpoint:** `http://localhost:8001`
- **PostgreSQL Database:** `localhost:5434` *(port 5434 di sisi host untuk mencegah konflik port 5432 lokal)*

### 4. Menjalankan Dataset Harvester (Opsi QA / Riset)
Untuk mengumpulkan dataset mentah 60 CSV dari 6 skenario nyata:
```powershell
# Jalankan seluruh 60 target secara otomatis
.\run_harvester.ps1 -all

# Atau cek status kelengkapan CSV yang sudah terkumpul
.\run_harvester.ps1 -status
```

---

## 📊 Matriks Fitur & Status Implementasi

- [x] **Dokumentasi & Spesifikasi PRD** (Selesai di `docs/PRD-Axiom.md`)
- [x] **Master Checklist & Roadmap** (Selesai di `docs/ROADMAP-CHECKLIST.md`)
- [x] **Data Contract Standard** (Selesai di `docs/SCRAPING_DATA_FORMAT.md`)
- [x] **Minggu 1:** Ingesti X (Twitter), Skema DB, ChromaDB, XGBoost Baseline & Core API Orchestrator (100% Selesai: Milestone 1.1 s/d 1.6)
- [x] **Minggu 2:** Integrasi Groq LLM Explainable AI, Prompt Injection Defense, Multi-Platform Auditing (X, IG, YT), PDF/CSV Export (100% Selesai: Milestone 2.1 s/d 2.4)
- [x] **Minggu 3:** Dashboard Tactical Cyber (Vite + React 19), React Flow Network Graph, Circadian 24/7 Heatmap, Dual-Tier Ledger Table (100% Selesai: Milestone 3.1 s/d 3.4)
- [x] **Dataset Harvester Engine:** Ekstraksi 60 file CSV dataset mentah aktual pasca-2020 berstandar RFC 4180 (100% Selesai)
- [ ] **Minggu 4:** Pengujian Menyeluruh (QA Testbed), Video Demo Production, Slide Deck, & Submission (Sedang Berjalan / Current Focus)

---

## 🔒 Keamanan Dependensi & Hardening (CVE Mitigasi 2024–2026)

Untuk menjamin keandalan level militer dan operasional siber pertahanan yang tangguh, seluruh pustaka perangkat lunak telah diaudit dan diperbarui terhadap celah keamanan (CVE) terkini:
- **FastAPI 0.115.11 & Starlette 0.46.2:** Menutup celah CVE-2024-47874 (*Denial of Service* akibat alokasi memori multipart form data tak terbatas).
- **python-multipart 0.0.20:** Mitigasi ReDoS (*Regular Expression Denial of Service*) dan CVE-2024-42561.
- **Jinja2 3.1.6:** Menutup celah sandbox escape dan arbitrary code execution (CVE-2024-56326 & CVE-2025-27516).
- **Vite SPA + React 19:** Arsitektur murni *Client-Side Rendering (CSR)* yang mengeliminasi vektor serangan *Server-Side Request Forgery (SSRF)* dan kelemahan *Server Actions* pada dashboard operasional internal.
- **Docker Isolation & Network Hardening:** Loopback bind `127.0.0.1` pada port PostgreSQL & ChromaDB untuk mencegah akses eksternal di luar mesin host.

---

## ⚖️ Etika & Kepatuhan Hukum

Axiom dirancang khusus untuk verifikasi ruang siber dan perlindungan publik:
- **Hanya Data Publik:** Sistem hanya memproses data yang dapat diakses publik (*Publicly Available Information*).
- **Anti-Doxxing & Privacy:** Tidak ada penambangan data pribadi privat (DM/Email) sesuai UU PDP (UU No. 27/2022) & GDPR.
- **Explainable Defense:** Skor tidak pernah berupa vonis mutlak, melainkan dilengkapi indikator logis terukur untuk mencegah *false positives*.

---

## 👥 Tim Pengembang

- **Hilarius Christiano Avin Paliling (Xte-1412)** — *System Architect & AI Engineer*

*Disusun untuk Kartika Cyber Hackathon 2026 — Pusat Siber Angkatan Darat (PUSSIBERAD).* 🛡️🇮🇩

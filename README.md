# 🛡️ Axiom — Cognitive Domain Threat Intelligence & Inauthentic Behavior Detection Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI Pipeline](https://github.com/AcademyCity-RND/AC-ProjectAxiom/actions/workflows/ci.yml/badge.svg)](https://github.com/AcademyCity-RND/AC-ProjectAxiom/actions/workflows/ci.yml)
[![Tests: 59/59 Passed](https://img.shields.io/badge/Tests-59%2F59%20Passed-brightgreen.svg?logo=pytest&logoColor=white)](https://github.com/AcademyCity-RND/AC-ProjectAxiom/actions)
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
   - Investigasi mendalam riwayat akun `@username`: tweet orisinal, replies, reposts, dan jejaring interaksi.
   - Scraping berbasis session pool tanpa biaya langganan enterprise.
2. **Tri-Class AI Classification Engine:**
   - Membedakan tiga entitas dengan presisi tinggi:
     - **Bot (Automated):** Skrip terjadwal, entropi waktu rendah, minim variasi kata.
     - **Buzzer (Astroturfer):** Akun manusia/semi-otomatis dengan pola jam kerja (08.00–18.00 WIB) dan konsentrasi narasi ekstrem pada figur/isu tertentu.
     - **Manusia (Autentik):** Pola sirkadian alami, minat heterogen, interaksi sosial organik.
3. **Coordinated Inauthentic Behavior (CIB) Cluster Mapping:**
   - Visualisasi graf interaktif (Cytoscape.js) yang memetakan keterkaitan antar-akun yang menyebarkan narasi parafrase serupa dalam jendela waktu sempit via ChromaDB vector similarity.
4. **Circadian 24/7 Heatmap & Temporal Entropy:**
   - Visualisasi jadwal aktif mingguan untuk mendeteksi jam kerja buzzer bayaran vs operasional bot 24 jam nonstop.
5. **Explainable AI (XAI) Threat Attribution:**
   - Menggunakan Llama 3.3 (via Groq LPU) untuk menghasilkan poin-poin pembuktian logis (*evidence points*) mengapa akun dicap berbahaya.
6. **Official Forensic Dossier Export:**
   - Ekspor ringkasan investigasi lengkap ke berkas PDF terverifikasi (disertai SHA-256 hash) untuk kebutuhan tindak lanjut satuan siber.
7. **Military-Grade AAA Access Control & Hardening:**
   - Otentikasi berbasis JWT dengan Role-Based Access Control (Admin, Investigator, Analyst).
   - Validasi ketat Pydantic & pertahanan Anti-SSRF (mencegah eksploitasi server internal).
   - Isolasi jaringan Docker (loopback bind `127.0.0.1` pada port PostgreSQL & ChromaDB) dan pencatatan audit trail investigasi.

---

## 🏗️ Arsitektur Sistem (High-Level Architecture)

```
┌────────────────────────────────────────────────────────┐
│          FRONTEND DASHBOARD (Vite + React 19)          │
│  - Target Search (@user / URL)    - Interactive Graph  │
│  - 24/7 Circadian Heatmap         - Evidence Dossier   │
└───────────────────────────┬────────────────────────────┘
                            │ (REST / JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│             CORE BACKEND API (FastAPI Async)           │
│  - Investigation Orchestrator     - Job Queue Manager  │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ DATA SCRAPER │     │ VECTOR STORE │     │ AI / ML CORE │
│ - Twikit Pool│     │ - ChromaDB   │     │ - XGBoost    │
│ - YT Auditor │     │   (MiniLM)   │     │ - Groq Llama3│
└──────────────┘     └──────────────┘     └──────────────┘
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
│   ├── PRD-Axiom.md       # Product Requirements Document Acuan
│   └── ROADMAP-CHECKLIST.md   # Master Roadmap & Checklist 4 Minggu
├── backend/                   # FastAPI Backend Service
│   ├── app/
│   │   ├── api/v1/endpoints/  # Route Handlers (investigate, network, export)
│   │   ├── core/              # Config, Security, Database Sessions
│   │   ├── models/            # SQLAlchemy DB Models
│   │   ├── schemas/           # Pydantic Schemas (Request/Response)
│   │   └── services/          # Core Engines:
│   │       ├── scraper/       # twscrape Twitter & YouTube parsers
│   │       ├── features.py    # 21-Feature Extractor (Temporal, Structural, Content, Network)
│   │       ├── classifier.py  # XGBoost Tri-Class Bot Classifier & XAI
│   │       ├── embedder.py    # MiniLM-L6-v2 Local Vector Embedder
│   │       ├── vector_store.py# ChromaDB Client & CIB Cluster Detector
│   │       └── investigation_orchestrator.py # End-to-end Pipeline Coordinator
│   ├── alembic/               # Database Migration Scripts
│   ├── tests/                 # Unit & Integration Tests
│   ├── Dockerfile             # Container Definition Backend
│   └── requirements.txt       # Locked Python Dependencies
├── frontend/                  # Vite + React 19 Web Dashboard
│   ├── src/
│   │   ├── app/               # Vite React App Router (pages-based or file-based)
│   │   ├── components/        # UI & Analytical Visual Components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── visual/      # Charts, Graphs (ECharts, React Flow)
│   │   ├── stores/            # Zustand State Management
│   │   ├── types/             # TypeScript Shared Types
│   │   └── lib/               # API Client & Utilities
│   ├── package.json           # Locked Frontend Dependencies (pnpm)
│   ├── tailwind.config.ts     # Cyber Defense Dark Theme (v4)
│   ├── vite.config.ts       # Vite Configuration
│   └── tsconfig.json        # TypeScript Config
├── data/                      # Local Embedded Storage
│   ├── chromadb/              # Persistent Vector Collections
│   └── samples/               # Offline Demo & Benchmark Datasets
├── docker-compose.yml         # Local Infrastructure Orchestration
├── .env.example               # Environment Configuration Template
├── .gitignore                # Git ignore file
└── README.md                  # Project Overview (This File)
```

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat Sistem
- Docker & Docker Compose
- Python 3.11+
- Node.js 20+ & pnpm
- Akun Groq Cloud (API Key gratis di https://console.groq.com)

### 2. Kloning & Konfigurasi Lingkungan
```bash
git clone https://github.com/AcademyCity-RND/AC-ProjectAxiom.git
cd AC-ProjectAxiom
cp .env.example .env
# Edit .env dan masukkan GROQ_API_KEY serta akun pool Twitter
```

### 3. Menjalankan via Docker Compose (Rekomendasi)
```bash
docker-compose up -d --build
```
Layanan akan tersedia di:
- **Frontend Dashboard:** `http://localhost:3000`
- **FastAPI Interactive Docs:** `http://localhost:8000/docs`
- **ChromaDB Vector Endpoint:** `http://localhost:8001`
- **PostgreSQL Database:** `localhost:5432`

### 4. Menjalankan Manual (Development Mode)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # atau .\venv\Scripts\activate di Windows PowerShell
pip install torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt --prefer-binary
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

---

## 📊 Matriks Fitur & Status Implementasi

- [x] **Dokumentasi & Spesifikasi PRD** (Selesai di `docs/PRD-Axiom.md`)
- [x] **Master Checklist & Roadmap** (Selesai di `docs/ROADMAP-CHECKLIST.md`)
- [x] **Minggu 1:** Ingesti X (Twitter), Skema DB, ChromaDB, XGBoost Baseline & Core API Orchestrator (100% Selesai: Milestone 1.1 s/d 1.6)
- [ ] **Minggu 2:** Integrasi Groq LLM Explainable AI, Prompt Injection Defense, YouTube Auditing, PDF Export
- [ ] **Minggu 3:** Dashboard Vite + React 19, React Flow Network Graph, Circadian Heatmap
- [ ] **Minggu 4:** Pengujian Menyeluruh, Video Demo, Slide Deck, & Submission (15 Nov 2026)

---

## 🔒 Keamanan Dependensi & Hardening (CVE Mitigasi 2024–2026)

Untuk menjamin keandalan level militer dan operasional siber pertahanan yang tangguh, seluruh pustaka perangkat lunak telah diaudit dan diperbarui terhadap celah keamanan (CVE) terkini:
- **FastAPI 0.115.11 & Starlette 0.46.2:** Menutup celah CVE-2024-47874 (*Denial of Service* akibat alokasi memori multipart form data tak terbatas).
- **python-multipart 0.0.20:** Mitigasi ReDoS (*Regular Expression Denial of Service*) dan CVE-2024-42561.
- **Jinja2 3.1.6:** Menutup celah sandbox escape dan arbitrary code execution (CVE-2024-56326 & CVE-2025-27516).
- **Vite SPA + React 19:** Arsitektur murni *Client-Side Rendering (CSR)* yang mengeliminasi vektor serangan *Server-Side Request Forgery (SSRF)* dan kelemahan *Server Actions* pada dashboard operasional internal.
- **Docker Isolation:** Build-time dependency integrity checking dan multi-stage minimal build.

---

## ⚖️ Etika & Kepatuhan Hukum

Axiom dirancang khusus untuk verifikasi ruang siber dan perlindungan publik:
- **Hanya Data Publik:** Sistem hanya memproses data yang dapat diakses publik (*Publicly Available Information*).
- **Anti-Doxxing & Privacy:** Tidak ada penambangan data pribadi privat (DM/Email) sesuai UU PDP & GDPR.
- **Explainable Defense:** Skor tidak pernah berupa vonis mutlak, melainkan dilengkapi indikator logis terukur untuk mencegah *false positives*.

---

## 👥 Tim Pengembang

- **Hilarius Christiano Avin Paliling (Xte-1412)** — *System Architect & AI Engineer*

*Disusun untuk Kartika Cyber Hackathon 2026 — Pusat Siber Angkatan Darat (PUSSIBERAD).* 🛡️🇮🇩
# 📋 Product Requirements Document — Axiom / Project Axiom (PRD-Axiom)
# Cognitive Domain Threat Intelligence & Inauthentic Behavior Detection Platform
### Satuan Acuan: Pusat Siber TNI AD (PUSSIBERAD) — Kategori 04: Cognitive Domain (Siber Sosial)

> **Kode Proyek / Identitas:** Project Axiom  
> **Tagline:** *"Unveiling the Truth in the Cognitive Battlefield."*  
> **Repositori Target:** `axiom` (Monorepo)  
> **Konteks Kompetisi:** Kartika Cyber Hackathon 2026 (PUSSIBERAD & CODEPOLITAN)  
> **Kategori:** 04 Cognitive Domain — Sub-kategori: *Buzzer/Bot Detection, Social Network Analysis, PsyOps Early Warning*  
> **Arsitektur Utama:** Vite + React 19 SPA (Frontend) + FastAPI Async Core + ChromaDB (Vector Store) + PostgreSQL + XGBoost & Groq Llama 3  
> **Biaya Operasional (Cost Target):** 100% Free-Tier / Open-Source Tooling (Zero External API Cost for MVP)  
> **Status Dokumen:** Acuan Tunggal Spesifikasi Sistem (Source of Truth MVP)

---

## 1. Visi, Latar Belakang & Ruang Lingkup Sistem

### 1.1 Visi Produk (Product Vision) & Filosofi Nama
Menyajikan platform intelijen dan forensik ruang siber sosial yang berkemampuan mendeteksi, mengklasifikasikan, dan memetakan aktor inautentik (**Bot**, **Buzzer/Astroturfer**, dan **Manusia Autentik**) serta operasi pengaruh (*Psychological Operations / PsyOps*) secara *real-time*, akurat, dan berbasis bukti otentik (*Explainable AI*) tanpa ketergantungan pada API berbayar mahal.

**Filosofi Project Axiom:**  
"Aksioma" (Axiom) mencerminkan kebenaran dasar yang tidak perlu dibuktikan lagi. Proyek ini bertujuan menjadi landasan absolut dalam menemukan fakta di tengah kebisingan disinformasi, kampanye buzzer, dan manipulasi kognitif di ruang siber. Kami percaya bahwa di balik setiap narasi terkoordinasi, terdapat jejak perilaku yang dapat diverifikasi secara empiris.

### 1.2 Batasan Ruang Lingkup (Scope & Boundaries)
Berdasarkan realitas arsitektur media sosial publik dan kebutuhan kompetisi PUSSIBERAD:
1. **Fokus Platform & Pola Akses Data (Jujur & Teruji):**
   * **X (Twitter) — Deep-Dive Target Actor Profiling:**
     * Input: `@username` target tunggal.
     * Log yang ditarik: Tweet orisinal, repost/retweet, riwayat balasan (*replies*), target interaksi, dan stempel waktu (*timestamp*) 100–300 aktivitas terakhir.
     * Ekstraksi gratis memanfaatkan session scraper (`twikit` / headless session pool) tanpa biaya langganan X API Enterprise ($100+/bln).
   * **YouTube & Instagram — Crisis Response / Event Auditing:**
     * Input: URL Video YouTube atau URL Postingan Publik Instagram.
     * Log yang ditarik: Seluruh komentar publik pada postingan/video tersebut untuk mendeteksi apakah terjadi serbuan botnet terkoordinasi (*coordinated comment flooding*).
     * YouTube menggunakan YouTube Data API v3 (kuota gratis 10.000 unit/hari) / scraper; Instagram menggunakan public post comment extractor.
   * **BATASAN TEGAS:** Sistem **TIDAK MENJANJIKAN** pelacakan riwayat komentar keluar (*outgoing comments*) per-username di YouTube, Instagram, atau Facebook karena batasan privasi arsitektur platform tersebut (*walled garden*).
2. **Kemandirian Infrastruktur (Air-Gapped & On-Premise Ready):**
   * Core AI pipeline (XGBoost + Embedding `all-MiniLM-L6-v2`) dapat berjalan 100% lokal di CPU/GPU mandiri tanpa mengirim data intelijen sensitif ke server luar, memenuhi standar operasional militer PUSSIBERAD.

### 1.3 Glosarium Istilah Intelijen Siber
* **Cognitive Warfare:** Perang asimetris yang menargetkan domain kognitif publik untuk memanipulasi opini, memicu polarisasi, dan menurunkan legitimasi institusi.
* **Astroturfing (Buzzer Terkoordinasi):** Praktik memanipulasi persepsi publik dengan menciptakan ilusi seolah-olah ada gerakan akar rumput (*grassroots*) massal, padahal dikomandoi oleh segelintir aktor bayaran.
* **CIB (Coordinated Inauthentic Behavior):** Pola di mana sekelompok akun bekerja sama secara serentak menyebarkan narasi tertentu dalam jendela waktu sempit.
* **Explainable Threat Evidence (XAI):** Bukti forensik berbasis fitur terukur yang menjelaskan dasar pemberian label ancaman (bukan sekadar angka probabilitas *black-box*).
* **Entropy Timestamp:** Ukuran keacakan interval waktu antar-postingan untuk membedakan skrip otomatis (entropi rendah) dari ritme manusiawi (entropi tinggi).

---

## 2. Konsolidasi Tech Stack & Lingkungan Kerja

Seluruh komponen teknologi dipilih dengan pertimbangan **kinerja tinggi, kompatibilitas on-premise, dan nol biaya lisensi (100% Free)**:

### 2.1 Matriks Teknologi

| Layer / Kategori | Komponen Teknologi | Versi / Spesifikasi | Peran & Justifikasi Teknis |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Vite + React (SPA)** | React v19 / TS 5.x / Vite 8 | Web dashboard ultra-cepat, zero SSR overhead, optimal untuk visualisasi graf dan data SOC |
| **Styling & UI Kit** | **Tailwind CSS & Lucide Icons**| Tailwind v4 | UI bernuansa *Cyber Defense Dark/Military Glassmorphism* yang profesional |
| **Visualisasi Graf** | **React Flow (@xyflow/react) / Cytoscape.js** | v12.x / v3.x | Visualisasi interaktif simpul jaringan aktor (*Social Network Graph*) & kluster CIB |
| **Visualisasi Metrik**| **Apache ECharts & Recharts** | ECharts v6 / React v3 | Heatmap aktivitas 24/7, grafik entropi waktu, dan radar chart perilaku |
| **Data Fetching / Polling**| **TanStack Query** | v5.x | Polling asynchronous investigation task & cache state management |
| **Dossier Export** | **@react-pdf/renderer** | v4.x (Client-side) | Pembuatan berkas PDF resmi instan langsung dari browser tanpa beban server |
| **Backend Engine** | **FastAPI (Python)** | v0.115.11 / Starlette 0.46.2 / Py 3.11/3.12 | Asynchronous high-throughput processing, Pydantic v2 validation, hardened against multipart CVE-2024-47874 & ReDoS |
| **Database Relasional**| **PostgreSQL** | v16+ (Docker) | Penyimpanan log kasus, profil target, hasil scoring, dan audit trail |
| **Vector Database** | **ChromaDB** | v0.5.20 / Server v0.5.5 | Indexing dan pencarian semantic similarity copypasta antar-cuitan |
| **Scraping Adapter** | **Twikit + Scraper Pool** | v2.2.0 Async Engine | Penarikan data X (Twitter) berbasis session cookie gratis & anti-block |
| **ML Classifier** | **XGBoost & Scikit-Learn** | v2.1.3 / v1.5.2 | Klasifikasi tabular 3-kelas (*Bot, Buzzer, Manusia*) dalam <50ms |
| **NLP Embeddings** | **Sentence-Transformers** | `all-MiniLM-L6-v2` / v3.3.1 | Embedding semantik 384-dimensi lokal (cepat, hemat RAM, akurat) |
| **Narrative LLM** | **Llama 3.3 70B via Groq** | Free Tier API (<1s inference) | Sintesis narasi intelejen, deteksi framing isu, dan perangkum laporan |

### 2.2 Konfigurasi Environment (`.env.example`)

```env
# Backend & Port Settings
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# Database Connections
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/axiom_db
CHROMA_PERSIST_DIR=./data/chromadb

# AI Inference (Groq LPU - Free Tier)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile

# X (Twitter) Scraper Credentials Pool (Multiple Accounts for Rotation)
X_ACCOUNTS_POOL='[{"username":"acc1","password":"pwd","email":"e1"},{"username":"acc2","password":"pwd","email":"e2"}]'

# YouTube Data API v3 (Optional for Video Auditing)
YOUTUBE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Arsitektur Komunikasi Data & Pipeline Deteksi Forensik

Sistem menerapkan arsitektur *Pipeling Tiga Tingkat (Tri-Tier Analytical Pipeline)* yang mengisolasi ekstraksi data, pemrosesan fitur AI, dan penyajian intelijen:

```mermaid
flowchart TD
    subgraph UI["Frontend Interface (Vite + React SPA)"]
        Search["Target Search\n(@username / URL)"]
        GraphView["Interactive Network Graph\n(Cytoscape.js)"]
        HeatmapView["Circadian 24/7 Heatmap\n& Entropy Radar"]
        ReportView["Forensic Dossier Export\n(PDF/CSV Report)"]
    end

    subgraph API["Backend Gateway (FastAPI Async)"]
        Router["Investigation Controller"]
        Queue["Async Job Task Manager\n(BackgroundTasks / Celery)"]
    end

    subgraph Ingestion["Data Ingestion Adapters"]
        XAdapter["X (Twitter) Engine\n(Twikit Session Pool)"]
        YTAdapter["YouTube Video Auditor\n(Comment Threads API)"]
        IGAdapter["Instagram Post Auditor\n(Public Comment Parser)"]
    end

    subgraph AI["Analytical & ML Engine"]
        FeatEng["Feature Extraction Engine\n- Temporal Entropy\n- Ratio Following/Follower\n- Reply-to-Tweet Ratio"]
        Embedder["Local Embedder\n(all-MiniLM-L6-v2)"]
        XGB["XGBoost Classifier\n(Bot vs Buzzer vs Organic)"]
        Chroma["ChromaDB Vector Store\n(Narrative Clustering & CIB)"]
        LLM["Llama 3.3 (Groq LPU)\n(PsyOps Intent & Summary)"]
    end

    subgraph Storage["Persistence Layer"]
        PG[("PostgreSQL\n(Case Logs & Profiles)")]
    end

    %% Connections
    Search --> Router
    Router --> Queue
    Queue --> XAdapter & YTAdapter & IGAdapter
    XAdapter & YTAdapter --> FeatEng & Embedder
    
    FeatEng --> XGB
    Embedder --> Chroma
    Chroma --> FeatEng
    
    XGB & Chroma --> LLM
    LLM --> PG
    
    PG --> Router
    Router --> GraphView & HeatmapView & ReportView
```

### 3.1 Alur Deteksi: Dari Data Mentah Menuju Taksonomi 3-Kelas

```mermaid
sequenceDiagram
    autonumber
    participant Client as Web Dashboard
    participant API as FastAPI Backend
    participant Engine as Scraper Engine
    participant ML as XGBoost + ChromaDB
    participant LLM as Llama 3 (Groq)

    Client->>API: POST /api/investigate/target { platform: "x", target: "akun_xyz" }
    API->>Engine: Tarik 200 Interaksi Terbaru (Tweets, Replies, Timestamps)
    Engine-->>API: Array of Activity Logs
    API->>ML: Ekstraksi Vektor Waktu & Semantic Embeddings
    Note over ML: Hitung Entropi Waktu, Ratio Target, & Kluster Copypasta
    ML-->>API: Skor XGBoost [P(Bot), P(Buzzer), P(Human)]
    API->>LLM: Prompt Forensik: Bukti Fitur + Sampel Narasi Ekstrem
    LLM-->>API: Sintesis Intelijen & Explainable Attribution
    API-->>Client: Payload Hasil Investigasi Lengkap (<10 detik)
```

---

## 4. Matriks Pemetaan Fitur Sistem (F-01 s.d. F-08)

Seluruh fungsionalitas dirancang memenuhi standar penilaian kompetisi PUSSIBERAD:

| Kode | Nama Fitur | Level Prioritas | Target Output | Keterangan Fungsional |
| :---: | :--- | :---: | :--- | :--- |
| **F-01** | **Target Actor Profiling (X Engine)** | **Must-Have** | Profil Akun & Riwayat | Membedah @username X: riwayat tweet, balasan (*replies*), repost, dan akun yang paling sering diserbu/didukung. |
| **F-02** | **Crisis Event Auditing (YT/IG/X)** | **Must-Have** | Infiltration Audit | Membedah satu URL postingan/video viral dan memetakan rasio keterlibatan akun inautentik pada kolom komentar. |
| **F-03** | **Tri-Class Scoring Engine** | **Must-Have** | Skor 0–100% & Kategori | Menghasilkan probabilitas klasifikasi presisi: **Bot (Automated)**, **Buzzer (Astroturfer)**, atau **Manusia (Organik)**. |
| **F-04** | **Coordinated Inauthentic Behavior (CIB)**| **High** | Network Cluster Graph | Memetakan kolaborasi antar-akun (kesamaan narasi serentak, waktu identik, target serbuan sama). |
| **F-05** | **Circadian Heatmap & Entropy Analysis** | **High** | Visual Heatmap 24/7 | Menampilkan jadwal aktif 24 jam x 7 hari untuk mendeteksi *working hours* buzzer bayaran vs skrip bot 24 jam. |
| **F-06** | **Explainable AI (XAI) Threat Dossier** | **Must-Have** | Evidence Card | Penjelasan logis mengapa akun dicap berbahaya: *"Indikator 1: 87% tweet memuji subjek X, Indikator 2: Entropi waktu mendekati 0"*. |
| **F-07** | **Official Dossier Export (PDF/CSV)** | **Must-Have** | Berkas Forensik Siap Pakai| Ekspor berkas laporan intelijen lengkap dengan stempel verifikasi untuk barang bukti tindak lanjut satuan siber. |
| **F-08** | **Watchlist & Early Warning Alert** | **Medium** | Panel Pemantauan Berkala | Menyimpan daftar akun target ancaman tinggi untuk dipantau lonjakan aktivitasnya secara otomatis. |

---

## 5. Logika & Formula Deteksi: Bot vs Buzzer vs Manusia

Untuk memastikan model tidak menjadi *black box*, sistem membedakan ketiga kelas menggunakan indikator kuantitatif berikut:

### 5.1 Kriteria Taksonomi 3-Kelas

```text
+---------------------+-------------------------------+-----------------------------------+--------------------------------+
| Dimensi Pengujian   | BOT (Automatisasi Murni)      | BUZZER (Astroturfer / Cyber Army) | MANUSIA (Akun Organik)         |
+---------------------+-------------------------------+-----------------------------------+--------------------------------+
| Entropi Waktu       | Rendah (Jadwal presisi/tetap) | Sedang-Tinggi (Pola jam kerja)    | Alami (Acak, ada jeda istirahat|
| Jam Operasional     | 24 Jam nonstop tanpa henti    | Dominan Pukul 08.00–18.00 WIB     | Tersebar wajar, malam istirahat|
| Variasi Topik       | Sangat Rendah (1-2 isu saja)  | Rendah (Fokus agenda kampanye)    | Tinggi (Hobi, curhat, opini)   |
| Keragaman Bahasa    | Copypasta template kaku       | Variasi parafrase berulang        | Fleksibel, banyak bahasa gaul  |
| Target Interaksi    | Broadcast / Spam acak         | Menyerbu tokoh/isu spesifik       | Relasional dengan teman/mutual |
| Nilai Rasio Teman   | Following ekstrem / No Follower| Following tinggi, Follower sedang | Rasio seimbang & wajar         |
+---------------------+-------------------------------+-----------------------------------+--------------------------------+
```

### 5.2 Formulasi Ekstraksi Fitur (Feature Engineering Matrix)

1. **Temporal Entropy ($H_t$):**
   $$H_t = -\sum_{i=1}^{n} P(\Delta t_i) \log_2 P(\Delta t_i)$$
   *Keterangan:* Mengukur variasi selang waktu antar-cuitan ($\Delta t$). Nilai $H_t < 1.5$ mengindikasikan kuat otomasi bot.
2. **Target Concentration Ratio ($C_{target}$):**
   $$C_{target} = \frac{\text{Jumlah interaksi pada topik / figur sentral}}{\text{Total seluruh interaksi akun}}$$
   *Keterangan:* Jika $C_{target} > 0.75$, akun memiliki indikasi kuat sebagai partisan/buzzer agenda tunggal.
3. **Semantic Duplication Score ($S_{semantic}$ via ChromaDB):**
   Cosine similarity dihitung terhadap cuitan 100 akun lain dalam jendela waktu 30 menit. Jika $S_{semantic} > 0.85$ dengan kata berbeda, terdeteksi operasi parafrase terkoordinasi (*CIB*).

---

## 6. Spesifikasi Kontrak API Core (`FastAPI`)

Seluruh komunikasi backend menggunakan format JSON terstruktur:

### 6.1 Daftar Endpoint Utama

| Method | Endpoint | Peran & Deskripsi | Payload / Parameter |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/investigate/actor` | Memulai analisis mendalam terhadap username X | `{"username": "target_acc", "depth": 200}` |
| `POST` | `/api/v1/investigate/event` | Memulai audit komentar pada URL postingan/video | `{"url": "https://...", "platform": "youtube\|x\|ig"}` |
| `GET` | `/api/v1/investigate/{task_id}` | Mengambil status pemrosesan & hasil investigasi | Path param: `task_id` |
| `GET` | `/api/v1/network/graph/{case_id}`| Mengambil data simpul (*nodes & edges*) untuk Cytoscape | Query param: `min_confidence=0.7` |
| `GET` | `/api/v1/export/report/{case_id}` | Mengunduh berkas laporan resmi PDF/CSV | Query param: `format=pdf\|csv` |
| `GET` | `/api/v1/watchlist` | Mendapatkan daftar aktor dalam pantauan khusus | Query param: `tag=psyops` |

### 6.2 Contoh Payload Respons Intelijen (`GET /api/v1/investigate/{task_id}`)

```json
{
  "status": "completed",
  "data": {
    "target": "@infiltrator_01",
    "platform": "x",
    "classification": {
      "predicted_class": "BUZZER",
      "confidence": 0.912,
      "class_probabilities": {
        "bot": 0.048,
        "buzzer": 0.912,
        "human": 0.040
      }
    },
    "metrics": {
      "temporal_entropy": 2.14,
      "active_hours_peak": "09:00 - 17:00 WIB",
      "target_bias_score": 0.884,
      "cluster_similarity_score": 0.891
    },
    "threat_attribution": {
      "threat_level": "HIGH",
      "primary_agenda": "Delegitimasi Kebijakan Pertahanan Siber Nasional",
      "evidence_points": [
        "Aktivitas 88% terkonsentrasi hanya membalas tweet institusi tertentu dalam 7 hari terakhir.",
        "Terdeteksi 14 cuitan dengan struktur semantik identik (paraphrased copypasta) bersama 8 akun lain.",
        "Pola jam aktif berulang secara konsisten pada hari kerja (pukul 08.30 - 17.30 WIB)."
      ]
    },
    "top_targets": [
      { "username": "@TNI_AD", "interaction_count": 42 },
      { "username": "@Kemhan_RI", "interaction_count": 31 }
    ]
  }
}
```

---

## 7. Desain Antarmuka (Cyber Defense UI Theme)

### 7.1 Identitas Visual & Palet Warna Status
Mengadopsi tema **Military Cyber Threat Center (Dark Glassmorphism)**:

* **Background Utama:** `#0B0F19` (Deep Navy Black — fokus ruang kontrol)
* **Surface Panel / Card:** `#111827` dengan border tipis `#1F2937`
* **Brand Primary (Accent):** `#06B6D4` (Cyan Cyber Tech) & `#3B82F6` (Electric Blue)
* **Status Badges Semantik:**
  * **HUMAN / AUTHENTIC:** `#10B981` (Emerald-500 — Aman)
  * **SUSPICIOUS / BUZZER:** `#F59E0B` (Amber-500 — Waspada Opini)
  * **BOT / THREAT ACTOR:** `#EF4444` (Rose-500 — Bahaya Infiltrasi)

### 7.2 Struktur Layout Dashboard Utama
1. **Top Threat Bar:** Pencarian cepat target (`@username` atau URL) + Status Operasional Scraping Pool.
2. **Actor Summary Card:** Foto profil target, status klasifikasi tri-kelas dengan badge besar, dan tombol *Generate Official Dossier*.
3. **Dual Insight Grid:**
   * *Sisi Kiri:* Heatmap aktivitas 24/7 (menyorot pola jam kerja) & Grafik Radar Perilaku.
   * *Sisi Kanan:* Interactive Network Graph (memperlihatkan hubungan target dengan kluster buzzer lainnya).
4. **Forensic Evidence Stream:** Tabel log cuitan/balasan beserta anotasi AI yang menandai pesan mana saja yang terindikasi copypasta.

---

## 8. Definition of Done (DoD) & Matriks Pengujian MVP

Sebuah milestone purwarupa dinyatakan selesai dan layak diajukan ke dewan juri jika:

| No | Modul Uji | Target Verifikasi | Tolok Ukur Keberhasilan |
| :---: | :--- | :--- | :--- |
| 1 | **X Scraping Ingestion** | Engine `twikit` session | Mampu menarik 150+ tweet & replies dari username publik tanpa error rate-limit. |
| 2 | **Inference Latency** | Pipeline XGBoost + Chroma | Menghasilkan skor klasifikasi dan kesamaan vektor dalam waktu $< 3.5$ detik. |
| 3 | **LLM Synthesis via Groq** | Llama 3.3 70B | Menghasilkan narasi pembuktian bukti ancaman (*evidence points*) dalam waktu $< 2.0$ detik. |
| 4 | **Tri-Class Accuracy** | Labeled Benchmark Dataset | Mencapai akurasi deteksi $> 88\%$ pada set data uji bot, buzzer, dan akun organik. |
| 5 | **Network Visualization** | Cytoscape.js Renderer | Menampilkan minimal 20 simpul akun yang berinteraksi dengan layout visual lancar (60 FPS). |
| 6 | **Document Export** | Client PDF Generator (@react-pdf/renderer)| Menghasilkan berkas PDF rapi berisi ringkasan kasus, grafik, dan bukti forensik. |
| 7 | **Zero API Cost Run** | Seluruh komponen sistem | Beroperasi penuh pada lingkungan pengujian tanpa ada tagihan API berbayar. |

---

## 9. Rencana Eksekusi Menuju Deadline 15 November 2026

Mengacu pada jadwal resmi **Kartika Cyber Hackathon 2026**:

* **Minggu 1 (25 Okt – 31 Okt 2026) — Core Foundation & Ingestion:**
  * Inisialisasi monorepo: FastAPI backend + Vite React SPA UI + Docker Compose (PostgreSQL, ChromaDB, FastAPI, Nginx).
  * Implementasi wrapper `twikit` scraper pool untuk penarikan data X bebas blokir.
  * Setup ChromaDB lokal dan pipeline embedding `all-MiniLM-L6-v2`.
* **Minggu 2 (01 Nov – 07 Nov 2026) — Detection Engine & Analytics:**
  * Pembangunan formula ekstraksi fitur (Entropi waktu, konsentrasi target, copypasta cluster).
  * Pelatihan model XGBoost ringan untuk klasifikasi tri-kelas.
  * Integrasi Groq API (Llama 3.3) untuk *Explainable Threat Attribution*.
* **Minggu 3 (08 Nov – 12 Nov 2026) — Interactive UI & Network Graph:**
  * Integrasi Cytoscape.js untuk visualisasi hubungan aktor terkoordinasi.
  * Pembangunan komponen Heatmap 24/7 dan Evidence Dossier Card.
  * Implementasi fitur ekspor PDF/CSV.
* **Minggu 4 (13 Nov – 15 Nov 2026) — Final Polish & Submission:**
  * Pengambilan video demo purwarupa (screen recording interaktif + voiceover).
  * Penyusunan slide presentasi teknis dengan narasi militer PUSSIBERAD.
  * **Final Submission pada portal CODEPOLITAN (Sebelum 15 November 2026 pukul 23:59 WIB).**

---

*Dipersiapkan untuk:*  
**Kartika Cyber Hackathon 2026 — Pusat Siber Angkatan Darat (PUSSIBERAD) & CODEPOLITAN**  
*Mendukung Kedaulatan Ruang Siber Nasional Melalui Keunggulan Domain Kognitif.* 🛡️🇮🇩
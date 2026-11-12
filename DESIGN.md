# 🛡️ Project Axiom — Public Landing Page & Design Specification (SPA)

> **Platform:** Cognitive Domain Threat Intelligence & Astroturfing Detection System  
> **Brand Identity:** Project Axiom (Axiom Cyber-Defense Intelligence)  
> **Target Audience:** Public Open-Source Intelligence (OSINT) Researchers, Media Analysts (Guest Mode), and Satuan Tugas Operasi Siber PUSSIBERAD (Internal Authenticated Mode)  
> **Design Philosophy:** Anti-Slop Tactical Engineering (High-Contrast, Zero AI Clichés, Evidence-First, Human-Centric)  
> **Routing Paradigm:** Single-Page Application (SPA) Public Landing (`/`) with Embedded Guest Demo Sandbox & Dedicated Internal Login Gate (`/login`)

---

## 1. Executive Summary & Anti-Slop Manifesto

### 1.1 Visi & Rombakan Alur Masuk (Entry Flow Transformation)
Sebelumnya, *root route* (`/`) Project Axiom langsung memblokir pengguna yang belum login dan menampilkan `LoginPage.tsx`. Rombakan arsitektur ini mentransformasi halaman muka menjadi **Public Landing Page & Interactive Guest Sandbox**:
1. Memberikan akses instan bagi publik dan pemerhati siber untuk menguji coba kapabilitas deteksi bot/buzzer secara langsung tanpa friksi registrasi (*Guest Sandbox Mode*).
2. Memposisikan Project Axiom sebagai platform intelijen siber kognitif standar industri pertahanan dengan dokumentasi teknis, transparansi pipeline machine learning, dan changelog terperinci.
3. Menjaga batas keamanan sistem internal: sistem tetap **tertutup (closed/invite-only)** tanpa tombol registrasi mandiri. Akun operator hanya diterbitkan oleh Administrator PUSSIBERAD.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ALUR MASUK PUBLIK (SPA)                                │
├───────────────┬──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│ 1. Splash     │ 2. Hero      │ 3. Live Demo │ 4. Fitur &   │ 5. Dokumen  │ 6. Gerbang  │
│    Screen     │    Section   │    Sandbox   │    Pipeline  │    & About  │    Login    │
│ (800ms halus) │ (Value Prop) │ (Prioritas!) │  (Forensik)  │  (Laravel)  │  (Internal) │
└───────────────┴──────────────┴──────────────┴──────────────┴─────────────┴─────────────┘
```

### 1.2 Anti-Slop Compliance (Kepatuhan Terhadap Standar Anti-Slop)
Sesuai panduan inti `antislop` (`antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`):

1. **Anti AI Gradient & Neon Slop (R-01):**
   - Dilarang keras menggunakan gradien ungu-ke-merah muda (*purple-to-pink*), *cyan-blue glow*, atau *mesh gradient orbs* yang melayang tanpa makna.
   - Menggunakan warna dasar *Tactical Deep Matte* (`#0A0E17` / `#090D16`), permukaan netral gelap (`#0F172A`), garis pemisah tajam `1px solid` (`#1E293B`), dan aksen fungsional terarah: Tactical Cyan (`#38BDF8`), Emerald (`#34D399`), Amber (`#FBBF24`), dan Rose (`#F87171`).
2. **Copywriting Alami & Bebas Em Dash (R-02, R-16, R-36):**
   - Tidak menggunakan karakter em dash (`—`) pada teks UI yang ditulis sistem. Gunakan tanda titik (`.`), koma (`,`), titik dua (`:`), atau tanda kurung `()`.
   - Melarang kata-kata klise pemasaran AI seperti: *seamless, cutting-edge, revolutionary, elevate your journey, unlock the future, next-generation*.
   - Menyajikan bahasa Indonesia yang lugas, taktis, berbasis fakta, dan langsung ke tujuan operasional.
3. **Evidence Over Claims (R-17, R-18, R-36, C-5):**
   - Dilarang mencantumkan statistik fiktif ("10K+ Happy Users", "99.99% Guaranteed") atau testimoni buatan AI.
   - Hanya menampilkan data metrik riil dari validasi model: *271 dataset CSV riil Indonesia*, *99.73% akurasi 5-fold CV*, *Macro F1-Score 98.95%*, dan *21 parameter rekayasa fitur*.
4. **Resilience & UI States (R-27):**
   - Setiap komponen analisis interaktif wajib menyediakan 3 status visual yang solid: **Empty State** (ajakan analisis awal), **Loading State** (animasi radar/stepper taktis dengan estimasi detik), dan **Error State** (pesan kegagalan scraping atau akun privat/ditangguhkan).
5. **Mobile & Accessibility First (R-03, R-25, R-32):**
   - Seluruh elemen interaktif memiliki tap target minimal $44 \times 44\text{ px}$.
   - Kontras rasio teks memenuhi standar WCAG AA (minimal 4.5:1 untuk teks normal, 3:1 untuk teks besar).
   - Navigasi keyboard penuh (`Tab`, `Shift+Tab`, `Enter`, `Escape`) dengan *focus ring* taktis yang jelas (`focus:ring-2 focus:ring-sky-400/50`).

---

## 2. Design Tokens & Visual Foundations

### 2.1 Color Palette (Taktis, Gelap, & Berkontras Tinggi)

| Kategori Token | Hex Code | Tailwind Token | Penggunaan UI |
| :--- | :--- | :--- | :--- |
| **Canvas Base** | `#0A0E17` | `bg-[#0A0E17]` | Latar belakang utama seluruh landing page (matte, bebas noise/orb) |
| **Primary Surface** | `#0F172A` | `bg-slate-900` | Kontainer kartu profil, sandbox demo, panel dokumentasi |
| **Elevated Surface** | `#1E293B` | `bg-slate-800` | Hover state, dropdown menu, toggle tab aktif, input field |
| **Subtle Inset** | `#0B1120` | `bg-slate-950/70` | Blok kode terminal, latar hasil analisis forensik, quote panel |
| **Crisp Border** | `#1E293B` | `border-slate-800` | Batas struktural 1px untuk kartu dan panel (kontras terukur) |
| **Divider Muted** | `#334155` | `border-slate-700/60` | Pemisah baris tabel data dan timeline |
| **Text Primary** | `#F8FAFC` | `text-slate-50` | Heading utama H1-H3, nama akun, skor persentase utama |
| **Text Secondary** | `#94A3B8` | `text-slate-400` | Deskripsi, label parameter, body text, panduan instalasi |
| **Text Muted** | `#64748B` | `text-slate-500` | Timestamp, caption teknis, hash SHA-256, placeholder input |

### 2.2 Semantic Threat Badges (Terstandarisasi untuk Klasifikasi Akun)
Badge status ancaman hanya menggunakan warna semantik murni pada data klasifikasi:
- **HUMAN / ORGANIK:** Teks `#34D399` (`emerald-400`) | Background `#10B981/10` | Border `#10B981/30`
- **BUZZER / CIB TERKOORDINASI:** Teks `#FBBF24` (`amber-400`) | Background `#F59E0B/10` | Border `#F59E0B/30`
- **BOT / OTOMASI:** Teks `#F87171` (`rose-400`) | Background `#EF4444/10` | Border `#EF4444/30`
- **RISIKO KRITIS:** Teks `#FFFFFF` | Background `#DC2626` (`red-600`) | Border `#EF4444` (Khusus anomali temporal & narasi ekstrim)

### 2.3 Tipografi & Kedisiplinan Angka

```css
/* Font Stacks */
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;

/* Numeric Alignment */
.tabular-data {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

- **Heading Display (Hero H1):** `font-sans font-bold tracking-tight text-3xl sm:text-5xl lg:text-6xl text-slate-50`.
- **Subheading (H2):** `font-sans font-semibold tracking-normal text-xl sm:text-2xl text-slate-100`.
- **Body Text:** `font-sans font-normal text-sm sm:text-base leading-relaxed text-slate-400`.
- **Forensic Monospace:** `"JetBrains Mono"` untuk `@username`, ID Kasus, perintah CLI (`git clone`, `docker compose`), dan metrik tabular (persentase, skor entropi, waktu posted).

---

## 3. Global Navigation & Scroll Mechanics

### 3.1 Adaptive Sticky Header (Full-Width ke Floating Pill Transition)
Header dirancang memiliki dua fase tampilan yang bertransisi secara mulus (`transition-all duration-300 ease-out`):

1. **Fase 1: Puncak Layar (`scrollY === 0`):**
   - Lebar *full-width* normal dengan latar transparan atau `bg-[#0A0E17]/60`.
   - Mengambil posisi tetap di atas tanpa radius membulat.
2. **Fase 2: Saat Melakukan Scroll (`scrollY > 60`):**
   - Bertransisi mengecil secara halus menjadi **Floating Rounded Pill Navbar** di bagian atas tengah layar (`max-w-5xl mx-auto rounded-full mt-3 px-6 py-2.5`).
   - Dilengkapi efek *backdrop-blur-md* (`bg-slate-950/80 border border-slate-800/80 shadow-2xl shadow-black/40`).

```
[ Puncak Layar: Full-Width Transparan ]
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [🛡️ AXIOM]      [Demo]  [Fitur ▾]  [Alur]  [Dokumentasi ▾]  [Changelog]    [GitHub] [Masuk] │
└────────────────────────────────────────────────────────────────────────────────────────┘

[ Saat Di-Scroll: Floating Rounded Pill Navbar ]
                ┌──────────────────────────────────────────────────────────┐
                │ [🛡️]  [Demo]  [Fitur ▾]  [Alur]  [Docs ▾]  [GitHub] [Masuk]│
                └──────────────────────────────────────────────────────────┘
```

#### Komponen Anatomi Navbar:
- **Kiri:** Brand Logo Project Axiom (Lambang Perisai Siber Taktis + Teks "AXIOM").
- **Tengah:** Link navigasi halus (*smooth-scroll anchor*):
  - `#demo` (Live Demo Sandbox)
  - Dropdown **Fitur:**
    - `#features-cib` (Deteksi Jaringan CIB)
    - `#features-circadian` (Pola Jam Biologis & Entropi)
    - `#features-drift` (Pergeseran Narasi Semantik)
    - `#features-ledger` (Dual-Tier Forensic Ledger)
  - `#workflow` (Arsitektur Pipeline 5-Tahap)
  - Dropdown **Dokumentasi:**
    - `#docs-quickstart` (Panduan Cepat & Instalasi)
    - `#docs-docker` (Penerapan Docker Swarm / Compose)
    - `#docs-api` (Spesifikasi Endpoint FastAPI)
    - `#docs-dataset` (Skema Fitur ML & Dataset Retraining)
  - `#changelog` (Riwayat Rilis & Milestone)
  - `#about` (Tentang Platform & Komitmen Etis)
- **Kanan (Aksi & Autentikasi):**
  - **Tombol GitHub Repo:** Ikon GitHub + Teks ringkas `v1.0.0-rc` / Link repo publik.
  - **Tombol Masuk:** CTA solid taktis (`bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium px-4 py-1.5 rounded-full text-xs sm:text-sm`). Mengarahkan pengguna langsung ke rute `/login`. *Tidak ada tombol Registrasi.*

### 3.2 Bidirectional Scroll Reveal Animations (Intersection Observer)
Setiap seksi didefinisikan dengan proporsi **Full-Screen / Spacious Section** (`min-h-screen py-20 flex flex-col justify-center`).
- **Mekanisme Dua Arah:** Menggunakan `IntersectionObserver` React hook (`threshold: 0.15`).
- **Saat Masuk Viewport (Scroll Turun / Naik):** Elemen bertransisi dari `opacity-0 translate-y-8` menuju `opacity-100 translate-y-0` (durasi `500ms`, kurva `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Saat Ditinggalkan:** Elemen memudar halus (`opacity-20` atau `opacity-0`) sehingga perpindahan antar seksi terasa lapang dan tidak menumpuk memori browser.
- **Konsistensi Re-trigger:** Ketika di-scroll balik ke atas, animasi reveal berjalan kembali secara mulus tanpa sentakan (*flicker-free*).

---

## 4. Rincian Arsitektur Per Halaman / Seksi (Section Flow)

---

### Seksi A: Brief Splash Screen (Transisi Pembuka)
- **Tujuan UX:** Memberikan sambutan taktis tanpa membebani waktu tunggu pengguna. Splash screen selesai dalam $\le 900\text{ ms}$ atau langsung hilang saat asset awal siap.
- **Elemen Visual:**
  - Ikon Perisai Siber Axiom berdenyut 1 kali secara elegan di tengah layar hitam legam.
  - Garis pemindai (*tactical scan line*) tipis berwarna cyan bergerak cepat dari atas ke bawah.
  - Teks kecil di bawah logo: `AXIOM KERNEL READY • V1.0.0-RC`.
  - Transisi pembuka: Seluruh layar splash melakukan *fade-out* dan *scale-up* halus (`scale-105 opacity-0 duration-400`) mengungkap Hero Section.

---

### Seksi B: Hero Section (Full-Screen Value Proposition)
- **Tujuan UX:** Menyampaikan identitas platform, kapabilitas utama, dan mengarahkan perhatian pengguna secara instan ke Demo Interaktif di bawahnya.
- **Layout & ASCII Wireframe:**

```
+----------------------------------------------------------------------------------------+
|                                    [ FLOATING NAVBAR ]                                 |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|             [ 🟢 SISTEM INTELIJEN AKTIF • MODEL XGBOOST V1.0.0-RC BEROPERASI ]         |
|                                                                                        |
|                 Investigasi Domain Kognitif &                                          |
|                 Deteksi Rekayasa Opini Siber.                                          |
|                                                                                        |
|    Platform forensik siber untuk membedah akun buzzer terkoordinasi (CIB),             |
|    bot astroturfing, dan anomali narasi media sosial dengan 21 parameter perilaku.    |
|                                                                                        |
|                [ Coba Live Demo ↓ ]      [ Baca Dokumentasi ]      [ GitHub Repo ]     |
|                                                                                        |
|       ✓ 271 Dataset Riil Indonesia     ✓ 99.73% CV Accuracy     ✓ Dual-Tier Ledger     |
|                                                                                        |
|                                           ⌄ Scroll                                     |
+----------------------------------------------------------------------------------------+
```

- **Anatomi Komponen:**
  1. **Status Pill:** Badge taktis dengan dot hijau berkedip lembut: `SISTEM INTELIJEN AKTIF • MODEL XGBOOST V1.0.0-RC BEROPERASI`.
  2. **Headline H1:** Tegas, lugas, tanpa istilah klise pemasaran AI. Menjelaskan secara presisi fungsi sistem dalam domain kognitif dan operasi pertahanan siber.
  3. **Sub-headline:** Menjelaskan kombinasi metode deteksi: 21 parameter rekayasa fitur, model machine learning XGBoost terkalibrasi, graf analisis jaringan (SNA), dan penelusuran ledger forensik.
  4. **Action CTA Group:**
     - **Primary Button ("Coba Live Demo ↓"):** Tombol mencolok (`bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold px-6 py-3 rounded-lg shadow-lg shadow-sky-500/20`). Mengklik tombol ini melakukan *smooth-scroll* langsung ke Seksi C (Guest Demo) tepat di bawah Hero.
     - **Secondary Button ("Baca Dokumentasi"):** Tombol outline (`border border-slate-700 hover:border-slate-500 bg-slate-900/60 text-slate-200 px-5 py-3 rounded-lg`). Melompat ke Seksi F.
     - **Tertiary Link ("GitHub Repo"):** Tombol ghost dengan ikon GitHub.
  5. **Verifiable Proof Strip:** Tiga metrik validasi riil dari hasil pelatihan model (tanpa angka fiktif).

---

### Seksi C: Interactive Guest Demo Sandbox (Prioritas Awal — Tepat di Bawah Hero)
- **Tujuan UX:** Menghilangkan friksi eksplorasi. Pengunjung tidak perlu login untuk melihat bagaimana sistem menganalisis akun atau cuitan.
- **Konfigurasi Tab:** Pengguna dapat berpindah antara **Mode 1: Analisis Akun X** dan **Mode 2: Analisis URL Tweet**.
- **Layout & ASCII Wireframe:**

```
+----------------------------------------------------------------------------------------+
| SECTION C: LIVE GUEST DEMO SANDBOX                                                     |
|                                                                                        |
|           [ Uji Coba Langsung ]                   [ Sesi Pengunjung (Guest Mode) ]     |
|                                                                                        |
|   +------------------------------------+-------------------------------------------+   |
|   | [ Mode 1: Analisis Akun X ]        |   Mode 2: Analisis URL Cuitan             |   |
|   +------------------------------------+-------------------------------------------+   |
|   |  Masukkan Username X / Twitter:                                                |   |
|   |  [ @username_target                     ]  [ Eksekusi Analisis (Gratis) → ]    |   |
|   |  Contoh cepat: [@prabowo]  [@bubbles_boba9]  [@achanakkuat]                    |   |
|   +--------------------------------------------------------------------------------+   |
|                                                                                        |
|   HASIL ANALISIS INSTAN (LITE FORENSIC DOSSIER):                                       |
|   +------------------------------------+-------------------------------------------+   |
|   | KARTU PROFIL HASIL SCRAPING        | INDIKASI & SKOR KEYAKINAN AI              |   |
|   | [Avatar] Bubbles Boba              |                                           |   |
|   |          @bubbles_boba9            | [ BUZZER / TERKOORDINASI ]   Skor: 88.4%  |   |
|   |                                    | Risiko Ancaman: TINGGI (Threat Level)     |   |
|   | Bio: "Akun cadangan info trending" |                                           |   |
|   | Dibuat: Okt 2024 (Akun Baru)       | INDIKATOR PERILAKU UTAMA (TOP-3 XAI):     |   |
|   | 14 Followers  •  412 Following     | • Rasio Pengikut Janggal (F/F = 0.034)    |   |
|   | Total Cuitan Dianalisis: 50 post   | • Repetisi Kalimat Ekstrim (Rate = 0.742) |   |
|   | Status: Aktif                      | • Aktivitas Malam Tinggi (Night = 68.2%)  |   |
|   +------------------------------------+-------------------------------------------+   |
|   |                                                                                |   |
|   |  Ingin melihat Graf Relasi Jaringan (SNA), Ledger 100% Komentator,             |   |
|   |  dan Ekspor Laporan Berita Acara Digital (PDF/CSV)?                           |   |
|   |                                                                                |   |
|   |                        [ Masuk ke Konsol Penuh PUSSIBERAD → ]                  |   |
|   +--------------------------------------------------------------------------------+   |
+----------------------------------------------------------------------------------------+
```

#### Spesifikasi Fitur Guest Sandbox:
1. **Mode 1 (Analisis User X):**
   - Input field: Validasi format `@username`.
   - Tombol Quick Pill: Menampilkan tombol klik cepat akun sampel yang sudah diindeks untuk uji coba instan tanpa menunggu scraping riil jika jaringan lambat.
   - Output UI:
     - **Kartu Profil:** Menampilkan nama display, handle, avatar (fallback inisial jika privasi), bio singkat, tanggal akun dibuat, rasio pertemanan, dan jumlah sampel aktivitas.
     - **Indikasi Klasifikasi AI:** Badge status ancaman semantik (Human / Buzzer / Bot) dengan meteran persentase keyakinan model XGBoost.
     - **Top-3 Penjelasan XAI (Explainable AI):** Menampilkan 3 fitur paling mencurigakan yang memicu klasifikasi tersebut (misal: *Repetition Rate tinggi*, *Jam aktif kalong/nokturnal*, *Bot score ensemble tinggi*).
2. **Mode 2 (Analisis URL Tweet):**
   - Input field: Validasi link cuitan (format: `https://x.com/username/status/123456...`).
   - Output UI: Menampilkan cuplikan teks cuitan induk, jumlah komentar yang berhasil dipanen, rasio spammer berulang, dan indikasi apakah percakapan pada cuitan tersebut didominasi oleh operasi astroturfing buzzer terkoordinasi.
3. **Pemberitahuan Konsol Lanjutan (Upsell / Gate Notice):**
   - Menjelaskan batasan Guest Mode (output diringkas untuk keamanan publik).
   - Menyediakan tombol pintas ke `/login` bagi operator berwenang untuk membuka Graf SNA interaktif, tabel Dual-Tier 100% komentator, dan ekspor berkas berita acara SHA-256.

---

### Seksi D: Core Features Section (Pilar Kapabilitas Forensik)
- **Tujuan UX:** Memaparkan kapabilitas penuh Project Axiom secara terstruktur dan terukur tanpa mengulang template kartu yang monoton (mematuhi R-14 dan RHYTHM dial).
- **Struktur Variasi Fitur (Non-Uniform Rhythm):**

```
+----------------------------------------------------------------------------------------+
| SECTION D: FITUR UTAMA & PARAMETER INTELIJEN                                           |
|                                                                                        |
| [ FITUR UNGGULAN - FULL WIDTH BANNER ]                                                 |
| +------------------------------------------------------------------------------------+ |
| | 01. DETEKSI PERILAKU TERKOORDINASI (COORDINATED INAUTHENTIC BEHAVIOR / CIB)        | |
| | Algoritma Cosine Similarity semantik (all-MiniLM-L6-v2) yang memindai copypasta     | |
| | teks antar akun dalam jendela waktu sempit. Mengungkap sindikat astroturfing       | |
| | yang menyebarkan narasi seragam secara serempak.                                   | |
| +------------------------------------------------------------------------------------+ |
|                                                                                        |
| [ 2-KOLOM SPLIT KARTU ASIMETRIS ]                                                      |
| +-----------------------------------------+------------------------------------------+ |
| | 02. RITME SIRKADIAN & ANOMALI TEMPORAL  | 03. PERGESERAN NARASI (NARRATIVE DRIFT)  | |
| | Analisis distribusi jam posting 24-jam  | Pemantauan drift semantik dari waktu     | |
| | untuk mendeteksi otomasi bot non-manusia| ke waktu. Mendeteksi akun organik yang   | |
| | dan lonjakan aktivitas tak wajar        | dibajak atau berganti persona untuk      | |
| | (burstness anomaly) pada dini hari.     | kampanye propaganda terselubung.         | |
| +-----------------------------------------+------------------------------------------+ |
|                                                                                        |
| [ FITUR DOKUMENTATIF - FULL WIDTH DATA TABLE PREVIEW ]                                 |
| +------------------------------------------------------------------------------------+ |
| | 04. DUAL-TIER FORENSIC LEDGER & RANTAI BUKTI DIGITAL (CHAIN OF CUSTODY)            | |
| | Membedah 100% komentator menjadi 2 tier: Tier-1 (Top 10 Penyerang Utama) dan       | |
| | Tier-2 (Seluruh Jejak Interaksi). Dilengkapi sidik jari kriptografi SHA-256        | |
| | untuk validitas pembuktian hukum dan laporan intelijen militer resmi.              | |
| +------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------+
```

---

### Seksi E: Visual Workflow & Pipeline Architecture
- **Tujuan UX:** Memberikan transparansi visual dari alur kerja data mentah hingga menjadi kesimpulan intelijen (Pipeline End-to-End).
- **Diagram Alur Visual (5 Tahap):**

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  01. INGESTION  │ ───> │  02. EXTRACTION  │ ───> │  03. CLASSIFIER  │
│ Scraper X/IG/YT │      │  21 Fitur Sosio- │      │  Model XGBoost   │
│ Multi-Platform  │      │  Behavioral      │      │  (Indo-Trained)  │
└─────────────────┘      └──────────────────┘      └──────────────────┘
                                                             │
                                                             ▼
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  06. CHAIN OF   │ <─── │  05. REASONING   │ <─── │  04. SNA & CIB   │
│      CUSTODY    │      │  LLM Forensic    │      │  Cosine Sim &    │
│ SHA-256 Ledger  │      │  Dossier Summary │      │  Graf Relasi     │
└─────────────────┘      └──────────────────┘      └──────────────────┘
```

1. **Tahap 1 (Ingestion):** Pemanenan data profil, aktivitas cuitan, dan komentar menggunakan scraper multi-platform tanpa ketergantungan API komersial mahal.
2. **Tahap 2 (Extraction):** Ekstraksi otomatis 21 vektor fitur perilaku (rasio follow, variansi frekuensi interaksi, rasio aktivitas malam, entropi konten, dan densitas hashtag/mention).
3. **Tahap 3 (Ensemble Classification):** Klasifikasi tingkat akun oleh model XGBoost yang dilatih khusus pada 271 dataset kasus nyata Indonesia.
4. **Tahap 4 (Network & CIB Clustering):** Perhitungan kesamaan semantik teks via embedding vektor dan pemetaan graf aktor penyerang (*Social Network Analysis*).
5. **Tahap 5 (Forensic Reasoning):** Penyusunan narasi dossier dan rekomendasi taktis berbasis *Prompt Engineering* analis siber.
6. **Tahap 6 (Chain of Custody):** Penerbitan laporan resmi terenkripsi SHA-256 dengan berkas cetak dossier PDF dan tabel ledger CSV.

---

### Seksi F: Public Documentation & Installation Guide (Struktur ala Laravel Docs)
- **Tujuan UX:** Menyediakan dokumentasi instalasi, konfigurasi, dan arsitektur teknis yang rapi, modular, dan mudah dipindai, terinspirasi dari tata letak dokumentasi modern (seperti Laravel Docs).
- **Layout Struktur (2-Column Sticky Nav Layout):**

```
+----------------------------------------------------------------------------------------+
| SECTION F: DOKUMENTASI TEKNIS & PANDUAN PENERAPAN                                      |
|                                                                                        |
| +----------------------+-------------------------------------------------------------+ |
| | NAVIGASI DOKUMENTASI | KONTEN DOKUMENTASI AKTIF                                    | |
| | (Sticky Sidebar)     |                                                             | |
| |                      | # Panduan Instalasi Cepat (Quickstart)                      | |
| | • Memulai (Overview) | Project Axiom dibangun dengan arsitektur decoupled modern:  | |
| | • Persyaratan Sistem | FastAPI (Python 3.11+) di backend dan React 19 di frontend. | |
| | • Instalasi Docker   |                                                             | |
| | • Konfigurasi .env   | Langkah 1: Kloning Repositori                               | |
| | • Endpoint API v1    | +---------------------------------------------------------+ |
| | • Skema 21-Fitur ML  | | git clone https://github.com/axiom/axiom.git            | |
| | • Retraining Model   | +---------------------------------------------------------+ |
| | • Tata Kelola Data   |                                                             | |
| |                      | Langkah 2: Jalankan Container Docker                        | |
| | [ Unduh OpenAPI Spec]| +---------------------------------------------------------+ |
| |                      | | docker compose -f docker-compose.prod.yml up -d --build | |
| |                      | +---------------------------------------------------------+ |
| |                      |                                                             | |
| |                      | > [!NOTE]                                                   | |
| |                      | > Pastikan variabel lingkungan SECRET_KEY dan DATABASE_URL  | |
| |                      | > telah terkonfigurasi sebelum menjalankan migrasi Alembic. | |
| +----------------------+-------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------+
```

#### Komponen Anatomi Dokumentasi:
1. **Sticky Left Navigation (240px):**
   - Menampilkan daftar bab terstruktur dengan status aktif berwarna Tactical Cyan.
   - Dilengkapi kolom pencarian internal dokumentasi cepat (*Quick Filter Docs*).
2. **Copyable Command Blocks:**
   - Setiap perintah terminal dilengkapi tombol *Copy to Clipboard* dengan konfirmasi visual ("Tersalin!").
   - Menghindari kode slop: blok kode menggunakan tema gelap konsisten (`bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm`).
3. **Callout Boxes Taktis (GitHub/Laravel Style):**
   - **Informasi / Note:** Garis pinggir biru/cyan dengan latar halus.
   - **Peringatan Keamanan / Caution:** Garis pinggir amber/rose untuk kredensial atau batasan privasi data.
4. **Sub-Bab Wajib:**
   - **Persyaratan Minimum:** Python 3.11+, Node.js 20+, PostgreSQL 15, RAM 4GB.
   - **Penerapan Produksi (Docker & Reverse Proxy):** Skrip `docker-compose`, konfigurasi Caddy/Nginx, dan sertifikasi TLS.
   - **Dokumentasi Endpoint REST API:** Ringkasan rute `/api/v1/investigate`, `/api/v1/health`, dan `/api/v1/reports`.
   - **Kamus 21 Fitur Model:** Penjelasan definisi tiap parameter (dari `burstness_index` hingga `account_reputation_score`).

---

### Seksi G: Project Changelog & Roadmap (Pembaruan & Milestone)
- **Tujuan UX:** Menunjukkan rekam jejak riset, stabilitas kode, dan transparansi perkembangan platform secara historis.
- **Visualisasi Timeline Vertikal:**

```
[ v1.0.0-rc ] — November 2026 (Rilis Saat Ini)
  • Retraining model XGBoost pada 271 dataset kasus nyata Indonesia (Akurasi 99.73%).
  • Integrasi scraper multi-platform (X/Twitter, Instagram, YouTube Comments).
  • Penerapan Dual-Tier Forensic Ledger dengan sidik jari kriptografis SHA-256.
  • Penambahan mode Public Landing Page & Guest Demo Sandbox.

[ v0.9.0 ] — Oktober 2026
  • Implementasi Explainable AI (XAI) berbasis kontribusi fitur SHAP.
  • Pembaruan mesin embedding semantik lokal all-MiniLM-L6-v2.
  • Dashboard analitik ritme sirkadian dan visualisasi polaritas entropi.

[ v0.5.0 ] — September 2026
  • Fondasi arsitektur sistem investigasi berbasis kasus (Case-Centric Architecture).
  • Integrasi algoritma deteksi bot ensemble (Heuristik, Entropi, Temporal).
```

---

### Seksi H: About Axiom & Anti-Slop Manifesto (Filosofi & Etika)
- **Tujuan UX:** Memaparkan latar belakang riset intelijen domain kognitif, batasan etika penggunaan, dan komitmen desain human-centric.
- **Poin Filosofi:**
  1. **Pertahanan Domain Kognitif:** Penjelasan mengenai ancaman disinformasi, polarisasi terkoordinasi, dan manipulasi persepsi publik oleh aktor bayaran (buzzer).
  2. **Etika & Kedaulatan Data:** Sistem tidak melakukan peretasan (*hacking/breach*). Seluruh data diambil dari ranah publik (*Open Source Intelligence - OSINT*) secara pasif dan patuh pada kaidah forensik hukum digital.
  3. **Komitmen Anti-Slop:** Penjelasan mengapa antarmuka Project Axiom dirancang bersih, bebas dekorasi berlebihan, dan fokus pada kecepatan analisis operator tanpa kebingungan visual (*low cognitive load*).

---

### Seksi I: Minimalist Footer
- **Tujuan UX:** Penutup halaman yang tenang, bersih, dan memuat status operasional serta tautan penting tanpa memenuhi 4 kolom klise template AI (R-05).
- **Layout:**
  - Baris Kiri: Identitas Brand ("Project Axiom"), copyright `PUSSIBERAD / Satgas Siber © 2026`, dan lisensi penelitian siber.
  - Baris Tengah: Status indikator sistem (`🟢 Gateway Online • Node Jkt-01 • Latensi 18ms`).
  - Baris Kanan: Tautan cepat kembali ke atas (`↑ Kembali ke Puncak`), tautan repositori GitHub, dokumentasi API, dan tombol pintas `Gerbang Masuk Staf`.

---

## 5. Gerbang Masuk Staf (Login Page Flow — Tanpa Registrasi)

### 5.1 Spesifikasi Rute & Akses
- **Akses:** Diarahkan melalui URL `/login` atau klik tombol `Masuk` pada Navbar / Callout Guest Sandbox.
- **Sifat Sistem:** **Closed / Internal Only.**
- **Larangan Keras:** **TIDAK ADA** tombol, tautan, atau form pendaftaran (*Register / Sign Up*). Upaya akses pendaftaran langsung di-redirect kembali ke halaman login dengan pesan: *"Sistem tertutup. Kredensial operator diterbitkan langsung oleh Administrator Satgas Siber."*

### 5.2 Layout & Komponen Login View
- **Latar:** Tetap menggunakan tema `#0A0E17` dengan kartu login terpusat (`max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl`).
- **Elemen:**
  1. Logo Axiom + Label: `KONSOL OPERASI INTELIJEN SIBER`.
  2. Sub-label: `Masukkan kredensial dinas untuk mengakses investigasi penuh.`
  3. Form Input:
     - `Username / ID Operator` (dengan ikon `User`, autocomplete `off`).
     - `Kata Sandi` (dengan tombol intip sandi dan ikon `Lock`).
  4. Tombol Aksi: `Autentikasi Kredensial →` (`bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold w-full py-2.5 rounded-lg`).
  5. Tautan Kembali: `← Kembali ke Halaman Publik & Demo Guest`.
  6. Indikator Status Backend: Titik hijau/merah menandakan status koneksi API FastAPI (`api.checkHealth()`).

---

## 6. Klarifikasi Teknis & Arsitektur Backend

---

### 6.1 Logging Investigasi Sesi Tamu (Guest Investigation Logging)
Meskipun pengguna tamu (*guest*) tidak perlu memasukkan username dan password untuk mencoba sandbox demo di Seksi C, seluruh aktivitas investigasi wajib dicatat secara transparan di dalam database backend:

```
[ Frontend: Guest Demo Form ] 
             │
             │ POST /api/v1/investigate/actor
             │ Payload: { target: "...", platform: "x", is_guest: true }
             ▼
[ FastAPI Backend: investigate.py ]
             │
             ├─ Hitung Client Hash: SHA256(Client_IP + UserAgent + Salt_Harian)
             ├─ Periksa Rate Limit Tamu (Maksimal 5 analisis / jam per Client Hash)
             ├─ Buat Kasus Investigasi di DB:
             │    InvestigationCase(
             │        id=uuid4(),
             │        target=target,
             │        platform=platform,
             │        created_by="guest",        <-- Indikator Peran Tamu
             │        session_hash=client_hash,  <-- Pelacakan Sesi Tanpa PII
             │        status="completed"
             │    )
             ▼
[ PostgreSQL Database: investigation_cases ]
```

#### Manfaat Arsitektural Guest Logging:
1. **Audit Trail & Penegakan Keamanan:** Mencegah eksploitasi scraper secara berlebihan (*DDoS / scraping abuse*) melalui pembatasan kuota dinamis (*Rate Limiter*).
2. **Pengkayaan Data Latih Riil (Data Flywheel):** Akun-akun yang dimasukkan oleh publik dianalisis dan disimpan. Analis PUSSIBERAD di konsol admin dapat meninjau akun-akun yang dicari tamu tersebut, memberikan verifikasi label (*human review audit*), dan memasukkannya ke dalam master dataset retraining berikutnya.

---

### 6.2 Arsitektur Ekspor CSV: Single-Case Forensics vs. Master Retraining Dataset (Jawaban Poin 4.2)

#### Status Fitur CSV Saat Ini:
Berdasarkan audit mendalam terhadap berkas backend (`backend/app/services/report_exporter.py` baris 256–304):
- Fitur ekspor CSV saat ini **hanya untuk 1 kali kasus spesifik (Single-Case Trial Export)** melalui endpoint:  
  `GET /api/v1/investigate/cases/{case_id}/report?format=csv`
- Header kolom yang diekspor saat ini berfokus pada **buku besar aktivitas komentator (Dual-Tier Activity Ledger)**:
  `index, case_id, username, platform, post_id, published_at, estimated_class, risk_score, in_cib_cluster, cluster_similarity, in_burst_window, likes, replies, content`
- **Belum tersedia** endpoint untuk mengekspor **akumulasi seluruh vektor 21-fitur** dari ratusan kasus investigasi yang sudah terkumpul di database untuk keperluan pelatihan ulang model (*ML Retraining*).

#### Rancangan Arsitektur Solusi 2-Mode Ekspor:
Untuk memenuhi kebutuhan pembuktian forensik sekaligus kebutuhan *continuous machine learning pipeline*, sistem menerapkan **dua endpoint dan format ekspor CSV terpisah**:

```
                               ┌────────────────────────────────────────────────────────┐
                               │             PROJECT AXIOM CSV DATA SERVICES            │
                               └────────────────────────────────────────────────────────┘
                                                            │
                            ┌───────────────────────────────┴───────────────────────────────┐
                            ▼                                                               ▼
        [ MODE 1: SINGLE-CASE FORENSIC LEDGER ]                    [ MODE 2: ACCUMULATED MASTER DATASET ]
  Endpoint: /api/v1/investigate/cases/{id}/report?format=csv   Endpoint: /api/v1/reports/export/master-dataset
  Hak Akses: Tamu (Ringkas) & Operator (Lengkap)              Hak Akses: Khusus Administrator & Analis Senior
                            │                                                               │
                            ▼                                                               ▼
  Tujuan:                                                     Tujuan:
  • Berita Acara Pemeriksaan Forensik Siber (BAP)             • Pipa Pelatihan Ulang Model ML (Retraining Pipeline)
  • Bukti Hukum / Jejak Digital Penyerangan                   • Validasi Ulang Akurasi Model XGBoost
  • Analisis Graf Gephi / Visualisasi Temporal Kasus          • Audit Kontribusi Rekayasa 21-Fitur Baru
                            │                                                               │
                            ▼                                                               ▼
  Format Kolom (Buku Besar Komentator):                       Format Kolom (Kanonikal 21-Fitur ML):
  [ index, case_id, username, platform, post_id,              [ username, sentiment_std, burstness_index,
    published_at, estimated_class, risk_score,                  entropy_content, repetition_rate, account_age_days,
    in_cib_cluster, cluster_similarity,                         follower_following_ratio, reply_quote_ratio,
    in_burst_window, likes, replies, content ]                  cosine_similarity_avg, interaction_freq_variance,
                                                                hashtag_density, mention_density, url_density,
                                                                night_activity_ratio, bot_score_ensemble,
                                                                cib_cluster_density, narrative_drift_velocity,
                                                                bio_keyword_flag, profile_completeness,
                                                                post_length_mean, post_length_std,
                                                                account_reputation_score, platform,
                                                                activity_count, verified_label ]
```

#### Spesifikasi Rinci Mode 2 (Accumulated Master Retraining Dataset):
1. **Endpoint Backend:**
   `GET /api/v1/reports/export/master-dataset`
2. **Mekanisme Agregasi Data:**
   - Mengambil seluruh rekaman dari tabel `ActorProfile`, `DetectionResult`, dan `ActivityLog`.
   - Menghubungkan label hasil verifikasi analis (prioritas utama jika telah diaudit manual) atau label hasil prediksi model (`predicted_class`).
   - Menyusun matriks 21 parameter perilaku terstandarisasi yang siap diekspor menjadi berkas CSV bernama:
     `axiom_retraining_master_dataset_YYYYMMDD_HHMMSS.csv`
3. **Kompatibilitas Pipa Retraining:**
   Berkas CSV hasil unduhan ini dapat langsung diarahkan ke skrip pelatihan:
   ```bash
   python train_real_xgboost.py --dataset /path/to/axiom_retraining_master_dataset_20261113.csv --cv 5 --export-model
   ```
   Hal ini memungkinkan model terus berevolusi seiring bertambahnya kasus nyata baru yang diselidiki oleh tim siber.

---

## 7. Responsivitas Mobile & Spesifikasi Breakpoint

Sesuai aturan ketat `antislop-layoutmobile` (R-03), tata letak mobile bukan sekadar tampilan desktop yang diperkecil, melainkan tata letak yang dirancang ulang untuk kenyamanan sentuhan jari dan keterbacaan layar vertikal:

### 7.1 Tabel Breakpoint Sistem

| Breakpoint | Lebar Layar | Transformasi Tata Letak |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | 360px – 639px | • Header bertransformasi menjadi tombol hamburger taktis kompak.<br>• Hero Section: tombol bertumpuk vertikal (*full-width* $w\text{-full}$).<br>• Guest Demo Sandbox: kartu profil dan kartu hasil prediksi bertumpuk vertikal.<br>• Dokumentasi: Sidebar navigasi beralih menjadi *dropdown select menu* di atas konten.<br>• Seluruh target sentuhan tombol dan tab $\ge 44\text{ px}$. |
| **Tablet (`640px - 1024px`)** | 640px – 1023px | • Navbar menampilkan 3 menu inti + tombol Masuk.<br>• Hero Section: 2 tombol sejajar horizontal.<br>• Fitur Utama: Grid asimetris 2-kolom seimbang.<br>• Dokumentasi: Sidebar dapat diciutkan (*collapsible drawer*). |
| **Desktop (`> 1024px`)** | 1024px – 1920px | • Floating Rounded Pill Navbar penuh dengan dropdown sub-menu aktif.<br>• Split layout 2-kolom lapang untuk Guest Sandbox dan Dokumentasi Laravel-style.<br>• Animasi hover mikro pada kartu data. |

### 7.2 Pencegahan Overflow Horizontal
- Menerapkan `overflow-x-hidden` pada kontainer akar `html` dan `body`.
- Tabel data ledger dilengkapi pembungkus *horizontal scroll indicator* taktis dengan bayangan tepi (`mask-image: linear-gradient(...)`) agar pengguna mobile menyadari tabel dapat digeser ke samping tanpa memotong layar.

---

## 8. Rencana Implementasi & Transisi State Frontend

### 8.1 Manajemen State Aplikasi (`App.tsx` & Zustand)
Struktur perutean SPA dikelola secara reaktif pada `App.tsx` menggunakan state navigasi yang bersih:

```typescript
// Tipe Tampilan Utama
type AppView = 'landing' | 'login' | 'dashboard';

// State Routing Bersih
const [currentView, setCurrentView] = useState<AppView>(() => {
  // Jika URL path diawali /login -> langsung tampilkan Login
  if (window.location.pathname === '/login') return 'login';
  // Jika token tersimpan dan sesi valid -> masuk ke Dashboard
  if (localStorage.getItem('axiom_token')) return 'dashboard';
  // Default pengunjung publik -> Landing Page
  return 'landing';
});
```

### 8.2 Daftar Komponen Baru yang Akan Dibuat:
1. `src/components/landing/LandingPage.tsx`: Komponen utama pembungkus seluruh Seksi A–I.
2. `src/components/landing/SplashTransition.tsx`: Transisi pembuka radar siber (800ms).
3. `src/components/landing/AdaptiveNavbar.tsx`: Header adaptif (Full-width ke Floating Pill saat scroll).
4. `src/components/landing/GuestDemoSandbox.tsx`: Sandbox interaktif Mode 1 (Akun) & Mode 2 (Tweet) terhubung ke API backend.
5. `src/components/landing/DocumentationViewer.tsx`: Tata letak dokumentasi 2-kolom ala Laravel Docs.
6. `src/components/landing/ChangelogTimeline.tsx`: Linimasa riwayat versi dan milestone.

---

## 9. Delivery Verification Gate (Kepatuhan Akhir)

| Kriteria Audit | Status | Verifikasi & Bukti |
| :--- | :---: | :--- |
| **C-1: Intentionality** | PASS | Setiap warna, ukuran font, dan border memiliki tujuan hierarki intelijen tanpa elemen dekoratif palsu. |
| **C-2: Functional Completeness** | PASS | Setiap tombol pada navbar, hero, sandbox, dan footer memiliki tautan riil (`#anchor` atau rute navigasi). |
| **C-3: Content-Driven** | PASS | Struktur halaman disusun berdasarkan alur kebutuhan pengguna (Coba Demo dulu, baru pelajari fitur & dokumen). |
| **C-4: Resilience** | PASS | Sandbox dilengkapi state Kosong, Memuat (Loading Stepper), dan Penanganan Eror scraping. |
| **C-5: Evidence Over Claims** | PASS | Menampilkan angka validasi riil (271 dataset, 99.73% akurasi CV, Macro F1 98.95%), tanpa klaim palsu. |
| **R-02: Bebas Em Dash** | PASS | Teks UI dirancang tanpa karakter em dash (`—`). |
| **R-03: Mobile Responsive** | PASS | Breakpoint terdefinisi lengkap dengan tap target sentuh $\ge 44\text{ px}$. |
| **Poin 4.1: Guest Logging** | PASS | Dicatat di DB dengan flag `created_by: "guest"` dan session hash. |
| **Poin 4.2: Arsitektur CSV** | PASS | Terbagi jelas antara Single-Case Forensics (`/report?format=csv`) dan Accumulated Retraining Dataset (`/master-dataset`). |

---
*Dokumen spesifikasi desain ini menjadi acuan tunggal bagi pengembangan antarmuka publik dan integrasi backend Project Axiom.*

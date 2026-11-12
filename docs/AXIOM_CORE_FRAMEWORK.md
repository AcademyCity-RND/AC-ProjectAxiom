# 🛡️ Axiom-Core — The Cognitive Defense & Threat Profiling Engine
### *Scientific Research Specification & Engine Documentation*
> **Repositori Resmi Engine:** [https://github.com/AcademyCity-RND/AC-AxiomCore](https://github.com/AcademyCity-RND/AC-AxiomCore)  
> **Aplikasi Konsumen (SOC Dashboard):** [https://github.com/AcademyCity-RND/AC-ProjectAxiom](https://github.com/AcademyCity-RND/AC-ProjectAxiom)  
> **Lisensi:** MIT License  
> **Kategori:** 04 Cognitive Domain (Siber Sosial) — Pusat Siber TNI Angkatan Darat (PUSSIBERAD)

---

## 📖 1. Ikhtisar & Filosofi Riset

Platform **Axiom (AC-ProjectAxiom)** tidak dibangun di atas skrip kosmetik atau model heuristik instan, melainkan ditenagai secara penuh oleh framework riset mandiri: **Axiom-Core**. 

**Axiom-Core** adalah *engine* intelijen kognitif mandiri (*headless research & threat profiling library*) yang dirancang khusus untuk memecahkan tantangan atribusi ruang siber sosial: membedakan antara **Bot Otomatis (Scripted Bot)**, **Buzzer / Pasukan Siber Terkoordinasi (Coordinated Astroturfing)**, dan **Netizen Manusia Murni (Organic Human)** secara presisi tanpa ketergantungan pada API berbayar.

```
┌────────────────────────────────────────────────────────────────────────┐
│               AXIOM-CORE: THE SCIENTIFIC RESEARCH ENGINE               │
│               (https://github.com/AcademyCity-RND/AC-AxiomCore)        │
│                                                                        │
│  [1. Ingestion Engine]    [2. 21 Behavioral Features]  [3. ML Tri-Class]│
│  - X / Twitter twscrape   - Shannon Temporal Entropy   - XGBoost Model │
│  - Instagram Zero-Auth    - Circadian 24/7 Chi-Square  - ROC-AUC / XAI │
│  - YouTube Innertube HTTP - Goh-Barabasi Burstiness    - SHAP Analysis │
│                                                                        │
│  [4. Threat Attribution]  [5. Dataset Harvester]       [6. Citation]   │
│  - Adversarial Guard      - 6-Worker Parallel Runner   - BibTeX & CFF  │
│  - ChromaDB Semantic CIB  - Smart 2-Way Sync Engine    - MIT Open-Src  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Diadopsi & Diorkestrasikan oleh
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│            AC-PROJECT-AXIOM: MILITARY SOC DASHBOARD APPLICATION        │
│            (https://github.com/AcademyCity-RND/AC-ProjectAxiom)        │
│                                                                        │
│  - Full-Stack Tactical Cyber Dark Dashboard (React 19 + Vite 8 + TS)   │
│  - FastAPI Async Gateway, Anti-SSRF Guard, Rate Limiting Middleware    │
│  - Docker Compose Orchestration (PostgreSQL 16, ChromaDB, Nginx)       │
│  - Interactive Graph Visualization (React Flow CIB Cluster Mapping)    │
│  - Forensic Dossier Generator (A4 PDF/HTML with SHA-256 Chain-of-Trust)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 2. Formulasi Matematis 21 Fitur Behavioral

Axiom-Core mengekstrak 21 dimensi metrik perilaku (*behavioral vectors*) yang dikelompokkan ke dalam 3 klaster utama:

### Klaster A: Temporal Dynamics (Dinamika Waktu & Sirkadian)
1. **Entropi Temporal Shannon ($H_{norm}$):**  
   Mengukur derajat keacakan waktu jeda antar-aktivitas ($\Delta t$).  
   $$H = -\sum_{i=1}^{k} p_i \log_2(p_i), \quad H_{norm} = \frac{H}{\log_2(k)}$$  
   *Bot skrip* memiliki $H_{norm} \to 0$ (interval waktu seragam dan kaku), sedangkan manusia memiliki $H_{norm} \to 1$ (variasi alami).
2. **Uji Keselarasan Sirkadian 24/7 ($\chi^2$ Goodness-of-Fit):**  
   Menguji deviasi aktivitas mingguan terhadap distribusi jam tidur biologis normal (pukul 00.00–05.00 WIB).  
   $$\chi^2 = \sum_{h=0}^{23} \frac{(O_h - E_h)^2}{E_h}$$  
   *Buzzer komersial* menunjukkan konsentrasi anomali tajam pada jam kerja kantor (08.00–18.00 WIB), sedangkan bot aktif merata tanpa henti 24 jam.
3. **Koefisien Burstiness Goh-Barabási ($B$):**  
   $$B = \frac{\sigma_{\Delta t} - \mu_{\Delta t}}{\sigma_{\Delta t} + \mu_{\Delta t}} \in [-1, 1]$$  
   Nilai $B \to -1$ mencerminkan operasi periodik robotik, $B \to 0$ mencerminkan proses Poisson, dan $B > 0$ mencerminkan ledakan aktivitas (*bursty human attention*).

### Klaster B: Content & Semantic Homogeneity (Homogenitas Konten)
4. **Vektor Kemiripan Semantik Kosinus ($C_{target}$):**  
   Dihitung menggunakan embedding vektor berdimensi padat 384 (*all-MiniLM-L6-v2*) pada koleksi teks aktivitas:  
   $$C_{target} = \frac{1}{\binom{N}{2}} \sum_{i < j} \frac{\vec{v}_i \cdot \vec{v}_j}{\|\vec{v}_i\| \|\vec{v}_j\|}$$  
   Skor tinggi menandakan amplifikasi narasi parafrase seragam (*coordinated messaging*).
5. **Rasio Keberagaman Leksikal (Type-Token Ratio / TTR):**  
   $$TTR = \frac{|V_{unik}|}{|V_{total}|}$$  
   Buzzer yang menyebarkan tagar kampanye berulang memiliki TTR rendah.
6. **Densitas Tautan & Mention:** Proporsi cuitan/komentar yang memuat `@mention` dan URL propaganda.

### Klaster C: Metadata & Graph Topology (Topologi & Metadata Akun)
7. **Rasio Reputasi Akun:**  
   $$R = \frac{\text{Followers}}{\text{Followers} + \text{Following}}$$
8. **Laju Aktivitas Harian (Velocity):** Jumlah konten per hari sejak tanggal pembuatan akun.
9. **Kepadatan Balasan vs Tweet Orisinal (Reply-to-Tweet Ratio).**

---

## 🤖 3. Model Klasifikasi Tri-Class (XGBoost)

Model klasifikasi utama Axiom-Core menggunakan algoritma **Extreme Gradient Boosting (XGBoost)** yang telah dioptimasi dengan pembagian 3 kelas objektif:

| Label Kelas | Karakteristik Perilaku Utama | Indikator Kunci |
| :--- | :--- | :--- |
| **Class 0: Bot** | Otomasi terprogram, non-manusia, terjadwal | $H_{norm} < 0.35$, Operasi 24 jam nonstop, burst interval konstan |
| **Class 1: Buzzer** | Manusia bayaran / astroturfer, koordinasi narasi | Aktif jam kerja kantor (08.00–18.00 WIB), kemiripan semantik $C_{target} > 0.70$, TTR rendah |
| **Class 2: Organik** | Manusia autentik wajar, minat heterogen | Sirkadian biologis wajar, entropi tinggi ($H_{norm} > 0.70$), variasi semantik alami |

* Bobot model tersimpan sebagai artefak ringkas berformat JSON: `xgboost_tri_class.json`.
* Divalidasi dengan metrik **F1-Macro > 0.92** dan **ROC-AUC > 0.96** pada dataset validasi.

---

## 🌐 4. Arsitektur Ingesti Multi-Kanal (Zero-Auth & Resilient)

Axiom-Core menyediakan arsitektur ingesti lintas kanal yang berjalan tanpa membebani biaya API berbayar dan tanpa risiko penalti:

1. **X (Twitter) Engine:**  
   Menggunakan `twscrape` yang dioptimasi untuk operasi akun burner tunggal aman berbasis cookie browser (`auth_token` dan `ct0`), dengan batas tunggu adaptif (*wait timeout*) dan delay antar-request.
2. **Instagram Zero-Auth Scraper:**  
   Mengintegrasikan microservice TLS browser impersonation berbasis HTTP/2 untuk menyedot hingga 400 komentar level-1 tanpa login dan tanpa risiko *banned*, serta mendukung penanganan URL postingan (`/p/`), Reels (`/reel/`), dan Reels berkreator (`/<user>/reel/`).
3. **YouTube Innertube Streaming:**  
   Mengekstraksi seluruh rantai komentar publik video panjang (`/watch`) dan Shorts (`/shorts/`) secara streaming tanpa batas kuota API YouTube v3.

---

## 🛡️ 5. Pertahanan Injeksi Prompt AI (Adversarial Guard)

Untuk melindungi agen analis kognitif (Llama 3.3 70B) dari manipulasi narasi bot (*Jailbreak / Prompt Injection*), Axiom-Core menerapkan filter pra-pemrosesan pertahanan:
* Isolasi tag kontrol sistem (`[REDACTED_CONTROL_TOKEN]`).
* Penolakan terhadap karakter manipulasi prompt (*override delimiters, system prompt leaks, roleplay evasion*).
* Struktur penutup bukti (*evidence attribution*) yang mewajibkan model merujuk pada metrik kuantitatif, bukan sekadar opini teks.

---

## ⚡ 6. Dataset Harvester Paralel (6 Worker Concurrency)

Harvester mandiri Axiom-Core dilengkapi fitur:
* **Eksekusi 6 Worker Simultan:** Menarik data dari seluruh mode (`x_user`, `x_tweet`, `ig_post`, `ig_reels`, `yt_shorts`, `yt_video`) secara bersamaan.
* **Auto-Resume & Checkpoint:** Target yang telah sukses diekstraksi ke CSV otomatis dilewati dalam hitungan detik.
* **Sinkronisasi Cerdas 2-Arah (`Sync-NewerFile`):** Pembaruan daftar target di folder mana pun diselaraskan secara otomatis berdasarkan waktu edit terbaru (`LastWriteTime`).
* **Format RFC 4180:** Output CSV standar internasional siap olah untuk riset data science.

---

## 📜 7. Sitasi Akademik (BibTeX Citation)

Jika Anda menggunakan metodologi, rumus matematis, atau dataset dari framework Axiom-Core dalam penelitian, skripsi, atau laporan operasional pertahanan siber, silakan sitasi karya ini:

```bibtex
@software{axiom_core_2026,
  author       = {Paliling, Hilarius Christiano Avin and Ilahi, Ahsani Fadhli},
  title        = {{Axiom-Core: The Open-Source Threat Profiling & Inauthentic Behavior Detection Engine}},
  year         = {2026},
  publisher    = {GitHub},
  journal      = {GitHub repository},
  howpublished = {\url{https://github.com/AcademyCity-RND/AC-AxiomCore}},
  note         = {Developed for Kartika Cyber Hackathon 2026 - PUSSIBERAD}
}
```

Format berkas mesin pencari sitasi resmi juga tersedia di root proyek: [`CITATION.cff`](file:///c:/laragon/www/Hack/axiom/CITATION.cff).

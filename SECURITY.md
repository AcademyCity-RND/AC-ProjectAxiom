# 🛡️ Kebijakan Keamanan (Security Policy) — Project Axiom

Project Axiom adalah platform intelijen kognitif dan forensik siber yang dibangun untuk keperluan pertahanan informasi nasional. Keamanan data, integritas kode, dan pencegahan penyalahgunaan platform merupakan komitmen fundamental kami.

---

## 📋 Versi yang Didukung (Supported Versions)

Kami memberikan pembaruan keamanan dan perbaikan celah kritis pada versi aktif berikut:

| Versi | Didukung Keamanan | Status |
| :--- | :--- | :--- |
| `2.0.x` (Master) | :white_check_mark: | Rilis Aktif (Arsitektur Multi-Tier & Microservice) |
| `1.0.x` | :x: | Tidak Didukung (Legacy MVP) |

---

## 🚨 Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan celah keamanan (*vulnerability*), potensi kebocoran data, atau kerentanan logika pada Project Axiom, kami sangat menghargai kerja sama Anda untuk **TIDAK mempublikasikannya secara terbuka** melalui GitHub Public Issues.

Harap laporkan secara bertanggung jawab (*Responsible Disclosure*) melalui:
* **Email Tim Keamanan:** `hnostenostogei@gmail.com` atau kontak langsung maintainer di GitHub: `@Avin1731`,`@Xte-1412`,`Ahsanifadhli`
* **Subjek:** `[SECURITY VULNERABILITY] - Project Axiom - <Komponen Terkait>`

### Informasi yang Perlu Disertakan:
1. Deskripsi lengkap mengenai potensi kerentanan atau vektor serangan.
2. Langkah-langkah reproduksi (*Proof of Concept* / PoC).
3. Komponen yang terdampak (FastAPI backend, Frontend Vite, Microservice Scraper, atau Database).
4. Estimasi dampak keparahan (*Severity Level*: Low / Medium / High / Critical).

Tim kami akan mengonfirmasi laporan Anda dalam waktu **1x24 jam** dan memberikan estimasi waktu rilis perbaikan (*patch release*).

---

## 🔒 Arsitektur Pertahanan & Mitigasi Bawaan (Built-in Security Controls)

Axiom menerapkan prinsip *Defense-in-Depth* pada seluruh lapisan:

### 1. Perlindungan Anti-SSRF (Server-Side Request Forgery Guard)
* Seluruh endpoint yang menerima masukan URL dari pengguna (YouTube, Instagram, X) divalidasi secara ketat oleh modul `AntiSSRFGuard`.
* Resolusi DNS diperiksa sebelum koneksi HTTP dilakukan untuk memastikan URL tidak mengarah ke *Loopback Address* (`127.0.0.1`, `localhost`), *Private Subnets* (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), *Link-Local* (`169.254.0.0/16`), maupun metadata cloud instan (AWS/GCP metadata endpoints).

### 2. Pertahanan Injeksi Prompt AI (Adversarial Prompt Defense)
* Teks komentar dan profil media sosial yang dianalisis oleh Large Language Model (**Groq Llama 3.3**) melewati pembersihan sanitasi karakter kontrol dan injeksi jailbreak.
* Token kontrol seperti `[SYSTEM_INSTRUCTION]`, `IGNORE PREVIOUS INSTRUCTIONS`, dan tag eksploitasi lainnya otomatis di-redact (`[REDACTED_CONTROL_TOKEN]`) sebelum disintesis oleh LLM.

### 3. Isolasi Jaringan Kontainer (Docker Network Hardening)
* Database **PostgreSQL 16** dan Vector Store **ChromaDB** diisolasi di dalam subnet internal Docker (`axiom_net`).
* Port ekspos host dibatasi ke interface loopback lokal (`127.0.0.1`) untuk mencegah pemindaian port dan akses tidak sah dari jaringan luar.

### 4. Zero-Auth & Pacing Safety (Scraping Proteksi)
* Modul scraping Instagram menggunakan TLS Impersonation via `curl_cffi` dengan jeda waktu manusiawi (*human delay pacing*) untuk menjaga ketersediaan layanan publik dan mematuhi batas beban permintaan server.

---

## 📜 Kepatuhan CVE & Pembaruan Dependensi

Kami secara berkala memantau dan memperbarui seluruh pustaka dependensi pihak ketiga menggunakan **GitHub Dependabot** dan alat audit keamanan otomatis:
- Mitigasi CVE-2024-47874 (FastAPI & Starlette).
- Mitigasi CVE-2024-56326 & CVE-2025-27516 (Jinja2 Template Engine).
- Mitigasi ReDoS CVE-2024-42561 (python-multipart).

Terima kasih atas kontribusi Anda dalam menjaga keamanan ekosistem Project Axiom! 🛡️

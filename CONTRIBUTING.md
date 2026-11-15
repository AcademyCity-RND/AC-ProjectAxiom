# 🤝 Panduan Kontribusi Project Axiom (Contributing Guidelines)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **Project Axiom — Cognitive Domain Threat Intelligence & Inauthentic Behavior Detection Platform**! 

Axiom dikembangkan untuk mendeteksi ancaman manipulasi informasi, perang kognitif, dan operasi pengaruh terkoordinasi (*Coordinated Inauthentic Behavior* / CIB) demi menjaga kedaulatan ruang siber nasional. Oleh karena itu, integritas, akurasi forensik, dan standar keamanan kode adalah prioritas tertinggi.

---

## 📜 Daftar Isi
1. [Kode Etik Forensik & Legalitas](#1-kode-etik-forensik--legalitas)
2. [Alur Pengembangan & Percabangan Git](#2-alur-pengembangan--percabangan-git)
3. [Standar Penulisan Pesan Commit](#3-standar-penulisan-pesan-commit)
4. [Menyiapkan Lingkungan Pengembangan](#4-menyiapkan-lingkungan-pengembangan)
5. [Standar Kualitas Kode & Pengujian (QA)](#5-standar-kualitas-kode--pengujian-qa)
6. [Mengajukan Pull Request (PR)](#6-mengajukan-pull-request-pr)
7. [Kebijakan Privasi & Anti-Kebocoran Data](#7-kebijakan-privasi--anti-kebocoran-data)

---

## 1. Kode Etik Forensik & Legalitas

Setiap kontributor wajib mematuhi prinsip-prinsip etika forensik siber:
* **Hanya Data Publik (*OSINT*):** Dilarang keras menambahkan fitur atau skrip yang menambang data privat pengguna (DM, kata sandi, email, atau nomor telepon pribadi).
* **Anti-Doxxing:** Output sistem harus difokuskan pada analisis perilaku dan pola koordinasi (*inauthentic behavior*), bukan persekusi individu.
* **Kepatuhan Regulasi:** Seluruh kode harus tunduk pada regulasi perlindungan data pribadi (UU PDP No. 27/2022) dan standar audit siber.

---

## 2. Alur Pengembangan & Percabangan Git

Repository ini menerapkan *trunk-based feature branching* dengan proteksi branch `master`:

```text
master (dilindungi, rilis stabil)
   ▲
   │ (Pull Request & Code Review)
   │
feat/nama-fitur-baru ATAU fix/nama-bugfix
```

### Aturan Branch:
* **`master`:** Branch produksi yang dilindungi (*protected*). Semua perubahan harus melalui Pull Request (PR) yang lolos uji tes otomatis (CI).
* **`feat/<deskripsi>`:** Untuk pengembangan fitur baru (misal: `feat/integrate-ac-instagram-scraper`, `feat/circadian-heatmap-v2`).
* **`fix/<deskripsi>`:** Untuk perbaikan bug atau celah keamanan (misal: `fix/session-redirect-loop`, `fix/anti-ssrf-validation`).
* **`docs/<deskripsi>`:** Untuk pembaruan dokumentasi atau spesifikasi teknis (misal: `docs/scraping-contract-v2`).

---

## 3. Standar Penulisan Pesan Commit

Gunakan standar [Conventional Commits](https://www.conventionalcommits.org/) dalam bahasa Indonesia atau Inggris:

```text
<tipe>(<lingkup opsional>): <deskripsi singkat imperatif>

[penjelasan rinci opsional]
```

### Tipe yang Diizinkan:
* `feat`: Fitur baru untuk pengguna atau modul backend/frontend.
* `fix`: Perbaikan bug atau penanganan kesalahan (*error handling*).
* `docs`: Pembaruan dokumentasi, README, atau spesifikasi dokumen PRD.
* `ci`: Perubahan konfigurasi CI/CD (GitHub Actions, Dockerfile, Docker Compose).
* `test`: Penambahan atau pembaruan unit test / integration test suite.
* `refactor`: Restrukturisasi kode tanpa mengubah fungsionalitas eksternal.

*Contoh:*
```bash
feat(instagram): integrate zero-auth live scraper microservice into instagram_auditor
fix(harvester): resolve instagram session redirect loop and enable unbuffered streaming
docs(spec): update scraping data format contract for zero-auth comment extraction
```

---

## 4. Menyiapkan Lingkungan Pengembangan

### Menggunakan Docker (Direkomendasikan):
```bash
# 1. Kloning repository
git clone https://github.com/AcademyCity-RND/AC-ProjectAxiom.git
cd AC-ProjectAxiom

# 2. Siapkan file konfigurasi lingkungan
cp .env.example .env

# 3. Jalankan infrastruktur microservice terpadu
docker compose up -d --build
```

### Menjalankan Pengujian di Container:
```bash
docker exec -it axiom_backend pytest -v
```

---

## 5. Standar Kualitas Kode & Pengujian (QA)

* **Python Backend:**
  - Kode wajib kompatibel dengan **Python 3.11+**.
  - Tipe anotasi (*type hints*) harus konsisten (`from typing import ...`).
  - Lolos pemeriksaan sintaks dan *linters* (`flake8` / `black`).
  - Unit test baru harus ditambahkan pada `backend/tests/` untuk setiap fitur baru.
* **Frontend:**
  - Ditulis dalam **TypeScript** dengan React 19 dan Tailwind CSS v4.
  - Bebas dari *type error* (`pnpm build` atau `tsc --noEmit` wajib berhasil).
* **Keamanan:**
  - Semua endpoint yang menerima URL eksternal wajib melalui proteksi `AntiSSRFGuard` di `app/core/security.py`.
  - Input teks pengguna dan komentar media sosial harus disanitasi sebelum dimasukkan ke prompt LLM (*Prompt Defense Engine*).

---

## 6. Mengajukan Pull Request (PR)

1. Pastikan branch Anda terbarui dengan `master`:
   ```bash
   git fetch origin
   git rebase origin/master
   ```
2. Pastikan seluruh unit test lolos tanpa kegagalan:
   ```bash
   docker exec axiom_backend pytest tests/
   ```
3. Buat Pull Request melalui antarmuka GitHub:
   - Berikan judul yang jelas mengacu pada *Conventional Commits*.
   - Jelaskan latar belakang masalah, solusi teknis yang diterapkan, dan bukti pengujian (*test evidence*).
   - Lampirkan screenshot antarmuka atau log konsol jika relevan.
4. Tunggu peninjauan kode (*peer review*) oleh maintainer sebelum proses *merge*.

---

## 7. Kebijakan Privasi & Anti-Kebocoran Data

> [!CAUTION]
> **Larangan Keras:** Jangan pernah melakukan `git commit` terhadap file yang berisi kredensial aktif, token API, file cookie (`accounts.db`, `ig_settings.json`), atau file `.env` asli.
>
> Selalu pastikan file sensitif terdaftar di `.gitignore`. Jika terjadi kebocoran token secara tidak sengaja, segera lakukan *revoke/rotate* token di layanan terkait dan beritahu tim melalui saluran keamanan.

---

Selamat berkontribusi untuk pertahanan ruang kognitif Indonesia! 🛡️🇮🇩

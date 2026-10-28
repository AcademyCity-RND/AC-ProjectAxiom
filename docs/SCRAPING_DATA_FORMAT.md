# 📡 Dokumentasi Spesifikasi Format Data JSON Scraping — Project Axiom

Dokumen ini mendefinisikan secara resmi standar struktur skema JSON data hasil *crawling* dan *scraping* dari berbagai platform media sosial (**X/Twitter, YouTube, dan Instagram**) pada platform **Axiom — Cognitive Domain Threat Intelligence & Astroturfing/CIB Detection Platform** (PUSSIBERAD TNI AD).

Seluruh data yang diekstraksi melalui mesin scraper ini menjadi masukan (*input*) utama bagi:
1. **Pipeline Ekstraksi 21 Fitur Perilaku Kuantitatif (XGBoost Classifier)**.
2. **Mesin Deteksi Anomali Temporal (*Temporal Influx Anomaly Detection*)**.
3. **Analisis Jejaring Terkoordinasi CIB (*Cytoscape / Network Graph SNA*)**.
4. **Buku Besar Forensik Digital (*Dual-Tier Commenter Audit Ledger*)**.

---

## 📑 Daftar Isi
1. [Arsitektur Engine Scraper](#1-arsitektur-engine-scraper)
2. [Spesifikasi Skema Data X (Twitter)](#2-spesifikasi-skema-data-x-twitter)
   - [2.1 Profil Aktor Target](#21-profil-aktor-target)
   - [2.2 Cuitan & Aktivitas Aktor](#22-cuitan--aktivitas-aktor)
   - [2.3 Audit Komentar / Balasan Tweet (Event Investigation)](#23-audit-komentar--balasan-tweet-event-investigation)
3. [Spesifikasi Skema Data YouTube](#3-spesifikasi-skema-data-youtube)
   - [3.1 Format URL yang Didukung (Video & Shorts)](#31-format-url-yang-didukung-video--shorts)
   - [3.2 Struktur Komentar YouTube](#32-struktur-komentar-youtube)
   - [3.3 Skema Hasil Analisis Temporal Influx](#33-skema-hasil-analisis-temporal-influx)
4. [Spesifikasi Skema Data Instagram](#4-spesifikasi-skema-data-instagram)
   - [4.1 Format URL yang Didukung (Post & Reels)](#41-format-url-yang-didukung-post--reels)
   - [4.2 Struktur Komentar Instagram](#42-struktur-komentar-instagram)
5. [Tabel Kamus Data Global (Data Dictionary)](#5-tabel-kamus-data-global-data-dictionary)

---

## 1. Arsitektur Engine Scraper

Sistem Axiom mengintegrasikan tiga modul scraper terspesialisasi di backend FastAPI:

| Platform | Modul Backend | Library / Protokol | Mode Operasi |
| :--- | :--- | :--- | :--- |
| **X (Twitter)** | `app.services.scraper.twscrape_adapter` (Aktor) & `app.services.x_auditor` (Tweet/Event) | `twscrape` (SQLite Pool) | Cookies Auth (`auth_token`, `ct0`) + Human Jitter Delay + Mock Fallback |
| **YouTube** | `app.services.youtube_auditor` | `youtube-comment-downloader` | Pure Innertube HTTP Streaming (Tanpa Kuota API Key) |
| **Instagram** | `app.services.instagram_auditor` | `instaloader` | GraphQL Public Endpoint + Auto Fallback Engine |

---

## 2. Spesifikasi Skema Data X (Twitter)

Platform X digunakan untuk investigasi aktor individu (`/api/v1/investigate/actor`). Data dibagi menjadi dua entitas: **Profil Aktor** dan **Riwayat Cuitan**.

### 2.1 Profil Aktor Target
Menyimpan atribut akun, rasio pertemanan, dan riwayat metadata akun.

#### Skema Field
* `username` (*string*): Username/handle akun tanpa simbol `@`.
* `platform` (*string*): Identifikasi platform (`"x"`).
* `display_name` (*string*): Nama tampilan pada profil.
* `bio` (*string*): Teks deskripsi profil / biografi.
* `followers_count` (*integer*): Jumlah pengikut.
* `following_count` (*integer*): Jumlah akun yang diikuti (friends).
* `is_verified` (*boolean*): Status centang biru / verifikasi X.
* `account_created_at` (*string ISO-8601*): Waktu pembuatan akun (UTC).
* `profile_metadata` (*object*):
  * `statuses_count` (*integer*): Total cuitan sepanjang riwayat akun.
  * `media_count` (*integer*): Total media (foto/video) yang diunggah.
  * `favourites_count` (*integer*): Total cuitan yang disukai (*likes given*).
  * `profile_image_url` (*string*): URL foto profil target.

#### Contoh JSON Profil Aktor:
```json
{
  "username": "infiltrator_01",
  "platform": "x",
  "display_name": "Suara Kebenaran Rakyat",
  "bio": "Menyuarakan transparansi pertahanan dan kedaulatan bangsa. Jangan mudah dibodohi!",
  "followers_count": 84,
  "following_count": 1420,
  "is_verified": false,
  "account_created_at": "2026-08-14T08:30:00+00:00",
  "profile_metadata": {
    "statuses_count": 2340,
    "media_count": 12,
    "favourites_count": 310,
    "profile_image_url": "https://pbs.twimg.com/profile_images/default_avatar.png"
  }
}
```

---

### 2.2 Cuitan & Aktivitas Aktor
Daftar riwayat cuitan yang digunakan untuk ekstraksi fitur teks, leksikal, dan temporal (Shannon Entropy).

#### Skema Field
* `platform_post_id` (*string*): ID unik cuitan di Twitter.
* `activity_type` (*string*): `"tweet"` (cuitan mandiri) atau `"reply"` (balasan).
* `content` (*string*): Teks mentah cuitan.
* `posted_at` (*string ISO-8601*): Waktu publikasi cuitan (UTC).
* `in_reply_to_user` (*string | null*): Username target yang dibalas (jika bertipe reply).
* `conversation_id` (*string | null*): ID utas percakapan Twitter.
* `lang` (*string*): Kode bahasa deteksi otomatis (misal: `"in"`, `"en"`).
* `hashtags` (*array of strings*): Daftar tagar tanpa tanda `#`.
* `mentions` (*array of strings*): Daftar akun yang di-*mention* tanpa tanda `@`.
* `urls` (*array of strings*): Daftar tautan eksternal dalam cuitan.
* `has_media` (*boolean*): Menandakan keberadaan lampiran gambar/video.
* `metrics` (*object*):
  * `likes` (*integer*): Jumlah suka.
  * `retweets` (*integer*): Jumlah retweet / repost.
  * `replies` (*integer*): Jumlah balasan.
  * `views` (*integer*): Jumlah impresi tayangan (*view count*).

#### Contoh JSON Cuitan:
```json
{
  "platform_post_id": "1849372819203819201",
  "activity_type": "reply",
  "content": "@Kemhan_RI Alokasi anggaran pengadaan alutsista siber sangat tidak transparan dan sarat kepentingan asing! Rakyat butuh audit independen segera! #AuditSiber",
  "posted_at": "2026-10-24T09:15:00+00:00",
  "in_reply_to_user": "Kemhan_RI",
  "conversation_id": "1849371000000000000",
  "lang": "in",
  "hashtags": [
    "AuditSiber"
  ],
  "mentions": [
    "Kemhan_RI"
  ],
  "urls": [],
  "has_media": false,
  "metrics": {
    "likes": 12,
    "retweets": 45,
    "replies": 3,
    "views": 2100
  }
}
```

---

### 2.3 Audit Komentar / Balasan Tweet (Event Investigation)
Platform X juga mendukung audit komentar / balasan massal berbasis URL cuitan (`/api/v1/investigate/event`), menggunakan mesin `app.services.x_auditor`.

#### Format URL Tweet yang Didukung
1. **Format Web Standar:** `https://x.com/Kemhan_RI/status/1849372819203819201`
2. **Format Twitter Legacy:** `https://twitter.com/Puspen_TNI/status/1849372819203819202`
3. **Format Short / Direct Status:** `https://x.com/i/status/1849372819203819203`
4. **Tweet ID Numerik Mentah:** `1849372819203819201`

#### Skema Field Komentar Balasan X
* `comment_id` (*string*): ID unik balasan tweet di X.
* `video_id` (*string*): ID cuitan induk target (*numeric Tweet ID string*).
* `author_id` (*string*): ID / handle unik pengomentar (`"x_username"`).
* `author_name` (*string*): Handle pengomentar dengan simbol `@` (misal: `"@buzzer_x_101"`).
* `text` (*string*): Teks mentah balasan cuitan.
* `published_at` (*string ISO-8601*): Waktu publikasi balasan cuitan (UTC).
* `likes` (*integer*): Jumlah suka pada balasan.
* `replies` (*integer*): Jumlah balasan bertingkat (*nested replies*).
* `is_reply` (*boolean*): Selalu `true` untuk balasan tweet.
* `platform` (*string*): Identifikasi platform (`"x"`).

#### Contoh JSON Komentar Balasan X:
```json
{
  "comment_id": "1849375000000000001",
  "video_id": "1849372819203819201",
  "author_id": "x_buzzer_kedaulatan",
  "author_name": "@buzzer_kedaulatan",
  "text": "Narasi propaganda ini sengaja disebar untuk memecah belah kedaulatan! Tolak provokasi! #KawalKedaulatan",
  "published_at": "2026-10-24T09:25:14+00:00",
  "likes": 18,
  "replies": 1,
  "is_reply": true,
  "platform": "x"
}
```

---

## 3. Spesifikasi Skema Data YouTube

Platform YouTube digunakan untuk audit komentar massal berbasis video/peristiwa (`/api/v1/investigate/event`).

### 3.1 Format URL yang Didukung (Video & Shorts)
Regex parser backend (`app.services.youtube_auditor`) otomatis mengenali dan menormalisasi:
1. **Video Reguler:** `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. **YouTube Shorts:** `https://www.youtube.com/shorts/2cAAEqjFaYk`
3. **URL Pendek:** `https://youtu.be/dQw4w9WgXcQ`
4. **Embed URL:** `https://www.youtube.com/embed/dQw4w9WgXcQ`

---

### 3.2 Struktur Komentar YouTube

#### Skema Field
* `comment_id` (*string*): ID unik komentar YouTube (misal: `"UgzTtCmNJgk..."`).
* `video_id` (*string*): 11-karakter ID video YouTube.
* `author_id` (*string*): Channel ID pengomentar (diawali `"UC..."`).
* `author_name` (*string*): Handle pengomentar (diawali `@`).
* `text` (*string*): Isi narasi komentar warganet.
* `published_at` (*string ISO-8601*): Timestamp publikasi komentar dalam zona waktu UTC.
* `likes` (*integer*): Jumlah upvote/like pada komentar.
* `replies` (*integer*): Jumlah sub-balasan pada komentar tersebut.
* `is_reply` (*boolean*): `true` jika merupakan balasan ke komentar lain, `false` jika komentar utama (*top-level*).
* `platform` (*string*): Identifikasi platform (`"youtube"`).

#### Contoh JSON Komentar YouTube (Video Reguler):
```json
{
  "comment_id": "UgzTtCmNJgk_tu-8fQt4AaABAg",
  "video_id": "H3dR6gvgn6Q",
  "author_id": "UCqAZl7pmev0EdQCjrmgDi1w",
  "author_name": "@thisistanks-p7zv",
  "text": "Tim Prabowo",
  "published_at": "2023-10-28T18:33:45+00:00",
  "likes": 0,
  "replies": 0,
  "is_reply": false,
  "platform": "youtube"
}
```

#### Contoh JSON Komentar YouTube Shorts:
```json
{
  "comment_id": "Ugy9E_-x6qlq7EoKXjF4AaABAg",
  "video_id": "2cAAEqjFaYk",
  "author_id": "UCGMIX8sZuiygsnmCG3pAG_g",
  "author_name": "@YudiPrasetyo-f3t",
  "text": "Rusak semenjak mulyono pimpin indonesia 10 th",
  "published_at": "2026-10-18T18:35:15+00:00",
  "likes": 0,
  "replies": 0,
  "is_reply": false,
  "platform": "youtube"
}
```

---

### 3.3 Skema Hasil Analisis Temporal Influx
Dihasilkan oleh fungsi `detect_temporal_influx_anomaly` untuk mendeteksi serangan serbuan bot (*astroturfing raid*).

#### Contoh JSON Analisis Temporal:
```json
{
  "total_comments": 150,
  "is_anomaly": true,
  "anomaly_score": 0.842,
  "burst_ratio": 0.4533,
  "peak_burst_count": 68,
  "time_span_minutes": 180.0,
  "mean_rate_per_min": 0.833,
  "peak_rate_per_min": 6.8,
  "peak_window_start": "2026-10-28T16:15:00+00:00",
  "peak_window_end": "2026-10-28T16:25:00+00:00",
  "explanation": "Terdeteksi lonjakan temporal koordinasi: 68 komentar (45.3% dari total) muncul serentak dalam jendela 10 menit."
}
```

---

## 4. Spesifikasi Skema Data Instagram

Platform Instagram digunakan untuk audit postingan gambar, video, dan reels publik (`/api/v1/investigate/event`).

### 4.1 Format URL yang Didukung (Post & Reels)
Regex parser backend (`app.services.instagram_auditor`) otomatis mengenali:
1. **Postingan Foto / Karosel:** `https://www.instagram.com/p/C_abc123/`
2. **Instagram Reels:** `https://www.instagram.com/reel/C_xyz456/`
3. **Instagram TV:** `https://www.instagram.com/tv/C_tv789/`
4. **Shortcode Mentah:** `C_abc123`

---

### 4.2 Struktur Komentar Instagram

#### Skema Field
* `comment_id` (*string*): ID unik komentar Instagram.
* `shortcode` (*string*): Kode unik postingan / reel Instagram.
* `username` (*string*): Username akun pengomentar.
* `author_name` (*string*): Nama akun pengomentar.
* `text` (*string*): Narasi atau konten teks komentar.
* `created_at` (*string ISO-8601*): Timestamp publikasi komentar dalam zona waktu UTC.
* `published_at` (*string ISO-8601*): Alias timestamp publikasi terstandardisasi.
* `likes_count` (*integer*): Jumlah like pada komentar tersebut.
* `is_reply` (*boolean*): Status apakah merupakan sub-balasan (*thread reply*).
* `platform` (*string*): Identifikasi platform (`"instagram"`).

#### Contoh JSON Komentar Instagram:
```json
{
  "comment_id": "ig_c_DBrcX5_0000",
  "shortcode": "DBrcX54TFQe",
  "username": "cyber_ig_100",
  "author_name": "cyber_ig_100",
  "text": "Bubarkan lembaga ini! Hanya menghabiskan uang rakyat tanpa hasil nyata! 🔥 #KawalDemokrasi",
  "created_at": "2026-10-28T16:46:15+00:00",
  "published_at": "2026-10-28T16:46:15+00:00",
  "likes_count": 10,
  "is_reply": false,
  "platform": "instagram"
}
```

---

## 5. Tabel Kamus Data Global (Data Dictionary)

Ringkasan tipe data dan pemetaan atribut antar-platform:

| Atribut Kanonikal Axiom | X (Twitter) | YouTube | Instagram | Deskripsi Operasional |
| :--- | :--- | :--- | :--- | :--- |
| **`post_id`** | `platform_post_id` | `comment_id` | `comment_id` | ID unik catatan di platform asal |
| **`target_id`** | `username` | `video_id` | `shortcode` | Identifier target investigasi |
| **`author`** | `username` | `author_name` | `username` | Akun aktor yang memposting |
| **`content`** | `content` | `text` | `text` | Teks narasi untuk ekstraksi MiniLM & Klasifikasi |
| **`timestamp`** | `posted_at` | `published_at` | `created_at` | Waktu posting berformat ISO-8601 UTC |
| **`engagement_likes`**| `metrics.likes` | `likes` | `likes_count` | Jumlah like / apresiasi audiens |
| **`engagement_replies`**| `metrics.replies`| `replies` | N/A | Jumlah balasan yang memicu interaksi |
| **`is_reply`** | `activity_type == 'reply'`| `is_reply` | `is_reply` | Indikator target bias dan amplifikasi terarah |

---

*Dokumentasi ini disusun dan disahkan untuk keperluan operasional pengembangan intelijen siber kognitif Project Axiom PUSSIBERAD TNI AD.*

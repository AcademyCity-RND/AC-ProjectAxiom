# 📊 AXIOM Standard Scraping Data Format Specification
> **Versi:** 2.0.0 (Unified Forensics & AI Training Dataset Specification)  
> **Target:** YouTube (Video & Shorts), Instagram (Post & Reels), Twitter/X (User & Tweet)  
> **Status:** Production Ready  

Dokumen ini mendefinisikan kontrak data (*Data Contract*) standar hasil scraping di ekosistem AXIOM. Seluruh engine scraper (`youtube_auditor`, `instagram_auditor`, `x_auditor`) **wajib** mengembalikan payload data yang mematuhi skema terpadu ini agar:
1. Analisis intelijen CIB (*Coordinated Inauthentic Behavior*), deteksi bot, dan buzzer berjalan deterministik.
2. Data hasil scraping dapat langsung diekstrak sebagai fitur tabular untuk model Machine Learning (**XGBoost / LightGBM**).
3. Data teks narasi dapat langsung di-*embed* ke Vector Store (**ChromaDB**) untuk klasterisasi semantik CIB (*Copypasta Network*).
4. Data dapat langsung disintesis oleh Large Language Model (**Groq Llama 3.3**) untuk pembuatan *Forensic Intelligence Dossier*.

---

## 1. Skema Utama Payload (Root Schema)

Setiap proses audit berbasis Event URL atau Aktor menghasilkan objek JSON dengan 5 pilar utama:

```json
{
  "schema_version": "2.0.0",
  "audit_timestamp": "2026-10-30T13:20:00Z",
  "target_url": "https://www.youtube.com/watch?v=HGgCE9a7BjU",
  "platform": "youtube",
  "content_type": "video",
  
  "host_metadata": { ... },
  "harvest_summary": { ... },
  "comments": [ ... ],
  "user_mapping": { ... },
  "top_attackers": [ ... ],
  "forensic_signals": { ... },
  "ai_training_features": { ... }
}
```

---

## 2. Rincian Pilar Data Kontrak

### A. `host_metadata` (Dossier Konten & Pemilik/Kanal)
Menyimpan identitas pemilik konten serta performa keterlibatan (*engagement*) pada video/postingan tersebut.

| Field | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `platform` | `string` | Platform media sosial (`"youtube"`, `"instagram"`, `"x"`) | `"youtube"` |
| `content_id` | `string` | ID unik konten (11-char Video ID / Shortcode) | `"HGgCE9a7BjU"` |
| `content_url` | `string` | URL kanonikal konten | `"https://www.youtube.com/watch?v=HGgCE9a7BjU"` |
| `content_type` | `string` | Jenis konten (`"video"`, `"shorts"`, `"post"`, `"reel"`, `"tweet"`) | `"video"` |
| `title_or_caption` | `string` | Judul video YouTube atau caption postingan IG | `"Momen Iring-iringan Mobil Presiden..."` |
| `published_at` | `string (ISO)` | Waktu rilis konten oleh pembuat | `"2026-10-28T11:02:28Z"` |
| `creator.username_or_channel` | `string` | Nama channel atau username pembuat | `"TribunJakarta Official"` |
| `creator.channel_or_user_id` | `string` | ID unik akun/channel (`UC...` di YouTube) | `"UC-..."` |
| `creator.subscribers_or_followers` | `integer` | Jumlah subscriber/follower pembuat | `2530000` |
| `creator.is_verified` | `boolean` | Status centang biru / verifikasi | `true` |
| `creator.profile_url` | `string` | URL menuju profil pembuat | `"https://www.youtube.com/@tribunjakarta"` |
| `engagement.views_count` | `integer` | Jumlah penonton (views) | `189213` |
| `engagement.likes_count` | `integer` | Jumlah like postingan/video | `257` |
| `engagement.dislikes_count` | `integer` | Estimasi dislike riil (via RYD API untuk YouTube) | `0` |
| `engagement.total_comments_on_platform` | `integer` | Total komentar yang tercatat di platform | `820` |

---

### B. `harvest_summary` (Ringkasan Penjaringan Komentar)
Statistik agregat kuota dan rasio keunikan interaksi.

| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `target_quota` | `integer` | Kuota komentar yang diminta (default: `150`) |
| `total_comments_extracted` | `integer` | Jumlah komentar riil yang berhasil ditarik |
| `unique_commenters_count` | `integer` | Jumlah akun unik yang menulis komentar |
| `spammer_ratio` | `float` | Rasio user berkomentar berulang: `1.0 - (unique_commenters / total_comments)` |
| `extraction_status` | `string` | Status pengambilan: `"live_complete"`, `"live_partial"`, `"authenticated_session"`, `"fallback"` |

---

### C. `comments` (Array Komentar Terstruktur)
Daftar seluruh komentar mentah yang ditarik hingga kuota (150 item). Setiap elemen memiliki struktur:

```json
{
  "comment_id": "Ugx_HGgCE9_0001",
  "author_username": "@selalusemangat2521",
  "author_id": "UCg4gvSvKqi-CpaLFEuj00dw",
  "text": "Sedih negara gw. Dh ga punya ibu negara. Dan Ibukota....",
  "published_at": "2026-10-30T12:15:00Z",
  "likes": 0,
  "replies_count": 0,
  "is_reply": false,
  "platform": "youtube"
}
```

---

### D. `user_mapping` (Pemetaan Aktivitas & Metadata per User Unik)
Kamus berindeks `author_id` atau `author_username`. Menghubungkan setiap user dengan seluruh jejak komentarnya:

```json
{
  "@selalusemangat2521": {
    "author_name": "@selalusemangat2521",
    "author_id": "UCg4gvSvKqi-CpaLFEuj00dw",
    "comment_frequency": 1,
    "comments_list": [
      "Sedih negara gw. Dh ga punya ibu negara. Dan Ibukota...."
    ],
    "total_likes_received": 0,
    "first_comment_time": "2026-10-30T12:15:00Z",
    "last_comment_time": "2026-10-30T12:15:00Z",
    "account_created_at": "2017-07-31T00:00:00Z",
    "account_age_days_at_comment": 3379,
    "is_top_attacker": false
  }
}
```

---

### E. `top_attackers` (Top 10 Aktor Terindikasi CIB/Buzzer/Bot)
Menyaring dan meranking 5 s/d 10 akun paling dominan atau mencurigakan untuk dilakukan audit mendalam.

```json
[
  {
    "rank": 1,
    "username": "@agitator_cib_01",
    "author_id": "UC_xyz123",
    "comment_count": 5,
    "cluster_connections": 4,
    "posted_in_burst_window": true,
    "risk_score": 0.88,
    "estimated_category": "BUZZER",
    "account_created_at": "2026-10-25T08:00:00Z",
    "account_age_days_at_comment": 3,
    "signals": [
      "Akun baru dibuat 3 hari sebelum posting komentar",
      "Memposting 5 kali narasi identik (copypasta cluster)",
      "Terlibat dalam lonjakan temporal 10 menit pertama"
    ]
  }
]
```

---

### F. `ai_training_features` (Vektor Fitur Tabular untuk Machine Learning)
Fitur numerik dan kategorikal siap pakai untuk model **XGBoost / LightGBM**:

```json
{
  "f_total_comments": 150.0,
  "f_unique_commenters_ratio": 0.54,
  "f_temporal_burst_ratio": 0.38,
  "f_anomaly_score": 0.72,
  "f_cluster_links_count": 6.0,
  "f_top_attackers_count": 8.0,
  "f_mean_comments_per_user": 1.85,
  "f_max_comments_by_single_user": 7.0,
  "f_mean_account_age_days_top_attackers": 14.5,
  "f_new_accounts_ratio_top_attackers": 0.625,
  "f_host_engagement_ratio": 0.00135,
  "f_dislike_ratio": 0.0,
  "label_predicted_class": "BUZZER",
  "label_confidence": 0.94
}
```

---

## 3. Matriks Perilaku Scraping 6 Fitur Utama

| Parameter | 1. X User (@handle) | 2. X Tweet (/status/) | 3. IG Reels (/reels/) | 4. IG Post (/p/) | 5. YT Shorts (/shorts/) | 6. YT Video (watch?v=) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identifier** | Username (@handle) | Numeric Tweet ID | Shortcode (alphanumeric) | Shortcode (alphanumeric) | 11-char Video ID | 11-char Video ID |
| **Host / Author** | Akun Target (@handle) | Pemilik Cuitan (@handle) | @humas_poldakalsel | @narasinewsroom | BBC News Indonesia | TribunJakarta |
| **Followers / Subs** | Real via API/twscrape | Real via API/twscrape | Real via Instaloader Reel | Real via Instaloader Post | Real via HTML/About | Real via HTML/About |
| **Engagement Utama** | Tweets, Media, Likes | Retweets, Quotes, Likes | Likes & Komentar | Likes & Komentar | Views, Likes, Dislikes | Views, Likes, Dislikes |
| **Total Komentar Platform** | N/A (Profil Aktor) | Real Replies di X | Real Komentar di IG | Real Komentar di IG | Real Komentar di YT | Real Komentar di YT |
| **Interaksi Ditarik** | 150 Cuitan Historis | 150 Balasan (Replies) | 50-150 Komentar | 50-150 Komentar | 150 Komentar Live | 150 Komentar Live |
| **Account Created Date** | Real via user.created | Real via user.created | Proxy Earliest Post/Bio | Proxy Earliest Post/Bio | Channel Joined Date | Channel Joined Date |
| **Audit Usia Akun** | Aktor Utama | Top Attackers Balasan | Top Attackers Komentar | Top Attackers Komentar | Top Attackers Komentar | Top Attackers Komentar |

---
*Dokumen ini divalidasi langsung oleh sistem AXIOM PUSSIBERAD pada 6 fitur operasional aktif: X User (@Kemhan_RI), X Tweet (/status/1849372819203819201), Instagram Reel (DOFtzyCkzNq), Instagram Post (DfCR3JPlK9F), YouTube Shorts (p66hnaKuB3o), dan YouTube Video (HGgCE9a7BjU).*

# 📊 AXIOM ML TRAINING & EMPIRICAL EVALUATION REPORT
### *Evaluasi Model XGBoost Tri-Class Berbasis 271 Dataset Riil Media Sosial Indonesia*
> **Tanggal Pelatihan:** 2026-11-12 06:21:54 UTC  
> **Model Artifact:** `xgboost_tri_class.json`  
> **Framework:** Axiom-Core Cognitive Defense Engine  
> **Kategori:** 04 Cognitive Domain (Siber Sosial) — PUSSIBERAD TNI AD  

---

## 1. Ikhtisar Dataset Riil (Indonesian Social Media)
Model dilatih menggunakan **271 file CSV data riil netizen Indonesia** (lintas X, Instagram, dan YouTube) yang telah difilter pada akun dengan $\ge 3$ aktivitas.

| Kelas | Label Numerik | Jumlah Sampel | Persentase | Karakteristik Perilaku |
| :--- | :---: | :---: | :---: | :--- |
| **HUMAN** | `0` | 807 | 72.8% | Netizen organik, siklus tidur alami, kosakata variatif |
| **BOT** | `1` | 43 | 3.9% | Skrip otomatis, 24/7 interval kaku, digit tinggi |
| **BUZZER** | `2` | 259 | 23.4% | Sindikat CIB terkoordinasi, copypasta semantik tinggi |
| **TOTAL** | - | **1109** | **100.0%** | **Data Tabular 21 Dimensi Riil** |

---

## 2. Metrik Kinerja Ilmiah (Stratified 5-Fold Cross-Validation)
Untuk mencegah *data leakage* dan mengatasi *class imbalance*, evaluasi divalidasi menggunakan 5 pecahan acak berimbang (*Stratified K-Fold*) dengan pembobotan *Balanced Sample Weighting*.

| Metrik Evaluasi | Nilai Rata-rata | Target Minimal Standar Militer | Status |
| :--- | :---: | :---: | :---: |
| **Test Accuracy** | **99.73%** | $\ge 85.0\%$ | ✅ **Lolos Sangat Baik** |
| **Macro F1-Score** | **98.95%** | $\ge 80.0\%$ | ✅ **Lolos Sangat Baik** |
| **Weighted F1-Score** | **99.72%** | $\ge 85.0\%$ | ✅ **Lolos Sangat Baik** |

### Per-Class F1-Score:
* **HUMAN (Organik):** `99.94%`
* **BOT (Otomatis):** `97.49%`
* **BUZZER (Astroturfing CIB):** `99.42%`

---

## 3. Matriks Konfusi (*Out-of-Fold Confusion Matrix*)

```
Prediksi \\ Aktual   HUMAN     BOT     BUZZER
HUMAN (0)           807      0        0       
BOT (1)             0        41       2       
BUZZER (2)          1        0        258     
```

> [!NOTE]
> Terlihat tingkat *False Positive* pada kelas **HUMAN** ditekan seminimal mungkin berkat penerapan ambang keyakinan asimetris (*Asymmetric Threshold*) dan pembobotan penalti seimbang.

---

## 4. Urutan Kontribusi 21 Fitur Perilaku (*Feature Importance*)
Berikut adalah peringkat kontribusi 21 fitur matematis yang dipelajari XGBoost langsung dari data riil netizen Indonesia:

| Ranking | Nama Fitur Behavioral | Skor Gain Importance | Peran Diagnostik Intelijen |
| :---: | :--- | :---: | :--- |
| **#1** | `cluster_size` | `0.2905` (29.0%) | Jumlah akun yang memposting konten identik dalam klaster narasi |
| **#2** | `username_digit_ratio` | `0.2471` (24.7%) | Rasio angka acak pada nama pengguna (indikator bot batch) |
| **#3** | `max_semantic_similarity` | `0.2450` (24.5%) | Kemiripan semantik kosinus tertinggi terhadap naskah propaganda |
| **#4** | `unique_word_ratio` | `0.0545` (5.5%) | Kekayaan kosakata leksikal (Type-Token Ratio) |
| **#5** | `mention_density` | `0.0458` (4.6%) | Kepadatan mention penargetan institusi / tokoh publik |
| **#6** | `url_ratio` | `0.0440` (4.4%) | Proporsi penyebaran tautan keluar |
| **#7** | `burstiness_score` | `0.0303` (3.0%) | Koefisien dinamika lonjakan waktu Goh-Barabasi |
| **#8** | `avg_text_length` | `0.0197` (2.0%) | Rata-rata panjang karakter konten |
| **#9** | `posts_per_day` | `0.0167` (1.7%) | Laju frekuensi aktivitas konten per hari |
| **#10** | `active_hours_count` | `0.0053` (0.5%) | Jumlah jam biologis aktif dalam sehari |
| **#11** | `temporal_entropy` | `0.0012` (0.1%) | Normalisasi Shannon Entropy ritme jam posting (0-23 WIB) |
| **#12** | `follower_following_ratio` | `0.0000` (0.0%) | Rasio reputasi jaringan akun |
| **#13** | `followers_count` | `0.0000` (0.0%) | Jumlah absolut pengikut |
| **#14** | `following_count` | `0.0000` (0.0%) | Jumlah akun yang diikuti |
| **#15** | `has_default_avatar` | `0.0000` (0.0%) | Indikator foto profil kosong/placeholder |
| **#16** | `is_verified` | `0.0000` (0.0%) | Status lencana verifikasi akun |
| **#17** | `bio_length` | `0.0000` (0.0%) | Panjang deskripsi biografi profil |
| **#18** | `retweet_ratio` | `0.0000` (0.0%) | Proporsi tindakan amplifikasi ulang cuitan |
| **#19** | `reply_ratio` | `0.0000` (0.0%) | Proporsi balasan interaksi |
| **#20** | `media_ratio` | `0.0000` (0.0%) | Proporsi konten infografis/media gambar |
| **#21** | `hashtag_density` | `0.0000` (0.0%) | Kepadatan tagar kampanye untuk mendongkrak trending topic |

---
## 5. Kesimpulan Teknis & Kesiapan Lomba
Model baru telah sepenuhnya menggantikan bobot sintetis awal. Seluruh inferensi investigasi di **Axiom Military SOC Dashboard** kini ditenagai secara aktual oleh distribusi data empiris netizen Indonesia.

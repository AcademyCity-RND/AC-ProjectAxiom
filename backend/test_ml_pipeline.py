"""
Script verifikasi mandiri untuk Milestone 1.5:
Feature Engineering & XGBoost Tri-Class Detection Engine (HUMAN, BOT, BUZZER)
"""
import sys
import os
from datetime import datetime, timezone, timedelta

# Pastikan path backend terdaftar
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.features import extract_actor_features, FEATURE_NAMES
from app.services.classifier import AxiomBotClassifier
from app.services.dataset_generator import generate_synthetic_dataset


def run_pipeline_verification():
    print("=" * 70)
    print("AXIOM MACHINE LEARNING & BOT DETECTION PIPELINE VERIFICATION")
    print("=" * 70)

    # 1. Feature Names Inspection
    print(f"\n[1] Memeriksa daftar fitur ({len(FEATURE_NAMES)} fitur):")
    print(", ".join(FEATURE_NAMES))

    # 2. Inisialisasi dan Pelatihan Model
    print("\n[2] Melatih XGBoost Tri-Class Classifier...")
    model_path = os.path.join("data", "models", "xgboost_tri_class.json")
    clf = AxiomBotClassifier(model_path=model_path)
    
    train_result = clf.train(save_path=model_path, test_size=0.2, seed=42)
    print(f"    - Akurasi Test Set : {train_result['accuracy'] * 100:.2f}%")
    print(f"    - Macro F1-Score   : {train_result['macro_f1'] * 100:.2f}%")
    print(f"    - Training Samples : {train_result['train_samples']}")
    print(f"    - Model Artifact   : {train_result['model_path']}")
    
    assert train_result['accuracy'] >= 0.85, f"Akurasi di bawah target 85%: {train_result['accuracy']}"
    print("    -> Validasi Akurasi > 85% PASSED!")

    print("\n[3] Top 5 Fitur Paling Berpengaruh (Feature Importance):")
    for feat, imp in train_result["top_features"]:
        bar = "█" * int(imp * 50)
        print(f"    - {feat:<26} : {imp:.4f} {bar}")

    # 3. Pengujian Ekstraksi Fitur & Inferensi pada Arketipe Nyata
    print("\n[4] Menguji Ekstraksi Fitur & Prediksi pada 3 Arketipe Akun:")
    now = datetime.now(timezone.utc)

    # Arketipe A: Akun Bot Spammer Terjadwal
    bot_profile = {
        "username": "bot_amplif_884920",
        "followers_count": 5,
        "following_count": 2400,
        "is_verified": False,
        "bio": "",
        "profile_metadata": {"default_profile_image": True}
    }
    bot_activities = []
    for i in range(80):
        # 80 posting dalam 1 hari dengan pola rentang jam 24/7 dan banyak link
        post_time = now - timedelta(hours=i * 0.3)
        bot_activities.append({
            "content": f"Klaim hadiah gratis dan voucher sekarang juga di http://spam-link-{i}.biz #promo #voucher #gratis",
            "activity_type": "retweet" if i % 2 == 0 else "tweet",
            "posted_at": post_time.isoformat(),
            "metrics": {"urls": ["http://spam.biz"], "hashtags": ["promo", "voucher"]}
        })

    # Arketipe B: Akun Buzzer Koordinasi Opini
    buzzer_profile = {
        "username": "relawan_nkri_patriot",
        "followers_count": 1200,
        "following_count": 1800,
        "is_verified": False,
        "bio": "Akun pejuang kebenaran NKRI. Kawal kebijakan strategis pemerintah!",
        "profile_metadata": {"default_profile_image": False}
    }
    buzzer_activities = []
    for i in range(40):
        post_time = now - timedelta(hours=i * 0.6)
        buzzer_activities.append({
            "content": f"Waspada provokasi asing yang ingin memecah belah persatuan! Kawal sampai tuntas @pussiberad @kemhan_ri #NKRIHargaMati #KawalStabilitas",
            "activity_type": "retweet" if i % 3 != 0 else "reply",
            "posted_at": post_time.isoformat(),
            "in_reply_to_user": "pussiberad" if i % 3 == 0 else None,
            "metrics": {"mentions": ["pussiberad", "kemhan_ri"], "hashtags": ["NKRIHargaMati"]}
        })
    buzzer_cluster_info = {
        "max_semantic_similarity": 0.94, # Sangat tinggi, cocok dengan narasi copypasta
        "cluster_size": 18
    }

    # Arketipe C: Pengguna Organik Biasa (Human)
    human_profile = {
        "username": "ahmad_firmansyah",
        "followers_count": 480,
        "following_count": 410,
        "is_verified": False,
        "bio": "Software engineer pemula, suka kopi, kucing dan lari pagi.",
        "profile_metadata": {"default_profile_image": False}
    }
    human_activities = []
    human_texts = [
        "Pagi ini cuaca Jakarta cerah banget, enak buat jogging keliling GBK.",
        "Ngopi dulu sebelum lanjut debugging FastAPI dan async session SQLAlchemy.",
        "Kucing tetangga mampir lagi ke teras rumah, minta makan whiskas.",
        "Akhirnya selesai juga implementasi arsitektur vector store di laptop.",
        "Ada rekomendasi buku sistem terdistribusi yang bagus gak teman-teman?"
    ]
    for i, txt in enumerate(human_texts):
        # Diposting siang hari (jam kerja santai)
        post_time = now - timedelta(days=i, hours=2 + (i % 3))
        human_activities.append({
            "content": txt,
            "activity_type": "tweet",
            "posted_at": post_time.isoformat(),
            "metrics": {}
        })

    archetypes = [
        ("BOT", bot_profile, bot_activities, None),
        ("BUZZER", buzzer_profile, buzzer_activities, buzzer_cluster_info),
        ("HUMAN", human_profile, human_activities, None),
    ]

    for expected, prof, acts, cluster in archetypes:
        feats = extract_actor_features(prof, acts, cluster)
        pred_label, conf, probs, explanations = clf.predict(feats)
        
        print(f"\n--- Menguji Akun @{prof['username']} (Target: {expected}) ---")
        print(f"    Hasil Prediksi : {pred_label} (Confidence: {conf * 100:.2f}%)")
        print(f"    Distribusi     : {probs}")
        print("    Faktor Kunci Penentu (XAI):")
        for exp in explanations[:3]:
            print(f"      * {exp['feature']} ({exp['value']}): {exp['reason']}")

        assert pred_label == expected, f"Gagal: Harusnya {expected}, tapi terdeteksi {pred_label}"

    print("\n" + "=" * 70)
    print("SEMUA VALIDASI MACHINE LEARNING & BOT DETECTION SUKSES 100%!")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline_verification()

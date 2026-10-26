import os
import pytest
from datetime import datetime, timezone, timedelta
from app.services.features import extract_actor_features, FEATURE_NAMES
from app.services.classifier import AxiomBotClassifier, get_classifier
from app.services.dataset_generator import generate_synthetic_dataset, LABEL_MAP


def test_feature_names_and_count():
    """Memastikan jumlah dan nama 21 fitur sesuai standar Axiom."""
    assert len(FEATURE_NAMES) == 21
    assert "temporal_entropy" in FEATURE_NAMES
    assert "burstiness_score" in FEATURE_NAMES
    assert "follower_following_ratio" in FEATURE_NAMES
    assert "max_semantic_similarity" in FEATURE_NAMES
    assert "cluster_size" in FEATURE_NAMES


def test_feature_extraction_edge_cases():
    """Menguji ekstraksi fitur pada profil kosong tanpa aktivitas (anti ZeroDivisionError)."""
    empty_profile = {
        "username": "user123",
        "followers_count": 0,
        "following_count": 0,
        "is_verified": False,
        "bio": None
    }
    features = extract_actor_features(empty_profile, activities=[], cluster_info=None)

    assert len(features) == len(FEATURE_NAMES)
    for name in FEATURE_NAMES:
        assert name in features
        assert isinstance(features[name], (int, float))
        # Tidak boleh ada nilai NaN atau Inf
        assert not (features[name] != features[name]) # anti-NaN

    assert features["follower_following_ratio"] == 0.0
    assert features["username_digit_ratio"] == 0.4286 # 3 digits / 7 chars
    assert features["posts_per_day"] == 0.0
    assert features["temporal_entropy"] == 0.0
    assert features["unique_word_ratio"] == 1.0


def test_feature_extraction_rich_activity():
    """Menguji ekstraksi fitur dengan aktivitas kaya (retweet, reply, hashtags, mentions, link)."""
    now = datetime.now(timezone.utc)
    profile = {
        "username": "investigator_cyber",
        "followers_count": 1500,
        "following_count": 300,
        "is_verified": True,
        "bio": "Cyber Security Analyst @ TNI-AD PUSSIBERAD"
    }
    activities = [
        {
            "content": "Analisis ancaman kognitif selesai dilakukan https://tniad.mil.id #CyberSec #OSINT",
            "activity_type": "tweet",
            "posted_at": (now - timedelta(hours=4)).isoformat(),
            "metrics": {"urls": ["https://tniad.mil.id"], "hashtags": ["CyberSec", "OSINT"]}
        },
        {
            "content": "RT @kemhan_ri: Penguatan doktrin perang siber nasional.",
            "activity_type": "retweet",
            "posted_at": (now - timedelta(hours=3)).isoformat(),
            "metrics": {}
        },
        {
            "content": "@puspen_tni Siap, koordinasi intelijen lapangan terlaksana.",
            "activity_type": "reply",
            "in_reply_to_user": "puspen_tni",
            "posted_at": (now - timedelta(hours=1)).isoformat(),
            "metrics": {"mentions": ["puspen_tni"]}
        }
    ]
    cluster_info = {
        "max_semantic_similarity": 0.42,
        "cluster_size": 1.0
    }

    features = extract_actor_features(profile, activities, cluster_info)

    assert features["followers_count"] == 1500.0
    assert features["following_count"] == 300.0
    assert features["is_verified"] == 1.0
    assert pytest.approx(features["retweet_ratio"], 0.01) == 0.3333
    assert pytest.approx(features["reply_ratio"], 0.01) == 0.3333
    assert pytest.approx(features["url_ratio"], 0.01) == 0.3333
    assert features["max_semantic_similarity"] == 0.42
    assert features["cluster_size"] == 1.0


def test_synthetic_dataset_generation():
    """Menguji generator dataset sintetis Cresci / TwiBot-20."""
    df = generate_synthetic_dataset(n_per_class=20, seed=123)
    assert len(df) == 60 # 3 kelas * 20
    assert "label" in df.columns
    assert "class_name" in df.columns

    # Cek distribusi kelas seimbang
    counts = df["label"].value_counts().to_dict()
    assert counts[0] == 20 # HUMAN
    assert counts[1] == 20 # BOT
    assert counts[2] == 20 # BUZZER

    # Cek seluruh kolom fitur ada
    for feat in FEATURE_NAMES:
        assert feat in df.columns


def test_classifier_train_and_save(tmp_path):
    """Menguji proses training XGBoost dan penyimpanan model artifact."""
    save_file = str(tmp_path / "test_model.json")
    clf = AxiomBotClassifier(model_path=save_file)
    
    result = clf.train(save_path=save_file, test_size=0.25, seed=42)
    
    assert os.path.exists(save_file)
    assert result["accuracy"] >= 0.85
    assert result["macro_f1"] >= 0.80
    assert len(result["top_features"]) == 5
    assert clf.model is not None


def test_classifier_prediction_and_xai(tmp_path):
    """Menguji inferensi probabilitas dan transparansi XAI."""
    save_file = str(tmp_path / "test_model_pred.json")
    clf = AxiomBotClassifier(model_path=save_file)
    clf.train(save_path=save_file, test_size=0.2, seed=42)

    # Uji prediksi bot sintetis
    bot_feats = {
        "temporal_entropy": 0.95,
        "burstiness_score": 0.85,
        "active_hours_count": 23.0,
        "posts_per_day": 120.0,
        "follower_following_ratio": 0.002,
        "followers_count": 4.0,
        "following_count": 2200.0,
        "username_digit_ratio": 0.65,
        "has_default_avatar": 1.0,
        "is_verified": 0.0,
        "bio_length": 5.0,
        "retweet_ratio": 0.90,
        "reply_ratio": 0.02,
        "url_ratio": 0.85,
        "media_ratio": 0.05,
        "avg_text_length": 65.0,
        "unique_word_ratio": 0.25,
        "hashtag_density": 5.0,
        "mention_density": 0.1,
        "max_semantic_similarity": 0.80,
        "cluster_size": 25.0
    }

    pred_label, conf, probs, explanations = clf.predict(bot_feats)

    assert pred_label == "BOT"
    assert conf >= 0.70
    assert "BOT" in probs
    assert "HUMAN" in probs
    assert "BUZZER" in probs
    # Total probabilitas harus ~1.0
    assert pytest.approx(sum(probs.values()), 0.01) == 1.0
    # XAI explanation harus ada
    assert len(explanations) <= 5
    assert all("feature" in exp and "reason" in exp for exp in explanations)


def test_heuristic_fallback_when_model_unloaded():
    """Menguji fallback heuristik ketika file model tidak dimuat."""
    # Instance tanpa model
    clf = AxiomBotClassifier(model_path="non_existent_file.json")
    assert clf.model is None

    # Bot profile
    bot_feats = {
        "posts_per_day": 55.0,
        "username_digit_ratio": 0.45,
        "unique_word_ratio": 0.20,
        "max_semantic_similarity": 0.20
    }
    label, conf, probs, exp = clf.predict(bot_feats)
    assert label == "BOT"
    assert conf > 0.80

    # Buzzer profile
    buzzer_feats = {
        "posts_per_day": 12.0,
        "username_digit_ratio": 0.05,
        "max_semantic_similarity": 0.92,
        "cluster_size": 15.0
    }
    label, conf, probs, exp = clf.predict(buzzer_feats)
    assert label == "BUZZER"
    assert conf >= 0.85

    # Human profile
    human_feats = {
        "posts_per_day": 3.0,
        "username_digit_ratio": 0.0,
        "max_semantic_similarity": 0.20,
        "cluster_size": 1.0
    }
    label, conf, probs, exp = clf.predict(human_feats)
    assert label == "HUMAN"
    assert conf >= 0.85

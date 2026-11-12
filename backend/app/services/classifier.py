import os
import logging
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report

from app.services.features import FEATURE_NAMES
from app.services.dataset_generator import LABEL_MAP, LABEL_TO_INT, generate_synthetic_dataset, ensure_dataset_exists

logger = logging.getLogger("axiom.classifier")

_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_BACKEND_DIR = os.path.abspath(os.path.join(_CURRENT_DIR, "..", ".."))
_POSSIBLE_PATHS = [
    os.path.join("data", "models", "xgboost_tri_class.json"),
    os.path.join(_BACKEND_DIR, "data", "models", "xgboost_tri_class.json"),
    os.path.join("/app", "data", "models", "xgboost_tri_class.json"),
]
DEFAULT_MODEL_PATH = next((p for p in _POSSIBLE_PATHS if os.path.exists(p)), _POSSIBLE_PATHS[1])


class AxiomBotClassifier:
    """
    Klasifier 3-Kelas Axiom (HUMAN, BOT, BUZZER) berbasis XGBoost.
    Mendukung pelatihan terawasi (supervised), persistensi JSON, inferensi probabilitas,
    ekstraksi fitur penting (feature importance), dan fallback heuristik tangguh.
    """

    def __init__(self, model_path: str = DEFAULT_MODEL_PATH):
        self.model_path = model_path
        self.model: Optional[xgb.XGBClassifier] = None
        self.feature_names = FEATURE_NAMES
        self.feature_importances: Dict[str, float] = {}
        
        # Coba muat model jika sudah ada di disk
        if os.path.exists(self.model_path):
            self.load()

    def train(
        self,
        dataset_path: Optional[str] = None,
        save_path: Optional[str] = None,
        test_size: float = 0.2,
        seed: int = 42
    ) -> Dict[str, Any]:
        """
        Melatih model XGBoost pada dataset berlabel dan menyimpannya ke disk.
        """
        save_path = save_path or self.model_path
        os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)

        if dataset_path and os.path.exists(dataset_path):
            logger.info(f"Memuat dataset dari {dataset_path}...")
            df = pd.read_csv(dataset_path)
        else:
            logger.info("Dataset eksternal tidak ditemukan. Membuat benchmark synthetic dataset...")
            df = generate_synthetic_dataset(n_per_class=120, seed=seed)
            # Simpan untuk caching
            ensure_dataset_exists()

        X = df[self.feature_names].values
        y = df["label"].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=seed, stratify=y
        )

        logger.info(f"Melatih XGBClassifier pada {len(X_train)} sampel pelatihan...")
        clf = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            objective="multi:softprob",
            num_class=3,
            random_state=seed,
            eval_metric="mlogloss"
        )
        clf.fit(X_train, y_train)

        # Evaluasi
        y_pred = clf.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        macro_f1 = float(f1_score(y_test, y_pred, average="macro"))

        logger.info(f"Pelatihan selesai. Test Accuracy: {acc * 100:.2f}%, Macro F1: {macro_f1 * 100:.2f}%")

        # Hitung feature importance
        importances = clf.feature_importances_
        self.feature_importances = {
            name: round(float(imp), 4)
            for name, imp in sorted(
                zip(self.feature_names, importances),
                key=lambda item: item[1],
                reverse=True
            )
        }

        # Simpan model artifact
        clf.save_model(save_path)
        self.model = clf
        self.model_path = save_path
        logger.info(f"Model berhasil disimpan ke {save_path}")

        return {
            "accuracy": acc,
            "macro_f1": macro_f1,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "model_path": save_path,
            "top_features": list(self.feature_importances.items())[:5]
        }

    def load(self, model_path: Optional[str] = None) -> bool:
        """Memuat bobot model dari file JSON."""
        path = model_path or self.model_path
        if not os.path.exists(path):
            logger.warning(f"File model {path} tidak ditemukan.")
            return False

        try:
            clf = xgb.XGBClassifier()
            clf.load_model(path)
            self.model = clf
            self.model_path = path

            # Extract feature importances if available
            try:
                importances = clf.feature_importances_
                self.feature_importances = {
                    name: round(float(imp), 4)
                    for name, imp in sorted(
                        zip(self.feature_names, importances),
                        key=lambda item: item[1],
                        reverse=True
                    )
                }
            except Exception:
                pass

            logger.info(f"Model XGBoost berhasil dimuat dari {path}")
            return True
        except Exception as e:
            logger.error(f"Gagal memuat model dari {path}: {e}")
            return False

    def predict(
        self,
        features: Dict[str, float]
    ) -> Tuple[str, float, Dict[str, float], List[Dict[str, Any]]]:
        """
        Memprediksi kelas akun (HUMAN, BOT, BUZZER) dari fitur yang diekstrak.
        
        Args:
            features: Dictionary 21 fitur hasil ekstraksi `extract_actor_features`
            
        Returns:
            Tuple berisi:
            - predicted_class (str): "HUMAN", "BOT", atau "BUZZER"
            - confidence (float): Skor probabilitas kelas tertinggi (0.0 - 1.0)
            - class_probabilities (Dict[str, float]): Distribusi probabilitas tiap kelas
            - top_features (List[Dict[str, Any]]): 5 fitur paling berkontribusi untuk XAI
        """
        # Susun feature vector terurut
        vec = [float(features.get(f, 0.0)) for f in self.feature_names]
        X = np.array([vec], dtype=np.float32)

        if self.model is not None:
            probs = self.model.predict_proba(X)[0]
            pred_idx = int(np.argmax(probs))
            predicted_class = LABEL_MAP.get(pred_idx, "HUMAN")
            confidence = float(probs[pred_idx])
            class_probs = {
                LABEL_MAP[i]: round(float(p), 4)
                for i, p in enumerate(probs)
            }
        else:
            # Heuristik fallback jika model belum dimuat
            logger.warning("Model XGBoost belum dimuat. Menggunakan klasifikasi heuristik...")
            predicted_class, confidence, class_probs = self._heuristic_fallback(features)

        # Analisis kontributor fitur untuk XAI
        top_features = self._explain_prediction(features, predicted_class)

        return predicted_class, round(confidence, 4), class_probs, top_features

    def _heuristic_fallback(
        self,
        features: Dict[str, float]
    ) -> Tuple[str, float, Dict[str, float]]:
        """Fallback heuristik deterministik jika model ML belum di-train."""
        p_day = features.get("posts_per_day", 0.0)
        digits = features.get("username_digit_ratio", 0.0)
        entropy = features.get("temporal_entropy", 0.5)
        burst = features.get("burstiness_score", 0.0)
        sim = features.get("max_semantic_similarity", 0.0)
        retweet_ratio = features.get("retweet_ratio", 0.0)
        lexical = features.get("unique_word_ratio", 0.5)

        # Bot indicators
        if (p_day > 30.0 and digits > 0.3) or (entropy < 0.35 and burst < -0.4) or (lexical < 0.3 and p_day > 20):
            return "BOT", 0.88, {"BOT": 0.88, "BUZZER": 0.08, "HUMAN": 0.04}

        # Buzzer indicators
        if sim >= 0.85 or (retweet_ratio > 0.6 and sim > 0.70):
            return "BUZZER", 0.85, {"BUZZER": 0.85, "BOT": 0.10, "HUMAN": 0.05}

        # Default Human
        return "HUMAN", 0.90, {"HUMAN": 0.90, "BUZZER": 0.06, "BOT": 0.04}

    def _explain_prediction(
        self,
        features: Dict[str, float],
        predicted_class: str
    ) -> List[Dict[str, Any]]:
        """Menyusun daftar fitur yang paling relevan untuk laporan forensik intelejen."""
        scored_features = []
        for name in self.feature_names:
            val = features.get(name, 0.0)
            importance = self.feature_importances.get(name, 0.05)
            
            # Berikan bobot relevansi sesuai kelas yang terdeteksi
            relevance = importance
            reason = "Nilai dalam batas wajar"
            
            if predicted_class == "BOT":
                if name == "posts_per_day" and val > 25:
                    relevance *= 3.0
                    reason = f"Frekuensi posting ekstrem ({val:.1f} posts/hari)"
                elif name == "username_digit_ratio" and val > 0.3:
                    relevance *= 2.5
                    reason = f"Rasio angka username tinggi ({val * 100:.1f}%), pola bot auto-generated"
                elif name == "burstiness_score" and (val > 0.6 or val < -0.5):
                    relevance *= 2.5
                    reason = f"Anomali interval posting (Burstiness: {val:.2f})"
                elif name == "temporal_entropy" and (val > 0.90 or val < 0.35):
                    relevance *= 2.0
                    reason = f"Aktivitas 24/7 tanpa jeda tidur alami (Entropi: {val:.2f})"
                elif name == "unique_word_ratio" and val < 0.35:
                    relevance *= 2.0
                    reason = f"Diversitas leksikal sangat rendah ({val * 100:.1f}%), teks repetitif"

            elif predicted_class == "BUZZER":
                if name == "max_semantic_similarity" and val >= 0.80:
                    relevance *= 3.5
                    reason = f"Kemiripan semantik tinggi ({val * 100:.1f}%) dengan narasi terkoordinasi"
                elif name == "cluster_size" and val > 3:
                    relevance *= 2.5
                    reason = f"Terhubung dalam klaster narasi {int(val)} akun sejenis"
                elif name == "retweet_ratio" and val > 0.60:
                    relevance *= 2.0
                    reason = f"Proporsi amplifikasi/retweet tinggi ({val * 100:.1f}%)"
                elif name == "mention_density" and val > 2.0:
                    relevance *= 2.0
                    reason = f"Tingkat mention tinggi ({val:.1f} mention/post), indikasi penargetan opini"

            elif predicted_class == "HUMAN":
                if name == "unique_word_ratio" and val > 0.60:
                    relevance *= 2.0
                    reason = f"Kosakata organik dan bervariasi ({val * 100:.1f}%)"
                elif name == "temporal_entropy" and 0.65 <= val <= 0.88:
                    relevance *= 2.0
                    reason = f"Pola jam aktif alami mengikuti siklus sirkadian manusia"
                elif name == "follower_following_ratio" and 0.3 <= val <= 3.0:
                    relevance *= 1.5
                    reason = "Rasio pengikut seimbang"

            scored_features.append({
                "feature": name,
                "value": val,
                "importance_score": round(float(relevance), 4),
                "reason": reason
            })

        # Urutkan berdasarkan relevansi tertinggi
        scored_features.sort(key=lambda x: x["importance_score"], reverse=True)
        return scored_features[:5]


# Global singleton instance
_classifier_instance: Optional[AxiomBotClassifier] = None


def get_classifier(model_path: str = DEFAULT_MODEL_PATH) -> AxiomBotClassifier:
    """Singleton provider untuk AxiomBotClassifier."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = AxiomBotClassifier(model_path=model_path)
    return _classifier_instance

import logging
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import settings

logger = logging.getLogger("axiom.embedder")

_embedding_service_instance: Optional["EmbeddingService"] = None


class EmbeddingService:
    """
    Layanan embedding teks lokal berbasis sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2).
    Zero-Cost, 100% lokal, dan berjalan pada CPU tanpa membutuhkan koneksi internet
    setelah model ter-cache.
    """

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL_NAME
        logger.info(f"Memuat model embedding lokal: {self.model_name}...")
        try:
            self.model = SentenceTransformer(self.model_name, local_files_only=True)
        except Exception:
            self.model = SentenceTransformer(self.model_name)
        logger.info(f"Model embedding {self.model_name} berhasil dimuat.")

    def embed_text(self, text: str) -> List[float]:
        """
        Menghasilkan representasi vektor float 384 dimensi dari sebuah teks string.
        """
        if not text or not text.strip():
            # Kembalikan vektor nol untuk teks kosong
            return [0.0] * 384
        embedding = self.model.encode(text.strip(), convert_to_numpy=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        Menghasilkan representasi vektor untuk sekumpulan teks (batch) secara efisien.
        """
        if not texts:
            return []
        
        # Bersihkan teks kosong
        clean_texts = [t.strip() if t and t.strip() else " " for t in texts]
        embeddings = self.model.encode(
            clean_texts,
            batch_size=batch_size,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        return embeddings.tolist()

    @staticmethod
    def compute_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """
        Menghitung Cosine Similarity antara dua vektor:
        Cosine Sim = (A . B) / (||A|| * ||B||)
        Output berkisar antara -1.0 hingga 1.0 (biasanya 0.0 - 1.0 untuk representasi teks).
        """
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)

        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        similarity = float(np.dot(a, b) / (norm_a * norm_b))
        return max(0.0, min(1.0, similarity))

    @staticmethod
    def compute_similarity_matrix(vectors: List[List[float]]) -> np.ndarray:
        """
        Menghitung matriks pairwise cosine similarity untuk N vektor (N x N).
        """
        if vectors is None or len(vectors) == 0:
            return np.empty((0, 0))

        mat = np.array(vectors, dtype=np.float32)
        norms = np.linalg.norm(mat, axis=1, keepdims=True)
        norms[norms == 0] = 1e-10
        normalized = mat / norms
        
        sim_matrix = np.dot(normalized, normalized.T)
        return np.clip(sim_matrix, 0.0, 1.0)


def get_embedding_service() -> EmbeddingService:
    """
    Singleton provider untuk EmbeddingService agar model tidak di-reload berulang kali.
    """
    global _embedding_service_instance
    if _embedding_service_instance is None:
        _embedding_service_instance = EmbeddingService()
    return _embedding_service_instance

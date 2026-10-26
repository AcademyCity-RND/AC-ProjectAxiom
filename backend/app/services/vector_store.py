import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.core.chroma import get_narratives_collection
from app.services.embedder import get_embedding_service, EmbeddingService
from app.core.config import settings

logger = logging.getLogger("axiom.vector_store")


class VectorStoreService:
    """
    Layanan manajemen vektor narasi pada ChromaDB untuk deteksi CIB & analisis semantik.
    Menghubungkan teks cuitan dengan embedding MiniLM dan indeks HNSW ChromaDB.
    """

    def __init__(
        self,
        collection=None,
        embedder: Optional[EmbeddingService] = None
    ):
        self.embedder = embedder or get_embedding_service()
        self._collection = collection

    @property
    def collection(self):
        if self._collection is None:
            self._collection = get_narratives_collection()
        return self._collection

    def upsert_narratives(self, items: List[Dict[str, Any]]) -> List[str]:
        """
        Menyimpan atau memperbarui sekumpulan narasi cuitan ke dalam ChromaDB.
        
        Setiap item dalam `items` diharapkan memiliki format:
        {
            "id": str,               # ID unik dokumen (misal: "act_101" atau "tw_9901")
            "text": str,             # Isi teks cuitan
            "metadata": {            # Metadata pendukung
                "actor_username": str,
                "case_id": int,
                "activity_type": str,
                "posted_at": str,    # ISO timestamp string
                "lang": str
            }
        }
        """
        if not items:
            return []

        # Filter item yang memiliki teks valid
        valid_items = [it for it in items if it.get("text", "").strip()]
        if not valid_items:
            return []

        ids = [str(it["id"]) for it in valid_items]
        texts = [it["text"].strip() for it in valid_items]
        
        # Format metadata (ChromaDB hanya menerima str, int, float, bool)
        metadatas = []
        for it in valid_items:
            meta = it.get("metadata", {}).copy()
            clean_meta = {}
            for k, v in meta.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_meta[k] = v
                elif isinstance(v, datetime):
                    clean_meta[k] = v.isoformat()
                elif v is not None:
                    clean_meta[k] = str(v)
            metadatas.append(clean_meta)

        # Hasilkan embedding vektor secara batch (MiniLM 384-dimensi)
        embeddings = self.embedder.embed_batch(texts)

        # Upsert ke ChromaDB
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )

        logger.info(f"Berhasil meng-upsert {len(ids)} dokumen narasi ke ChromaDB.")
        return ids

    def query_similar_narratives(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Mencari narasi serupa berdasarkan query teks semantik.
        Mengembalikan daftar cuitan serupa beserta skor kemiripannya (Cosine Similarity 0.0 - 1.0).
        """
        if not query_text or not query_text.strip():
            return []

        query_embedding = self.embedder.embed_text(query_text)
        
        query_kwargs = {
            "query_embeddings": [query_embedding],
            "n_results": n_results,
            "include": ["documents", "metadatas", "distances"]
        }
        if where:
            query_kwargs["where"] = where

        results = self.collection.query(**query_kwargs)

        output = []
        if results and results.get("ids") and results["ids"][0]:
            count = len(results["ids"][0])
            for i in range(count):
                doc_id = results["ids"][0][i]
                doc_text = results["documents"][0][i] if results.get("documents") else ""
                metadata = results["metadatas"][0][i] if results.get("metadatas") else {}
                
                # Jarak 'cosine' di ChromaDB bernilai 0.0 (identik) s/d 2.0 (berlawanan)
                # Similarity = 1.0 - distance
                distance = results["distances"][0][i] if results.get("distances") else 0.0
                similarity = max(0.0, min(1.0, 1.0 - distance))

                output.append({
                    "id": doc_id,
                    "text": doc_text,
                    "metadata": metadata,
                    "similarity_score": round(similarity, 4),
                    "distance": round(distance, 4)
                })

        return output

    def detect_semantic_clusters(
        self,
        case_id: int,
        threshold: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Mendeteksi koordinasi narasi semantik (Coordinated Inauthentic Behavior - CIB)
        di antara seluruh cuitan dalam satu kasus investigasi.
        
        Menerapkan formula PRD Bagian 5.2:
        Cosine Similarity > 0.85 antar cuitan dari aktor yang berbeda.
        """
        sim_threshold = threshold if threshold is not None else settings.CIB_SIMILARITY_THRESHOLD

        # Ambil seluruh dokumen untuk case_id yang ditentukan
        results = self.collection.get(
            where={"case_id": case_id},
            include=["documents", "metadatas", "embeddings"]
        )

        if not results or not results.get("ids") or len(results["ids"]) < 2:
            return []

        ids = results["ids"]
        documents = results["documents"]
        metadatas = results["metadatas"]
        embeddings = results["embeddings"]

        n = len(ids)
        # Hitung matriks kemiripan pairwise
        sim_matrix = self.embedder.compute_similarity_matrix(embeddings)

        detected_links = []
        # Bandingkan setiap pasang dokumen i dan j (i < j)
        for i in range(n):
            for j in range(i + 1, n):
                score = float(sim_matrix[i, j])
                
                if score >= sim_threshold:
                    meta_i = metadatas[i] or {}
                    meta_j = metadatas[j] or {}
                    actor_i = meta_i.get("actor_username", "unknown")
                    actor_j = meta_j.get("actor_username", "unknown")

                    # Hanya tandai jika berasal dari dua akun yang berbeda
                    if actor_i.lower() != actor_j.lower():
                        detected_links.append({
                            "case_id": case_id,
                            "source_actor": actor_i,
                            "target_actor": actor_j,
                            "similarity_score": round(score, 4),
                            "link_type": "semantic_copypasta",
                            "evidence_snippet": (
                                f"Kesamaan narasi {round(score * 100, 1)}%:\n"
                                f"Aktor A (@{actor_i}): \"{documents[i][:100]}...\"\n"
                                f"Aktor B (@{actor_j}): \"{documents[j][:100]}...\""
                            ),
                            "source_doc_id": ids[i],
                            "target_doc_id": ids[j]
                        })

        return detected_links

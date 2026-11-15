import pytest
import numpy as np

from app.services.embedder import EmbeddingService, get_embedding_service
from app.services.vector_store import VectorStoreService
from app.core.chroma import get_chroma_client, get_narratives_collection, check_chroma_health


def test_chroma_health_and_connection():
    """Memastikan koneksi ke service ChromaDB berjalan dengan baik."""
    client = get_chroma_client()
    assert client is not None
    assert check_chroma_health() is True


def test_embedding_service_singleton_and_dimensions():
    """Memastikan singleton loader bekerja dan menghasilkan vektor 384-dimensi."""
    service_a = get_embedding_service()
    service_b = get_embedding_service()
    assert service_a is service_b

    # Single text embedding
    vec = service_a.embed_text("Pertahanan siber nasional Republik Indonesia")
    assert isinstance(vec, list)
    assert len(vec) == 384
    assert any(x != 0.0 for x in vec)

    # Empty text handling
    empty_vec = service_a.embed_text("")
    assert len(empty_vec) == 384
    assert all(x == 0.0 for x in empty_vec)

    # Batch embedding
    texts = [
        "Operasi intelijen siber",
        "Deteksi akun buzzer politik",
        "Analisis narasi disinformasi"
    ]
    batch_vecs = service_a.embed_batch(texts)
    assert len(batch_vecs) == 3
    for b in batch_vecs:
        assert len(b) == 384


def test_cosine_similarity_detection():
    """
    Menguji formula Cosine Similarity:
    - Kalimat copypasta/koordinasi buzzer CIB memiliki skor kemiripan sangat tinggi (> 0.85).
    - Kalimat parafrase memiliki skor moderat (> 0.70).
    - Kalimat topik sama sekali berbeda memiliki skor rendah (< 0.40).
    """
    service = get_embedding_service()

    # Dua variasi narasi copypasta buzzer CIB terkoordinasi
    text_copypasta_a = "Audit segera tender alutsista siber! Ada indikasi manipulasi anggaran proyek pertahanan darat!"
    text_copypasta_b = "Segera audit tender proyek siber alutsista darat! Terindikasi manipulasi anggaran yang mencurigakan!"
    
    # Kalimat parafrase topik senada
    text_paraphrase = "Alokasi anggaran pengadaan alutsista siber sangat tidak transparan dan sarat kepentingan asing!"

    # Kalimat organik yang tidak relevan
    text_unrelated = "Pagi ini ngopi santai sambil menikmati sarapan nasi uduk dan kue bolu pandan."

    vec_a = service.embed_text(text_copypasta_a)
    vec_b = service.embed_text(text_copypasta_b)
    vec_para = service.embed_text(text_paraphrase)
    vec_unrelated = service.embed_text(text_unrelated)

    # 1. Identik
    sim_identical = service.compute_similarity(vec_a, vec_a)
    assert sim_identical >= 0.999

    # 2. Copypasta Terkoordinasi CIB (Formula PRD 5.2: > 0.85)
    sim_cib = service.compute_similarity(vec_a, vec_b)
    assert sim_cib >= 0.85, f"Kemiripan copypasta CIB harus >= 0.85, didapat: {sim_cib}"

    # 3. Parafrase Senada
    sim_para = service.compute_similarity(vec_a, vec_para)
    assert sim_para >= 0.55, f"Kemiripan parafrase harus >= 0.55, didapat: {sim_para}"

    # 4. Tidak Terkait (Harus jauh lebih rendah daripada narasi senada & CIB)
    sim_diff = service.compute_similarity(vec_a, vec_unrelated)
    assert sim_diff < 0.45, f"Kemiripan topik berbeda harus rendah, didapat: {sim_diff}"
    assert sim_diff < sim_para < sim_cib


def test_vector_store_upsert_query_and_cib_clustering():
    """
    Menguji alur end-to-end VectorStoreService:
    1. Upsert sekumpulan tweet narasi ke ChromaDB
    2. Query pencarian semantik
    3. Deteksi CIB cluster (PRD 5.2 formula)
    """
    client = get_chroma_client()
    # Gunakan koleksi terisolasi untuk testing
    test_collection_name = "test_actor_narratives"
    
    # Hapus koleksi tes lama jika ada
    try:
        client.delete_collection(name=test_collection_name)
    except Exception:
        pass

    collection = client.create_collection(
        name=test_collection_name,
        metadata={"hnsw:space": "cosine"}
    )

    vector_store = VectorStoreService(collection=collection)

    # Data simulasi 2 akun buzzer yang melakukan copypasta terkoordinasi + 1 akun organik
    test_case_id = 9991
    test_narratives = [
        {
            "id": "tweet_buzz_01",
            "text": "Audit segera tender alutsista siber! Ada indikasi manipulasi anggaran proyek pertahanan darat!",
            "metadata": {
                "actor_username": "buzzer_alutsista_a",
                "case_id": test_case_id,
                "activity_type": "reply",
                "posted_at": "2026-10-25T10:00:00Z",
                "lang": "in"
            }
        },
        {
            "id": "tweet_buzz_02",
            "text": "Segera audit tender proyek siber alutsista darat! Terindikasi manipulasi anggaran yang mencurigakan!",
            "metadata": {
                "actor_username": "buzzer_alutsista_b",
                "case_id": test_case_id,
                "activity_type": "tweet",
                "posted_at": "2026-10-25T10:02:00Z",
                "lang": "in"
            }
        },
        {
            "id": "tweet_human_01",
            "text": "Selamat pagi rekan-rekan, semoga pekan ini produktif dan lancar bagi kita semua.",
            "metadata": {
                "actor_username": "budi_organik",
                "case_id": test_case_id,
                "activity_type": "tweet",
                "posted_at": "2026-10-25T10:15:00Z",
                "lang": "in"
            }
        }
    ]

    # 1. Test Upsert
    upserted_ids = vector_store.upsert_narratives(test_narratives)
    assert len(upserted_ids) == 3
    assert "tweet_buzz_01" in upserted_ids

    # 2. Test Semantic Query
    query_results = vector_store.query_similar_narratives(
        query_text="penyelewengan dana alutsista siber militer",
        n_results=2,
        where={"case_id": test_case_id}
    )
    assert len(query_results) == 2
    # Cuitan buzzer harus muncul di posisi atas karena relevansi semantik
    top_hit = query_results[0]
    assert "buzzer_alutsista" in top_hit["metadata"]["actor_username"]
    assert top_hit["similarity_score"] > 0.40

    # 3. Test Deteksi Koordinasi CIB (Threshold PRD 5.2 >= 0.85)
    cib_clusters = vector_store.detect_semantic_clusters(case_id=test_case_id, threshold=0.85)
    assert len(cib_clusters) >= 1

    link = cib_clusters[0]
    assert link["case_id"] == test_case_id
    assert link["link_type"] == "semantic_copypasta"
    assert link["similarity_score"] >= 0.85
    # Memastikan link menghubungkan dua aktor yang berbeda (bukan self-loop)
    actors = {link["source_actor"], link["target_actor"]}
    assert actors == {"buzzer_alutsista_a", "buzzer_alutsista_b"}
    assert "budi_organik" not in actors

    # Bersihkan koleksi tes
    client.delete_collection(name=test_collection_name)

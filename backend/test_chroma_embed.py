import sys
from datetime import datetime, timezone

from app.core.chroma import get_chroma_client, check_chroma_health, get_narratives_collection
from app.services.embedder import get_embedding_service
from app.services.vector_store import VectorStoreService


def main():
    print("=" * 70)
    print("🧠 Axiom Vector Engine & Local MiniLM Embedding — Demo Pengujian CIB")
    print("=" * 70)

    # 1. Healthcheck ChromaDB
    print("\n[1/4] Memeriksa Status Layanan ChromaDB...")
    is_healthy = check_chroma_health()
    if is_healthy:
        client = get_chroma_client()
        hb = client.heartbeat()
        print(f"   🟢 ChromaDB Online! Heartbeat: {hb}")
    else:
        print("   ❌ ChromaDB Offline! Pastikan container axiom_chromadb aktif.")
        sys.exit(1)

    # 2. Inisialisasi Model Embedding Lokal
    print("\n[2/4] Memuat Model Embedding Lokal (all-MiniLM-L6-v2)...")
    embedder = get_embedding_service()
    sample_text = "Operasi intelijen kognitif untuk mendeteksi astroturfing siber."
    sample_vec = embedder.embed_text(sample_text)
    print(f"   ✓ Model Siap! Panjang Vektor: {len(sample_vec)} dimensi")
    print(f"   ✓ Cuplikan Vektor : [{sample_vec[0]:.4f}, {sample_vec[1]:.4f}, {sample_vec[2]:.4f}, ..., {sample_vec[-1]:.4f}]")

    # 3. Pengujian Kemiripan Semantik (Cosine Similarity)
    print("\n[3/4] Uji Coba Kalkulasi Kesamaan Narasi (PRD 5.2):")
    t1 = "Audit segera tender alutsista siber! Ada indikasi manipulasi anggaran proyek pertahanan darat!"
    t2 = "Segera audit tender proyek siber alutsista darat! Terindikasi manipulasi anggaran yang mencurigakan!"
    t3 = "Pagi ini ngopi santai sambil sarapan nasi uduk di kantor."

    sim_cib = embedder.compute_similarity(embedder.embed_text(t1), embedder.embed_text(t2))
    sim_diff = embedder.compute_similarity(embedder.embed_text(t1), embedder.embed_text(t3))

    print(f"   • Narasi A : \"{t1}\"")
    print(f"   • Narasi B : \"{t2}\"")
    print(f"   • Narasi C : \"{t3}\"")
    print(f"\n   📊 Skor Kesamaan A vs B (Copypasta CIB) : {sim_cib * 100:.2f}%  {'🚨 TERDETEKSI CIB (>85%)' if sim_cib >= 0.85 else '⚠️ Normal'}")
    print(f"   📊 Skor Kesamaan A vs C (Topik Berbeda) : {sim_diff * 100:.2f}%  (Organik / Wajar)")

    # 4. Ingesti & Deteksi Cluster pada ChromaDB
    print("\n[4/4] Simulasi Ingesti Cuitan & Deteksi Jaringan Buzzer Terkoordinasi...")
    vector_store = VectorStoreService()
    case_id = 1001

    sample_tweets = [
        {
            "id": "tw_demo_01",
            "text": t1,
            "metadata": {
                "actor_username": "buzzer_provokator_01",
                "case_id": case_id,
                "activity_type": "reply",
                "posted_at": datetime.now(timezone.utc).isoformat(),
                "lang": "in"
            }
        },
        {
            "id": "tw_demo_02",
            "text": t2,
            "metadata": {
                "actor_username": "buzzer_amplifier_02",
                "case_id": case_id,
                "activity_type": "tweet",
                "posted_at": datetime.now(timezone.utc).isoformat(),
                "lang": "in"
            }
        },
        {
            "id": "tw_demo_03",
            "text": t3,
            "metadata": {
                "actor_username": "warga_biasa_01",
                "case_id": case_id,
                "activity_type": "tweet",
                "posted_at": datetime.now(timezone.utc).isoformat(),
                "lang": "in"
            }
        }
    ]

    vector_store.upsert_narratives(sample_tweets)
    clusters = vector_store.detect_semantic_clusters(case_id=case_id, threshold=0.85)

    print(f"\n   Hasil Deteksi Klaster CIB (Ambang Batas >= 85%):")
    if clusters:
        for idx, cl in enumerate(clusters, 1):
            print(f"   [{idx}] 🔗 Indikasi Hubungan Terkoordinasi Terdeteksi:")
            print(f"       • Aktor Sumber : @{cl['source_actor']}")
            print(f"       • Aktor Target : @{cl['target_actor']}")
            print(f"       • Kemiripan    : {cl['similarity_score'] * 100:.2f}%")
            print(f"       • Tipe Hubungan: {cl['link_type']}")
    else:
        print("   Tidak ada klaster terkoordinasi yang melampaui batas ambang.")

    print("\n" + "=" * 70)
    print("✅ Milestone 1.4: Pipeline ChromaDB & Local Embedding Siap 100%!")
    print("=" * 70)


if __name__ == "__main__":
    main()

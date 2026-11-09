#!/usr/bin/env python3
"""
AXIOM Database & Vector Store Cleaner
=====================================
Membersihkan seluruh riwayat investigasi di PostgreSQL dan koleksi di ChromaDB
sehingga database kembali bersih (fresh start) untuk testing/demo baru.
"""

import sys
import os
from pathlib import Path

# Pastikan root backend ada di sys.path
sys.path.insert(0, "/app")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import logging
from sqlalchemy import text
from app.db.session import engine
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("clean_database")


def clean_postgres():
    logger.info("Membersihkan data di PostgreSQL...")
    with engine.begin() as conn:
        tables_to_clean = [
            "activity_logs",
            "actor_profiles",
            "detection_results",
            "cluster_links",
            "investigation_cases",
            "audit_logs",
            "watchlists"
        ]

        for table in tables_to_clean:
            try:
                conn.execute(text(f'TRUNCATE TABLE "{table}" CASCADE;'))
                logger.info(f"  [V] Berhasil mengosongkan tabel: {table}")
            except Exception as e:
                logger.warning(f"  [!] Gagal mengosongkan {table}: {e}")

        logger.info("\nStatus baris di database setelah pembersihan:")
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")).fetchall()
        for r in result:
            tname = r[0]
            if tname != "alembic_version":
                count = conn.execute(text(f'SELECT COUNT(*) FROM "{tname}";')).scalar()
                logger.info(f"  - {tname:<25}: {count} baris")


def clean_chromadb():
    logger.info("\nMembersihkan koleksi vektor di ChromaDB...")
    try:
        from app.core.chroma import get_chroma_client, get_narratives_collection
        client = get_chroma_client()
        col = get_narratives_collection()
        count = col.count()
        logger.info(f"  -> Total embeddings saat ini: {count}")
        if count > 0:
            client.delete_collection(settings.CHROMA_COLLECTION_NAME)
            client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"  [V] Koleksi '{settings.CHROMA_COLLECTION_NAME}' berhasil di-reset (0 embeddings).")
        else:
            logger.info(f"  [V] Koleksi '{settings.CHROMA_COLLECTION_NAME}' sudah kosong (0 embeddings).")
    except Exception as e:
        logger.warning(f"  [!] Pembersihan ChromaDB gagal: {e}")


def main():
    print("=" * 60)
    print("AXIOM DATABASE & VECTOR STORE PURGE TOOL")
    print("=" * 60)
    clean_postgres()
    clean_chromadb()
    print("=" * 60)
    print("PEMBERSIHAN SELESAI: Database dan ChromaDB siap untuk pengujian baru!")
    print("=" * 60)


if __name__ == "__main__":
    main()

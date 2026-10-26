import logging
from typing import Optional
import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings

# Suppress noisy PostHog telemetry warnings from chromadb
logging.getLogger("chromadb.telemetry.product.posthog").setLevel(logging.CRITICAL)

logger = logging.getLogger("axiom.chroma")

_chroma_client: Optional[chromadb.ClientAPI] = None


def get_chroma_client() -> chromadb.ClientAPI:
    """
    Singleton provider untuk HttpClient ChromaDB.
    Terkoneksi ke service ChromaDB internal atau port forwarding.
    """
    global _chroma_client
    if _chroma_client is None:
        try:
            logger.info(f"Menghubungkan ke ChromaDB di {settings.CHROMA_HOST}:{settings.CHROMA_PORT}...")
            _chroma_client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            # Verifikasi koneksi awal
            _chroma_client.heartbeat()
            logger.info("Koneksi ke ChromaDB berhasil terjalin.")
        except Exception as e:
            logger.error(f"Gagal menghubungkan ke ChromaDB ({settings.CHROMA_HOST}:{settings.CHROMA_PORT}): {e}")
            raise
    return _chroma_client


def get_narratives_collection(
    client: Optional[chromadb.ClientAPI] = None,
    collection_name: Optional[str] = None
) -> chromadb.Collection:
    """
    Mengambil atau menginisialisasi ChromaDB collection untuk narasi cuitan.
    Menggunakan ruang jarak 'cosine' untuk kalkulasi kesamaan semantik CIB (PRD 5.2).
    """
    c = client or get_chroma_client()
    col_name = collection_name or settings.CHROMA_COLLECTION_NAME
    
    return c.get_or_create_collection(
        name=col_name,
        metadata={"hnsw:space": "cosine"}
    )


def check_chroma_health() -> bool:
    """Health check endpoint helper untuk ChromaDB."""
    try:
        client = get_chroma_client()
        client.heartbeat()
        return True
    except Exception:
        return False

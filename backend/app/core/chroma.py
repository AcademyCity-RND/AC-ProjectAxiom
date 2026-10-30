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
    Mendukung fallback otomatis ke localhost:8001 (host dev) dan EphemeralClient (CI / in-memory).
    """
    global _chroma_client
    if _chroma_client is None:
        # 1. Coba host/port yang dikonfigurasi
        try:
            logger.info(f"Menghubungkan ke ChromaDB di {settings.CHROMA_HOST}:{settings.CHROMA_PORT}...")
            client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            client.heartbeat()
            _chroma_client = client
            logger.info("Koneksi ke ChromaDB berhasil terjalin.")
            return _chroma_client
        except Exception as e:
            logger.warning(f"Koneksi ke {settings.CHROMA_HOST}:{settings.CHROMA_PORT} gagal ({e}). Mencoba fallback...")

        # 2. Coba localhost:8001 jika berbeda (misal dijalankan di Windows host)
        if settings.CHROMA_HOST != "localhost" or settings.CHROMA_PORT != 8001:
            try:
                client = chromadb.HttpClient(
                    host="localhost",
                    port=8001,
                    settings=ChromaSettings(anonymized_telemetry=False)
                )
                client.heartbeat()
                _chroma_client = client
                logger.info("Koneksi ke ChromaDB host (localhost:8001) berhasil.")
                return _chroma_client
            except Exception:
                pass

        # 3. Fallback terakhir: In-Memory EphemeralClient (untuk mode terisolasi jika didukung)
        if hasattr(chromadb, "EphemeralClient"):
            logger.info("Menggunakan ChromaDB EphemeralClient (In-Memory) untuk mode terisolasi.")
            _chroma_client = chromadb.EphemeralClient(
                settings=ChromaSettings(anonymized_telemetry=False)
            )
        else:
            logger.warning("EphemeralClient tidak tersedia di chromadb-client; menggunakan HttpClient fallback.")
            _chroma_client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
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

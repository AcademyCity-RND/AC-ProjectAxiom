"""
Axiom Backend Services Package.
Menggunakan lazy-loading via PEP 562 (__getattr__) agar modul berat (ChromaDB,
SentenceTransformer, XGBoost, Scikit-Learn) tidak dimuat secara eager saat
sub-paket ringan (seperti scraper, audit, atau schemas) diimpor.
Menghemat RAM dan mencegah OOM pada host terbatas / VPS 2 GB.
"""
from typing import Any

_LAZY_MAP = {
    "EmbeddingService": ("app.services.embedder", "EmbeddingService"),
    "get_embedding_service": ("app.services.embedder", "get_embedding_service"),
    "VectorStoreService": ("app.services.vector_store", "VectorStoreService"),
    "extract_actor_features": ("app.services.features", "extract_actor_features"),
    "FEATURE_NAMES": ("app.services.features", "FEATURE_NAMES"),
    "AxiomBotClassifier": ("app.services.classifier", "AxiomBotClassifier"),
    "get_classifier": ("app.services.classifier", "get_classifier"),
    "generate_synthetic_dataset": ("app.services.dataset_generator", "generate_synthetic_dataset"),
    "ForensicDossier": ("app.services.llm_analyst", "ForensicDossier"),
    "LLMAnalystService": ("app.services.llm_analyst", "LLMAnalystService"),
    "get_llm_analyst_service": ("app.services.llm_analyst", "get_llm_analyst_service"),
    "extract_youtube_video_id": ("app.services.youtube_auditor", "extract_youtube_video_id"),
    "fetch_youtube_comments": ("app.services.youtube_auditor", "fetch_youtube_comments"),
    "detect_temporal_influx_anomaly": ("app.services.youtube_auditor", "detect_temporal_influx_anomaly"),
    "generate_mock_youtube_comments": ("app.services.youtube_auditor", "generate_mock_youtube_comments"),
    "audit_youtube_event": ("app.services.youtube_auditor", "audit_youtube_event"),
    "fetch_youtube_metadata": ("app.services.youtube_auditor", "fetch_youtube_metadata"),
    "fetch_channel_joined_date": ("app.services.youtube_auditor", "fetch_channel_joined_date"),
    "extract_instagram_shortcode": ("app.services.instagram_auditor", "extract_instagram_shortcode"),
    "fetch_instagram_comments": ("app.services.instagram_auditor", "fetch_instagram_comments"),
    "generate_mock_instagram_comments": ("app.services.instagram_auditor", "generate_mock_instagram_comments"),
    "audit_instagram_event": ("app.services.instagram_auditor", "audit_instagram_event"),
    "fetch_instagram_metadata": ("app.services.instagram_auditor", "fetch_instagram_metadata"),
    "extract_tweet_id": ("app.services.x_auditor", "extract_tweet_id"),
    "fetch_tweet_metadata": ("app.services.x_auditor", "fetch_tweet_metadata"),
    "fetch_x_tweet_replies": ("app.services.x_auditor", "fetch_x_tweet_replies"),
    "audit_x_tweet_event": ("app.services.x_auditor", "audit_x_tweet_event"),
    "run_event_investigation_pipeline": ("app.services.event_orchestrator", "run_event_investigation_pipeline"),
    "generate_circadian_heatmap": ("app.services.analytics", "generate_circadian_heatmap"),
    "calculate_posting_entropy": ("app.services.analytics", "calculate_posting_entropy"),
    "detect_narrative_drift": ("app.services.analytics", "detect_narrative_drift"),
    "compute_advanced_analytics": ("app.services.analytics", "compute_advanced_analytics"),
}

__all__ = list(_LAZY_MAP.keys())


def __getattr__(name: str) -> Any:
    if name in _LAZY_MAP:
        module_path, attr_name = _LAZY_MAP[name]
        import importlib
        mod = importlib.import_module(module_path)
        val = getattr(mod, attr_name)
        globals()[name] = val
        return val
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


def __dir__():
    return __all__

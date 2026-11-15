"""
Axiom Backend Services Package.
Arsitektur Modular:
- ml/           : Model XGBoost, Feature Extraction (21 fitur), Embedder, Vector Store (ChromaDB)
- llm/          : Groq LPU (Llama 3.3 70B) Intelligence Synthesis & Prompt Injection Defense
- auditors/     : Platform Auditors (YouTube, Instagram, X)
- orchestrators/: Pipeline Orchestration (Actor Investigation & Event Narrative Audit)
- analytics/    : Forensic Analytics (Circadian 24/7 Heatmap, Posting Entropy, Narrative Drift)
- reporting/    : Audit Logging & Forensic Dossier HTML/Printable Export
- scraper/      : Multi-engine Scraper Pool & Adapters (Twscrape, Instagram Microservice)

Menggunakan lazy-loading via PEP 562 (__getattr__) agar modul berat tidak dimuat secara eager,
menghemat RAM pada host / VPS 2 GB.
"""
from typing import Any

_LAZY_MAP = {
    # ML & Feature Engineering
    "EmbeddingService": ("app.services.ml.embedder", "EmbeddingService"),
    "get_embedding_service": ("app.services.ml.embedder", "get_embedding_service"),
    "VectorStoreService": ("app.services.ml.vector_store", "VectorStoreService"),
    "extract_actor_features": ("app.services.ml.features", "extract_actor_features"),
    "FEATURE_NAMES": ("app.services.ml.features", "FEATURE_NAMES"),
    "AxiomBotClassifier": ("app.services.ml.classifier", "AxiomBotClassifier"),
    "get_classifier": ("app.services.ml.classifier", "get_classifier"),
    "generate_synthetic_dataset": ("app.services.ml.dataset_generator", "generate_synthetic_dataset"),

    # LLM & Cognitive AI
    "ForensicDossier": ("app.services.llm.llm_analyst", "ForensicDossier"),
    "LLMAnalystService": ("app.services.llm.llm_analyst", "LLMAnalystService"),
    "get_llm_analyst_service": ("app.services.llm.llm_analyst", "get_llm_analyst_service"),

    # Auditors (YouTube, Instagram, X)
    "extract_youtube_video_id": ("app.services.auditors.youtube_auditor", "extract_youtube_video_id"),
    "fetch_youtube_comments": ("app.services.auditors.youtube_auditor", "fetch_youtube_comments"),
    "detect_temporal_influx_anomaly": ("app.services.auditors.youtube_auditor", "detect_temporal_influx_anomaly"),
    "generate_mock_youtube_comments": ("app.services.auditors.youtube_auditor", "generate_mock_youtube_comments"),
    "audit_youtube_event": ("app.services.auditors.youtube_auditor", "audit_youtube_event"),
    "fetch_youtube_metadata": ("app.services.auditors.youtube_auditor", "fetch_youtube_metadata"),
    "fetch_channel_joined_date": ("app.services.auditors.youtube_auditor", "fetch_channel_joined_date"),
    "parse_youtube_votes": ("app.services.auditors.youtube_auditor", "parse_youtube_votes"),
    "extract_instagram_shortcode": ("app.services.auditors.instagram_auditor", "extract_instagram_shortcode"),
    "fetch_instagram_comments": ("app.services.auditors.instagram_auditor", "fetch_instagram_comments"),
    "generate_mock_instagram_comments": ("app.services.auditors.instagram_auditor", "generate_mock_instagram_comments"),
    "audit_instagram_event": ("app.services.auditors.instagram_auditor", "audit_instagram_event"),
    "fetch_instagram_metadata": ("app.services.auditors.instagram_auditor", "fetch_instagram_metadata"),
    "extract_tweet_id": ("app.services.auditors.x_auditor", "extract_tweet_id"),
    "fetch_tweet_metadata": ("app.services.auditors.x_auditor", "fetch_tweet_metadata"),
    "fetch_x_tweet_replies": ("app.services.auditors.x_auditor", "fetch_x_tweet_replies"),
    "audit_x_tweet_event": ("app.services.auditors.x_auditor", "audit_x_tweet_event"),

    # Orchestrators
    "run_investigation_pipeline": ("app.services.orchestrators.investigation_orchestrator", "run_investigation_pipeline"),
    "run_event_investigation_pipeline": ("app.services.orchestrators.event_orchestrator", "run_event_investigation_pipeline"),
    "normalize_event_probabilities": ("app.services.orchestrators.event_orchestrator", "normalize_event_probabilities"),

    # Analytics
    "generate_circadian_heatmap": ("app.services.analytics.analytics", "generate_circadian_heatmap"),
    "calculate_posting_entropy": ("app.services.analytics.analytics", "calculate_posting_entropy"),
    "detect_narrative_drift": ("app.services.analytics.analytics", "detect_narrative_drift"),
    "compute_advanced_analytics": ("app.services.analytics.analytics", "compute_advanced_analytics"),

    # Reporting & Audit Logging
    "log_activity": ("app.services.reporting.audit_logger", "log_activity"),
    "build_case_dossier_data": ("app.services.reporting.report_exporter", "build_case_dossier_data"),
    "render_html_dossier": ("app.services.reporting.report_exporter", "render_html_dossier"),
    "generate_csv_ledger": ("app.services.reporting.report_exporter", "generate_csv_ledger"),
    "get_dual_tier_ledger": ("app.services.reporting.report_exporter", "get_dual_tier_ledger"),
    "generate_master_dataset_csv": ("app.services.reporting.report_exporter", "generate_master_dataset_csv"),
    "compute_cryptographic_fingerprint": ("app.services.reporting.report_exporter", "compute_cryptographic_fingerprint"),
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

"""Offline tests of the real guest function, isolated from app startup.

The endpoint module pulls in the whole ``app.services`` package (torch, xgboost,
chromadb, ...) through its package ``__init__``. The guest function itself only
needs a handful of collaborators, so these tests execute the real function body
(extracted with ``ast``) against stubbed modules.
"""
import ast
import asyncio
from datetime import datetime, timezone
import importlib.util
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import AsyncMock, MagicMock, patch
import urllib.parse
import uuid

from fastapi import HTTPException
from starlette import status

BACKEND = Path(__file__).parents[1]
SOURCE = BACKEND / 'app/api/v1/endpoints/investigate.py'


LIVE_AUDIT = {
    "target_url": "https://x.com/author/status/123456789",
    "harvest_summary": {
        "target_quota": 100,
        "total_comments_extracted": 2,
        "unique_commenters_count": 2,
        "spammer_ratio": 0.0,
        "extraction_status": "live_complete",
        "data_source": "live",
    },
    "host_metadata": {
        "content_url": "https://x.com/author/status/123456789",
        "title_or_caption": "contoh cuitan",
        "creator": {
            "username_or_channel": "@author",
            "display_name": "Author",
            "subscribers_or_followers": 10,
            "following_count": 5,
            "account_created_at": "2020-05-01T00:00:00Z",
            "avatar_url": "",
        },
        "engagement": {
            "views_count": 1,
            "likes_count": 1,
            "retweets_count": 0,
            "total_comments_on_platform": 2,
        },
    },
    "comments": [
        {"author_username": "alice", "text": "kebijakan ini harus ditinjau ulang segera", "published_at": "2026-01-02T10:00:00Z", "likes": 1},
        {"author_username": "bob", "text": "saya setuju dengan pernyataan tersebut", "published_at": "2026-01-02T10:01:00Z", "likes": 0},
    ],
    "cib_clusters": [],
    "top_attackers": [],
}


def _load_event_evidence() -> ModuleType:
    """Muat modul kebijakan bukti yang sebenarnya tanpa memicu app.services.__init__."""
    spec = importlib.util.spec_from_file_location(
        'app.services.event_evidence', BACKEND / 'app/services/event_evidence.py'
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class GuestXTests(unittest.TestCase):
    def setUp(self):
        self.build(audit_return=LIVE_AUDIT)

    def build(self, audit_return=None, audit_side_effect=None):
        tree = ast.parse(SOURCE.read_text(encoding='utf-8'))
        functions = [
            node for node in tree.body
            if isinstance(node, ast.AsyncFunctionDef) and node.name == 'guest_analyze'
        ]
        for node in functions:
            node.decorator_list = []

        self.scraper = MagicMock()
        self.scraper.get_user_profile = AsyncMock(return_value={'username': 'author'})
        self.scraper.get_user_tweets = AsyncMock(return_value=[])
        self.get_classifier = MagicMock()
        self.get_classifier.return_value.predict.return_value = ('HUMAN', 0.9, {}, [])
        self.extract_features = MagicMock(return_value={})
        self.log_activity = MagicMock()
        self.audit_call = AsyncMock(side_effect=audit_side_effect, return_value=audit_return)

        services = ModuleType('app.services')
        services.__path__ = []  # paket tiruan; submodules disuntik lewat sys.modules

        scraper_module = ModuleType('app.services.scraper')
        scraper_module.__path__ = []
        x_scraper = ModuleType('app.services.scraper.x_scraper')
        x_scraper.XScraperService = MagicMock(return_value=self.scraper)
        exceptions = ModuleType('app.services.scraper.exceptions')
        exceptions.TargetNotFoundException = type('TargetNotFoundException', (Exception,), {})
        exceptions.PrivateAccountException = type('PrivateAccountException', (Exception,), {})

        features = ModuleType('app.services.features')
        features.extract_actor_features = self.extract_features
        features.FEATURE_NAMES = []

        classifier = ModuleType('app.services.classifier')
        classifier.AxiomBotClassifier = MagicMock()
        classifier.get_classifier = self.get_classifier

        audit_logger = ModuleType('app.services.audit_logger')
        audit_logger.log_activity = self.log_activity

        auditor = ModuleType('app.services.x_auditor')
        auditor.audit_x_tweet_event = self.audit_call
        auditor.extract_tweet_id = MagicMock()
        auditor.fetch_tweet_metadata = AsyncMock(return_value={})
        auditor.fetch_x_tweet_replies = AsyncMock(return_value=[])

        self.modules = {
            'app.services': services,
            'app.services.scraper': scraper_module,
            'app.services.scraper.x_scraper': x_scraper,
            'app.services.scraper.exceptions': exceptions,
            'app.services.features': features,
            'app.services.classifier': classifier,
            'app.services.audit_logger': audit_logger,
            'app.services.x_auditor': auditor,
            'app.services.event_evidence': _load_event_evidence(),
        }

        self.db = MagicMock()
        (
            self.db.query.return_value.join.return_value.join.return_value
            .filter.return_value.filter.return_value.order_by.return_value
            .first.return_value
        ) = None

        self.ns = dict(
            HTTPException=HTTPException,
            status=status,
            uuid=uuid,
            datetime=datetime,
            timezone=timezone,
            logger=MagicMock(),
            guest_rate_limiter=MagicMock(),
            wrap_proxy_image=lambda url: url,
            InvestigationCase=MagicMock(),
            ActorProfile=MagicMock(),
            DetectionResult=MagicMock(),
            Depends=lambda fn: None,
            get_db=lambda: None,
            urllib=urllib,
        )
        code = compile(
            'from __future__ import annotations\n'
            + ast.unparse(ast.Module(body=functions, type_ignores=[])),
            str(SOURCE),
            'exec',
        )
        exec(code, self.ns)

    def invoke(self, target, mode='tweet_url', platform='x'):
        with patch.dict(sys.modules, self.modules):
            return asyncio.run(self.ns['guest_analyze'](
                SimpleNamespace(target=target, mode=mode, platform=platform, sample_count=50),
                SimpleNamespace(client=SimpleNamespace(host='127.0.0.1')),
                self.db,
            ))

    def test_unavailable_live_data_fails_closed_without_author_fallback(self):
        unavailable = {
            **LIVE_AUDIT,
            "harvest_summary": {
                **LIVE_AUDIT["harvest_summary"],
                "extraction_status": "unavailable",
                "total_comments_extracted": 0,
            },
        }
        self.build(audit_return=unavailable)
        with self.assertRaises(HTTPException) as raised:
            self.invoke('https://x.com/author/status/123456789')
        self.assertEqual(raised.exception.status_code, 503)
        self.scraper.get_user_profile.assert_not_called()
        self.scraper.get_user_tweets.assert_not_called()
        # Mode tamu tidak boleh jatuh ke analisis akun penulis.
        self.get_classifier.assert_not_called()
        self.assertIn('balasan', raised.exception.detail.lower())

    def test_tweet_url_disables_synthetic_fallback(self):
        self.audit_call.side_effect = None
        self.audit_call.return_value = LIVE_AUDIT
        self.invoke('https://x.com/author/status/123456789')
        self.audit_call.assert_awaited_once()
        kwargs = self.audit_call.await_args.kwargs
        self.assertFalse(kwargs.get('allow_fallback', True))
        self.assertEqual(kwargs.get('max_comments'), 100)
        self.scraper.get_user_profile.assert_not_called()
        self.scraper.get_user_tweets.assert_not_called()

    def test_tweet_url_returns_conversation_evidence_not_author_profile(self):
        self.audit_call.side_effect = None
        self.audit_call.return_value = LIVE_AUDIT
        result = self.invoke('https://x.com/author/status/123456789')
        self.assertEqual(result['mode'], 'tweet_url')
        self.assertIn(result['classification'], {'HUMAN', 'ORGANIC', 'SUSPICIOUS', 'BOT', 'BUZZER'})
        self.assertEqual(result['sample_posts_count'], 2)
        self.assertIn('tweet_metadata', result)
        self.scraper.get_user_profile.assert_not_called()

    def test_invalid_tweet_url_is_rejected_before_scraping(self):
        with self.assertRaises(HTTPException) as raised:
            self.invoke('https://x.com/not-a-status-url')
        self.assertEqual(raised.exception.status_code, 400)
        self.audit_call.assert_not_awaited()

    def test_auditor_failure_is_reported_as_service_unavailable(self):
        self.audit_call.side_effect = RuntimeError("network down")
        with self.assertRaises(HTTPException) as raised:
            self.invoke('https://x.com/author/status/123456789')
        self.assertEqual(raised.exception.status_code, 503)
        self.scraper.get_user_profile.assert_not_called()


if __name__ == '__main__':
    unittest.main()

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

from app.services.scraper.exceptions import (
    TargetNotFoundException,
    PrivateAccountException,
    RateLimitExhaustedException,
)
from app.services.scraper.mock_data import get_mock_data
from app.services.scraper.twscrape_adapter import TwscrapeService, parse_datetime
from app.services.scraper.x_scraper import XScraperService


def test_mock_data_archetypes():
    """Memastikan data mock menghasilkan struktur arketipe yang sesuai."""
    # 1. Buzzer Archetype
    buzzer = get_mock_data("infiltrator_01")
    assert buzzer["profile"]["username"] == "infiltrator_01"
    assert buzzer["profile"]["platform"] == "x"
    assert buzzer["profile"]["followers_count"] < buzzer["profile"]["following_count"]
    assert any(t["activity_type"] == "reply" for t in buzzer["tweets"])

    # 2. Bot Archetype
    bot = get_mock_data("bot_amplifier_02")
    assert "bot" in bot["profile"]["username"]
    assert len(bot["tweets"]) > 5

    # 3. Organic Archetype
    organic = get_mock_data("budi_santoso_dev")
    assert organic["profile"]["username"] == "budi_santoso_dev"

    # 4. Unknown Username Dynamic Fallback
    unknown = get_mock_data("random_target_user")
    assert unknown["profile"]["username"] == "random_target_user"
    assert unknown["profile"]["platform"] == "x"
    assert len(unknown["tweets"]) > 0


def test_twscrape_service_initialization():
    """Memastikan inisialisasi API twscrape dengan parameter keamanan 1 akun."""
    service = TwscrapeService(db_path="./tmp/test_x_accounts.db")
    assert service.api is not None
    assert service.api.pool._wait_timeout == 60
    assert service.api.pool._wait_interval == 5
    assert service.api.pool._raise_when_no_account is False


@pytest.mark.asyncio
async def test_twscrape_offline_mode():
    """Uji coba penarikan profil, cuitan, dan balasan pada mode offline/mock."""
    service = TwscrapeService(db_path="./tmp/empty_accounts.db")
    service.has_active_account = AsyncMock(return_value=False)
    scraper = XScraperService(backend_service=service)

    # 1. Profil
    profile = await scraper.get_user_profile("infiltrator_01")
    assert profile["username"] == "infiltrator_01"
    assert profile["platform"] == "x"
    assert "followers_count" in profile

    # 2. Tweets
    tweets = await scraper.get_user_tweets("infiltrator_01", count=10)
    assert len(tweets) > 0
    assert "content" in tweets[0]
    assert "posted_at" in tweets[0]

    # 3. Replies
    replies = await scraper.get_user_replies("infiltrator_01", count=5)
    for reply in replies:
        assert reply["activity_type"] == "reply"


@pytest.mark.asyncio
async def test_twscrape_mocked_live_flow():
    """Uji coba pemetaan data riil twscrape dengan simulasi objek twscrape."""
    service = TwscrapeService(db_path="./tmp/mocked_accounts.db")
    
    # Paksa has_active_account menjadi True untuk menguji alur twscrape
    service.has_active_account = AsyncMock(return_value=True)
    
    # 1. Kasus Target Tidak Ditemukan
    service.api.user_by_login = AsyncMock(return_value=None)
    with pytest.raises(TargetNotFoundException):
        await service.get_user_profile("ghost_account")

    # 2. Kasus Akun Privat / Digembok
    mock_protected_user = MagicMock()
    mock_protected_user.protected = True
    service.api.user_by_login = AsyncMock(return_value=mock_protected_user)
    with pytest.raises(PrivateAccountException):
        await service.get_user_profile("locked_account")

    # 3. Kasus Normal Akun Publik
    mock_user = MagicMock()
    mock_user.id = 12345678
    mock_user.username = "target_real"
    mock_user.displayname = "Target Realistis"
    mock_user.rawDescription = "Bio investigasi publik"
    mock_user.followersCount = 450
    mock_user.friendsCount = 180
    mock_user.verified = True
    mock_user.blue = False
    mock_user.created = "2024-05-10 12:00:00+00:00"
    mock_user.statusesCount = 890
    mock_user.mediaCount = 15
    mock_user.profileImageUrl = "https://pbs.twimg.com/avatar.jpg"
    mock_user.location = "Jakarta"
    mock_user.protected = False

    service.api.user_by_login = AsyncMock(return_value=mock_user)
    profile = await service.get_user_profile("target_real")
    
    assert profile["username"] == "target_real"
    assert profile["display_name"] == "Target Realistis"
    assert profile["followers_count"] == 450
    assert profile["is_verified"] is True
    assert profile["platform"] == "x"


def test_parse_datetime():
    """Memastikan konversi string tanggal twscrape menghasilkan timezone-aware datetime."""
    val = "2026-10-25 14:30:00+00:00"
    dt = parse_datetime(val)
    assert dt.year == 2026
    assert dt.tzinfo is not None

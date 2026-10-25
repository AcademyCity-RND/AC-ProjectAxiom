import asyncio
import sys
from app.services.scraper.x_scraper import XScraperService
from app.services.scraper.twscrape_adapter import TwscrapeService


async def test_scrape(target_username: str):
    print("=" * 65)
    print(f"🛡️  Axiom X (Twitter) Scraper Engine — Uji Coba Target: @{target_username}")
    print("=" * 65)

    service = TwscrapeService()
    has_account = await service.has_active_account()

    if has_account:
        print("🟢 STATUS ENGINE: Live Twscrape (Akun Burner Aktif Terdeteksi)")
    else:
        print("🟡 STATUS ENGINE: Offline Demo Mode (Mock Fallback Aktif)")
        print("   Tips: Untuk scraping live, tambahkan akun via cookies di twscrape.")
    print("-" * 65)

    scraper = XScraperService(backend_service=service)

    # 1. Ekstraksi Profil Target
    print("\n[1/3] Menarik Metadata Profil Target...")
    try:
        profile = await scraper.get_user_profile(target_username)
        print(f"   👤 Username       : @{profile.get('username')}")
        print(f"   📛 Nama Lengkap   : {profile.get('display_name')}")
        print(f"   📝 Bio            : {profile.get('bio')}")
        print(f"   👥 Pengikut       : {profile.get('followers_count'):,} followers")
        print(f"   👣 Mengikuti      : {profile.get('following_count'):,} following")
        print(f"   ✓  Terverifikasi  : {'Ya (Centang Biru)' if profile.get('is_verified') else 'Tidak'}")
        print(f"   📅 Akun Dibuat    : {profile.get('account_created_at')}")
    except Exception as e:
        print(f"   ❌ Gagal mengambil profil: {e}")
        return

    # 2. Ekstraksi Cuitan Terbaru
    print("\n[2/3] Menarik Riwayat Cuitan Terbaru...")
    try:
        tweets = await scraper.get_user_tweets(target_username, count=5)
        print(f"   Berhasil menarik {len(tweets)} cuitan:")
        for idx, tw in enumerate(tweets, 1):
            posted = tw.get("posted_at")
            content = tw.get("content", "").replace("\n", " ")
            likes = tw.get("metrics", {}).get("likes", 0)
            rts = tw.get("metrics", {}).get("retweets", 0)
            print(f"   {idx}. [{posted}] {content[:80]}... (❤️ {likes} | 🔁 {rts})")
    except Exception as e:
        print(f"   ❌ Gagal mengambil cuitan: {e}")

    # 3. Ekstraksi Balasan (Target Bias Audit)
    print("\n[3/3] Menarik Cuitan Balasan (Target Bias Audit)...")
    try:
        replies = await scraper.get_user_replies(target_username, count=5)
        print(f"   Berhasil mendeteksi {len(replies)} interaksi balasan:")
        for idx, rep in enumerate(replies, 1):
            target_acc = rep.get("in_reply_to_user") or "Unknown"
            content = rep.get("content", "").replace("\n", " ")
            print(f"   {idx}. Membalas @{target_acc}: \"{content[:70]}...\"")
    except Exception as e:
        print(f"   ❌ Gagal mengambil balasan: {e}")

    print("\n" + "=" * 65)
    print("✅ Pengujian Selesai!")
    print("=" * 65)


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "infiltrator_01"
    asyncio.run(test_scrape(target))

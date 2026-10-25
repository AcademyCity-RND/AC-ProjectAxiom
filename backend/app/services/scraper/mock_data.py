from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List


# Dataset Arketipe Buzzer (Pola jam kerja, target bias fokus menyerang figur/instansi tertentu, narasi berulang)
BUZZER_SAMPLE = {
    "profile": {
        "username": "infiltrator_01",
        "platform": "x",
        "display_name": "Suara Kebenaran Rakyat",
        "bio": "Menyuarakan transparansi pertahanan dan kedaulatan bangsa. Jangan mudah dibodohi!",
        "followers_count": 84,
        "following_count": 1420,
        "is_verified": False,
        "account_created_at": datetime(2026, 8, 14, 8, 30, tzinfo=timezone.utc),
        "profile_metadata": {
            "statuses_count": 2340,
            "media_count": 12,
            "favourites_count": 310,
            "profile_image_url": "https://pbs.twimg.com/profile_images/default_avatar.png"
        }
    },
    "tweets": [
        {
            "platform_post_id": "tw_buzzer_101",
            "activity_type": "reply",
            "content": "@Kemhan_RI Alokasi anggaran pengadaan alutsista siber sangat tidak transparan dan sarat kepentingan asing! Rakyat butuh audit independen segera!",
            "posted_at": datetime(2026, 10, 24, 9, 15, tzinfo=timezone.utc),
            "in_reply_to_user": "Kemhan_RI",
            "conversation_id": "conv_9901",
            "lang": "in",
            "hashtags": ["AuditSiber"],
            "mentions": ["Kemhan_RI"],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 12, "retweets": 45, "replies": 3, "views": 2100}
        },
        {
            "platform_post_id": "tw_buzzer_102",
            "activity_type": "reply",
            "content": "@TNI_AD Kebijakan siber pertahanan darat harus dievaluasi total. Kami melihat ada pemborosan anggaran yang ditutup-tutupi!",
            "posted_at": datetime(2026, 10, 24, 11, 40, tzinfo=timezone.utc),
            "in_reply_to_user": "TNI_AD",
            "conversation_id": "conv_9902",
            "lang": "in",
            "hashtags": [],
            "mentions": ["TNI_AD"],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 8, "retweets": 38, "replies": 2, "views": 1540}
        },
        {
            "platform_post_id": "tw_buzzer_103",
            "activity_type": "reply",
            "content": "@Kemhan_RI Audit segera proyek siber nasional! Mengapa vendor asing yang memenangkan tender strategis kedaulatan informasi?",
            "posted_at": datetime(2026, 10, 24, 14, 25, tzinfo=timezone.utc),
            "in_reply_to_user": "Kemhan_RI",
            "conversation_id": "conv_9903",
            "lang": "in",
            "hashtags": ["KedaulatanSiber"],
            "mentions": ["Kemhan_RI"],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 15, "retweets": 51, "replies": 5, "views": 3200}
        },
        {
            "platform_post_id": "tw_buzzer_104",
            "activity_type": "tweet",
            "content": "Jangan sampai pertahanan negara kita disusupi kepentingan tersembunyi. Mari kawal bersama kebijakan pertahanan siber nasional! #AuditSiber",
            "posted_at": datetime(2026, 10, 23, 10, 5, tzinfo=timezone.utc),
            "in_reply_to_user": None,
            "conversation_id": None,
            "lang": "in",
            "hashtags": ["AuditSiber"],
            "mentions": [],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 20, "retweets": 80, "replies": 8, "views": 4500}
        },
        {
            "platform_post_id": "tw_buzzer_105",
            "activity_type": "reply",
            "content": "@TNI_AD Apakah ada jaminan keamanan data prajurit kita tidak bocor ke pihak luar? Klarifikasi segera publik berhak tahu!",
            "posted_at": datetime(2026, 10, 23, 16, 50, tzinfo=timezone.utc),
            "in_reply_to_user": "TNI_AD",
            "conversation_id": "conv_9904",
            "lang": "in",
            "hashtags": [],
            "mentions": ["TNI_AD"],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 11, "retweets": 34, "replies": 1, "views": 1800}
        }
    ]
}

# Dataset Arketipe Bot (Post interval konstan 24 jam nonstop, teks copypasta identik)
BOT_SAMPLE = {
    "profile": {
        "username": "bot_amplifier_02",
        "platform": "x",
        "display_name": "Info Terkini 24 Jam",
        "bio": "Bot agregator berita & update viral nusantara.",
        "followers_count": 12,
        "following_count": 2100,
        "is_verified": False,
        "account_created_at": datetime(2026, 9, 20, 3, 0, tzinfo=timezone.utc),
        "profile_metadata": {
            "statuses_count": 8900,
            "media_count": 0,
            "favourites_count": 10,
            "profile_image_url": "https://pbs.twimg.com/profile_images/default_avatar.png"
        }
    },
    "tweets": [
        {
            "platform_post_id": f"tw_bot_{i}",
            "activity_type": "tweet",
            "content": "Klik link berikut untuk membaca update berita selengkapnya mengenai isu siber hari ini: https://bit.ly/update-info-siber #BeritaTerkini",
            "posted_at": datetime(2026, 10, 25, (i * 3) % 24, 0, tzinfo=timezone.utc),
            "in_reply_to_user": None,
            "conversation_id": None,
            "lang": "in",
            "hashtags": ["BeritaTerkini"],
            "mentions": [],
            "urls": ["https://bit.ly/update-info-siber"],
            "has_media": False,
            "metrics": {"likes": 0, "retweets": 1, "replies": 0, "views": 42}
        }
        for i in range(1, 15)
    ]
}

# Dataset Arketipe Organik / Manusia Asli (Topik beragam, siklus sirkadian normal, interaksi sosial otentik)
ORGANIC_SAMPLE = {
    "profile": {
        "username": "budi_santoso_dev",
        "platform": "x",
        "display_name": "Budi Santoso",
        "bio": "Software Engineer & Kopi antusias. Suka baca buku dan sepedaan santai di akhir pekan. Jakarta.",
        "followers_count": 480,
        "following_count": 390,
        "is_verified": False,
        "account_created_at": datetime(2023, 2, 10, 10, 0, tzinfo=timezone.utc),
        "profile_metadata": {
            "statuses_count": 1540,
            "media_count": 140,
            "favourites_count": 2890,
            "profile_image_url": "https://pbs.twimg.com/profile_images/default_avatar.png"
        }
    },
    "tweets": [
        {
            "platform_post_id": "tw_human_01",
            "activity_type": "tweet",
            "content": "Pagi ini ngopi dulu sambil ngerjain project weekend. Cuaca Jakarta lumayan adem setelah hujan semalam.",
            "posted_at": datetime(2026, 10, 25, 7, 30, tzinfo=timezone.utc),
            "in_reply_to_user": None,
            "conversation_id": None,
            "lang": "in",
            "hashtags": [],
            "mentions": [],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 14, "retweets": 0, "replies": 2, "views": 850}
        },
        {
            "platform_post_id": "tw_human_02",
            "activity_type": "reply",
            "content": "@teman_coding Wah mantap mas, congrats ya untuk rilis versi terbarunya!",
            "posted_at": datetime(2026, 10, 24, 12, 10, tzinfo=timezone.utc),
            "in_reply_to_user": "teman_coding",
            "conversation_id": "conv_human_01",
            "lang": "in",
            "hashtags": [],
            "mentions": ["teman_coding"],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 3, "retweets": 0, "replies": 1, "views": 210}
        },
        {
            "platform_post_id": "tw_human_03",
            "activity_type": "tweet",
            "content": "Ada rekomendasi buku sistem operasi atau distributed computing yang bagus untuk dibaca santai?",
            "posted_at": datetime(2026, 10, 23, 19, 45, tzinfo=timezone.utc),
            "in_reply_to_user": None,
            "conversation_id": None,
            "lang": "in",
            "hashtags": [],
            "mentions": [],
            "urls": [],
            "has_media": False,
            "metrics": {"likes": 8, "retweets": 1, "replies": 6, "views": 620}
        }
    ]
}


def get_mock_data(username: str) -> Dict[str, Any]:
    """
    Mengambil data mock berdasarkan username target atau menghasilkan data representatif
    jika kredensial pool X tidak dikonfigurasi (Offline Demo Mode).
    """
    normalized = username.lower().strip().lstrip("@")
    
    if "bot" in normalized:
        sample = BOT_SAMPLE.copy()
    elif "buzzer" in normalized or "infiltrator" in normalized:
        sample = BUZZER_SAMPLE.copy()
    elif "human" in normalized or "budi" in normalized:
        sample = ORGANIC_SAMPLE.copy()
    else:
        # Menghasilkan dataset dinamis yang masuk akal untuk username lain
        sample = {
            "profile": {
                "username": normalized,
                "platform": "x",
                "display_name": f"User {normalized.capitalize()}",
                "bio": f"Akun publik @{normalized}. Membagikan pemikiran dan interaksi media sosial.",
                "followers_count": 150,
                "following_count": 220,
                "is_verified": False,
                "account_created_at": datetime(2025, 1, 15, tzinfo=timezone.utc),
                "profile_metadata": {"statuses_count": 350, "media_count": 20, "favourites_count": 400}
            },
            "tweets": [
                {
                    "platform_post_id": f"tw_mock_{i}",
                    "activity_type": "tweet" if i % 2 == 0 else "reply",
                    "content": f"Aktivitas postingan ke-{i} dari akun @{normalized} mengenai dinamika sosial dan teknologi.",
                    "posted_at": datetime.now(timezone.utc) - timedelta(hours=i * 5),
                    "in_reply_to_user": "institusi_publik" if i % 2 != 0 else None,
                    "conversation_id": f"conv_{i}" if i % 2 != 0 else None,
                    "lang": "in",
                    "hashtags": [],
                    "mentions": ["institusi_publik"] if i % 2 != 0 else [],
                    "urls": [],
                    "has_media": False,
                    "metrics": {"likes": i * 2, "retweets": i, "replies": 1, "views": i * 50}
                }
                for i in range(1, 10)
            ]
        }
        
    return sample

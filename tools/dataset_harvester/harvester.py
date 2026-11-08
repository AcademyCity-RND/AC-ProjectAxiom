#!/usr/bin/env python3
"""
AXIOM - Standalone Dataset Harvester (Temporary Research Tool)
==============================================================
Tujuan: Mengumpulkan dataset mentah aktual (post-2020) dari 6 skenario:
  1. X User (hingga 400 aktivitas terakhir per akun)
  2. X Tweet (ekstraksi seluruh balasan cuitan tanpa batas)
  3. IG Post (ekstraksi hingga 400 komentar dengan jeda bertingkat)
  4. IG Reels (ekstraksi hingga 400 komentar dengan jeda bertingkat)
  5. YT Shorts (ekstraksi seluruh komentar Shorts)
  6. YT Video (ekstraksi seluruh komentar Video Reguler)

Output: 60 file CSV mandiri berstandar RFC 4180
Fitur: Checkpointing & Auto-Resuming (jika terputus, tidak mengulang dari 0).
"""

import os
import sys
import csv
import json
import time
import random
import re
import argparse
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

CURRENT_DIR = Path(__file__).resolve().parent
APP_DIR = CURRENT_DIR.parent.parent

if Path("/app").exists() and (Path("/app") / "app").exists():
    BASE_DIR = Path("/app")
else:
    BASE_DIR = APP_DIR

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

OUTPUT_DIR = BASE_DIR / "data" / "raw_datasets"
TARGETS_FILE = CURRENT_DIR / "targets.json"

try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(BASE_DIR.parent / ".env", override=True)
except Exception:
    pass


def sanitize_filename(name: Any) -> str:
    """Membersihkan string agar aman dijadikan nama file."""
    clean = re.sub(r"[^\w\-_.]", "_", str(name or "").strip())
    return clean[:50]


def ensure_output_dirs():
    """Membuat folder output jika belum ada."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for sub in ["x_user", "x_tweet", "ig_post", "ig_reels", "yt_shorts", "yt_video"]:
        (OUTPUT_DIR / sub).mkdir(parents=True, exist_ok=True)


def load_targets() -> Dict[str, List[str]]:
    """Membaca daftar target dari targets.json."""
    if not TARGETS_FILE.exists():
        print(f"[!] File targets.json tidak ditemukan di {TARGETS_FILE}")
        return {}
    with open(TARGETS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_csv_dataset(filepath: Path, fieldnames: List[str], rows: List[Dict[str, Any]]):
    """Menyimpan list dict ke format CSV RFC 4180."""
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in rows:
            writer.writerow(r)


# ==============================================================================
# 1. HARVESTER: X USER (400 Aktivitas Terakhir)
# ==============================================================================
async def harvest_x_user(target: str, idx: int) -> bool:
    clean_uname = target.strip().lstrip("@")
    if not clean_uname:
        return False

    out_file = OUTPUT_DIR / "x_user" / f"x_user_{idx:02d}_{sanitize_filename(clean_uname)}.csv"
    if out_file.exists() and out_file.stat().st_size > 150:
        print(f"[RESUME] X User #{idx} (@{clean_uname}) sudah ada ({out_file.name}). Melewati...")
        return True

    print(f"\n[+] [1/6] Memulai harvesting X User #{idx}: @{clean_uname} (Target: hingga 400 aktivitas)...")
    try:
        from app.services.scraper.x_scraper import XScraperService  # type: ignore
        scraper = XScraperService()
        profile = await scraper.get_user_profile(clean_uname)
        tweets = await scraper.get_user_tweets(clean_uname, count=400)
        replies = await scraper.get_user_replies(clean_uname, count=100)

        all_items = tweets + replies
        print(f"  -> Berhasil menarik {len(all_items)} cuitan & balasan live dari @{clean_uname}")

        fieldnames = [
            "content_id", "created_at", "author_username", "author_display_name",
            "raw_text", "likes_count", "retweets_count", "replies_count", "is_reply", "target_context"
        ]

        rows = []
        for item in all_items:
            metrics = item.get("metrics") or {}
            rows.append({
                "content_id": item.get("platform_post_id") or item.get("id"),
                "created_at": item.get("posted_at") or item.get("created_at"),
                "author_username": f"@{profile.get('username', clean_uname)}",
                "author_display_name": profile.get("display_name", ""),
                "raw_text": str(item.get("content") or "").replace("\r\n", " ").replace("\n", " "),
                "likes_count": metrics.get("likes", 0),
                "retweets_count": metrics.get("retweets", 0),
                "replies_count": metrics.get("replies", 0),
                "is_reply": item.get("is_reply", False),
                "target_context": f"Profil @{clean_uname} | Followers: {profile.get('followers_count', 0)}"
            })

        write_csv_dataset(out_file, fieldnames, rows)
        print(f"  -> Disimpan ke: {out_file.name} ({len(rows)} baris)")
        return True
    except Exception as e:
        print(f"  [!] Gagal harvesting X User @{clean_uname}: {e}")
        return False


# ==============================================================================
# 2. HARVESTER: X TWEET (Seluruh Balasan Tanpa Batas)
# ==============================================================================
async def harvest_x_tweet(target_url: str, idx: int) -> bool:
    if not target_url.strip():
        return False

    from app.services.x_auditor import audit_x_tweet_event, extract_tweet_id  # type: ignore
    tid = str(extract_tweet_id(target_url) or f"tweet_{idx}")
    out_file = OUTPUT_DIR / "x_tweet" / f"x_tweet_{idx:02d}_{sanitize_filename(tid)}.csv"
    if out_file.exists() and out_file.stat().st_size > 150:
        print(f"[RESUME] X Tweet #{idx} ({tid}) sudah ada. Melewati...")
        return True

    print(f"\n[+] [2/6] Memulai harvesting balasan X Tweet #{idx}: {target_url} (Eksplorasi penuh)...")
    try:
        res = await audit_x_tweet_event(target_url, max_comments=2500)
        comments = res.get("comments", [])
        host_meta = res.get("host_metadata", {})
        print(f"  -> Berhasil menarik {len(comments)} balasan komentar untuk cuitan {tid}")

        fieldnames = [
            "comment_id", "created_at", "author_username", "author_display_name",
            "raw_text", "likes_count", "is_reply", "target_context"
        ]

        caption_snippet = host_meta.get("title_or_caption", "")[:80]
        rows = []
        for c in comments:
            rows.append({
                "comment_id": c.get("comment_id"),
                "created_at": c.get("created_at") or c.get("published_at"),
                "author_username": c.get("author_username") or c.get("username"),
                "author_display_name": c.get("author_display_name", ""),
                "raw_text": str(c.get("text") or "").replace("\r\n", " ").replace("\n", " "),
                "likes_count": c.get("likes", 0),
                "is_reply": True,
                "target_context": f"Tweet: {caption_snippet}"
            })

        write_csv_dataset(out_file, fieldnames, rows)
        print(f"  -> Disimpan ke: {out_file.name} ({len(rows)} baris)")
        return True
    except Exception as e:
        print(f"  [!] Gagal harvesting X Tweet {target_url}: {e}")
        return False


# ==============================================================================
# 3 & 4. HARVESTER: INSTAGRAM POST & REELS (Target Hingga 400 Komentar)
# ==============================================================================
def harvest_instagram(target_url: str, idx: int, mode_type: str = "ig_post") -> bool:
    if not target_url.strip():
        return False

    from app.services.instagram_auditor import (  # type: ignore
        extract_instagram_shortcode,
        fetch_instagram_metadata,
        fetch_instagram_comments
    )
    shortcode = extract_instagram_shortcode(target_url) or f"ig_{idx}"
    out_file = OUTPUT_DIR / mode_type / f"{mode_type}_{idx:02d}_{sanitize_filename(shortcode)}.csv"
    if out_file.exists() and out_file.stat().st_size > 150:
        print(f"[RESUME] Instagram #{idx} ({shortcode}) sudah ada. Melewati...")
        return True

    print(f"\n[+] Memulai harvesting Instagram {mode_type.upper()} #{idx}: {target_url} (Target: hingga 400 komentar)...")
    fieldnames = [
        "comment_id", "created_at", "author_username", "author_display_name",
        "raw_text", "likes_count", "is_reply", "target_context"
    ]

    try:
        meta = fetch_instagram_metadata(shortcode)
        caption_snippet = meta.get("caption", "")[:80]
        creator_name = meta.get("owner_username", "unknown")

        comments = fetch_instagram_comments(shortcode, max_comments=400, caption_context=meta.get("caption", ""))
        print(f"  -> Berhasil mengekstrak {len(comments)} komentar untuk shortcode {shortcode}")

        rows = []
        for c in comments:
            rows.append({
                "comment_id": c.get("comment_id"),
                "created_at": c.get("published_at") or c.get("created_at"),
                "author_username": c.get("author_username") or c.get("username"),
                "author_display_name": c.get("author_display_name", ""),
                "raw_text": str(c.get("text") or "").replace("\r\n", " ").replace("\n", " "),
                "likes_count": c.get("likes", 0),
                "is_reply": c.get("is_reply", False),
                "target_context": f"IG Creator: @{creator_name} | Caption: {caption_snippet}"
            })

        write_csv_dataset(out_file, fieldnames, rows)
        print(f"  -> Disimpan ke: {out_file.name} ({len(rows)} baris)")
        return True
    except Exception as e:
        print(f"  [!] Gagal harvesting Instagram {target_url}: {e}")
        return False


# ==============================================================================
# 5 & 6. HARVESTER: YOUTUBE SHORTS & VIDEO (Seluruh Komentar Tanpa Batas)
# ==============================================================================
def harvest_youtube(target_url: str, idx: int, mode_type: str = "yt_video") -> bool:
    if not target_url.strip():
        return False

    from app.services.youtube_auditor import (  # type: ignore
        extract_youtube_video_id,
        fetch_youtube_metadata
    )
    from youtube_comment_downloader import YoutubeCommentDownloader  # type: ignore

    vid = extract_youtube_video_id(target_url) or f"yt_{idx}"
    out_file = OUTPUT_DIR / mode_type / f"{mode_type}_{idx:02d}_{sanitize_filename(vid)}.csv"
    if out_file.exists() and out_file.stat().st_size > 150:
        print(f"[RESUME] YouTube #{idx} ({vid}) sudah ada. Melewati...")
        return True

    print(f"\n[+] Memulai harvesting YouTube {mode_type.upper()} #{idx}: {target_url} (Eksplorasi 100% tuntas)...")
    fieldnames = [
        "comment_id", "created_at", "author_username", "author_display_name",
        "raw_text", "likes_count", "is_reply", "target_context"
    ]

    try:
        meta = fetch_youtube_metadata(vid)
        title_snippet = meta.get("title", "")[:80]
        channel_name = meta.get("channel_name", "Unknown Channel")

        downloader = YoutubeCommentDownloader()
        generator = downloader.get_comments_from_url(target_url, sort_by=0)

        rows = []
        count = 0
        start_t = time.time()

        for c in generator:
            count += 1
            cid = str(c.get("cid", f"yt_c_{count}"))
            text = str(c.get("text") or "").replace("\r\n", " ").replace("\n", " ")
            author = str(c.get("author") or "anon")
            pub_time = str(c.get("time") or "")
            likes = int(c.get("votes") or 0)

            rows.append({
                "comment_id": cid,
                "created_at": pub_time,
                "author_username": author if author.startswith("@") else f"@{author}",
                "author_display_name": author,
                "raw_text": text,
                "likes_count": likes,
                "is_reply": bool(c.get("parent")),
                "target_context": f"Channel: {channel_name} | Judul: {title_snippet}"
            })

            if count % 200 == 0:
                elapsed = round(time.time() - start_t, 1)
                print(f"  -> Berhasil menarik {count} komentar... ({elapsed} detik)", flush=True)

        print(f"  -> Total komentar live ditarik 100% tuntas: {len(rows)} komentar!")
        write_csv_dataset(out_file, fieldnames, rows)
        print(f"  -> Disimpan ke: {out_file.name} ({len(rows)} baris)")
        return True
    except Exception as e:
        print(f"  [!] Gagal harvesting YouTube {target_url}: {e}")
        return False


# ==============================================================================
# STATUS & PROGRESS REPORT
# ==============================================================================
def print_status():
    """Menampilkan status kuota target dan file CSV yang sudah berhasil terunduh."""
    ensure_output_dirs()
    targets = load_targets()
    modes = ["x_user", "x_tweet", "ig_post", "ig_reels", "yt_shorts", "yt_video"]

    print("\n" + "=" * 70)
    print("STATUS DATASET HARVESTER AXIOM (TARGET 60 FILE CSV)")
    print("=" * 70)
    print(f"{'Mode / Skenario':<18} | {'Target Terisi':<15} | {'CSV Selesai':<15} | {'Progress'}")
    print("-" * 70)

    total_t = 0
    total_f = 0

    for m in modes:
        t_count = len(targets.get(m, []))
        csv_files = list((OUTPUT_DIR / m).glob("*.csv"))
        valid_files = [f for f in csv_files if f.stat().st_size > 150]
        f_count = len(valid_files)

        total_t += t_count
        total_f += f_count

        pct = f"{(f_count / t_count * 100):.1f}%" if t_count > 0 else "0.0%"
        print(f"{m:<18} | {t_count:<15} | {f_count:<15} | {pct}")

    print("=" * 70)
    total_pct = f"{(total_f / total_t * 100):.1f}%" if total_t > 0 else "0.0%"
    print(f"{'TOTAL KESELURUHAN':<18} | {total_t:<15} | {total_f:<15} | {total_pct}")
    print("=" * 70 + "\n")


# ==============================================================================
# MAIN RUNNER
# ==============================================================================
async def main():
    parser = argparse.ArgumentParser(description="AXIOM Standalone Dataset Harvester")
    parser.add_argument(
        "--mode",
        choices=["all", "x_user", "x_tweet", "ig_post", "ig_reels", "yt_shorts", "yt_video"],
        default="all",
        help="Mode harvesting yang ingin dijalankan"
    )
    parser.add_argument("--status", action="store_true", help="Cek status file dataset yang sudah terkumpul")
    args = parser.parse_args()

    ensure_output_dirs()

    if args.status:
        print_status()
        return

    targets = load_targets()
    selected_modes = [args.mode] if args.mode != "all" else ["x_user", "x_tweet", "ig_post", "ig_reels", "yt_shorts", "yt_video"]

    print("\n" + "=" * 70)
    print("MEMULAI PROSES HARVESTING DATASET AXIOM")
    print("=" * 70)

    for mode in selected_modes:
        target_list = targets.get(mode, [])
        active_targets = [t for t in target_list if t.strip()]
        print(f"\n>>> MENJALANKAN MODE: {mode.upper()} (Ditemukan {len(active_targets)} target)")

        for idx, target in enumerate(active_targets, start=1):
            if mode == "x_user":
                await harvest_x_user(target, idx)
                time.sleep(1.5)
            elif mode == "x_tweet":
                await harvest_x_tweet(target, idx)
                time.sleep(1.5)
            elif mode == "ig_post":
                harvest_instagram(target, idx, mode_type="ig_post")
                pause = round(random.uniform(10.0, 16.0), 1)
                print(f"  -> Jeda keamanan Meta {pause} detik sebelum link berikutnya...", flush=True)
                time.sleep(pause)
            elif mode == "ig_reels":
                harvest_instagram(target, idx, mode_type="ig_reels")
                pause = round(random.uniform(10.0, 16.0), 1)
                print(f"  -> Jeda keamanan Meta {pause} detik sebelum link berikutnya...", flush=True)
                time.sleep(pause)
            elif mode == "yt_shorts":
                harvest_youtube(target, idx, mode_type="yt_shorts")
                time.sleep(1.5)
            elif mode == "yt_video":
                harvest_youtube(target, idx, mode_type="yt_video")
                time.sleep(1.5)

    print("\n[V] Seluruh antrean harvesting selesai!")
    print_status()


if __name__ == "__main__":
    asyncio.run(main())

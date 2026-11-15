#!/usr/bin/env python3
"""
AXIOM - One-Time Instagram Session Dumper
========================================
Tool utilitas untuk membuat file sesi 'ig_settings.json' secara aman sekali jalan.
Mencegah pemblokiran akun tumbal & pembatasan IP oleh Meta.

Cara Pakai Paling Aman (Rekomendasi Utama):
    python dump_instagram_session.py --sessionid "ISI_SESSIONID_DARI_COOKIE_BROWSER"

Cara Pakai via ENV (.env):
    python dump_instagram_session.py

Cara Pakai Raw Login (Darurat/One-Time):
    python dump_instagram_session.py -u "username_tumbal" -p "password_tumbal"
"""

import os
import sys
import argparse
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv

# Muat environment
load_dotenv(".env")
load_dotenv("/app/.env")

def dump_session():
    parser = argparse.ArgumentParser(description="AXIOM Instagram Session Generator & Dumper")
    parser.add_argument("--sessionid", "-s", type=str, help="Cookie sessionid dari browser (Paling Direkomendasikan)")
    parser.add_argument("--username", "-u", type=str, help="Username Instagram")
    parser.add_argument("--password", "-p", type=str, help="Password Instagram")
    parser.add_argument("--out", "-o", type=str, default=None, help="Jalur file output JSON (Default: data/sessions/ig_settings.json)")
    args = parser.parse_args()

    try:
        from instagrapi import Client  # type: ignore
    except ImportError:
        print("[ERROR] Library 'instagrapi' belum terpasang. Jalankan: pip install instagrapi")
        sys.exit(1)

    # Tentukan output path
    default_out = os.getenv("INSTAGRAM_SETTINGS_PATH", "data/sessions/ig_settings.json")
    out_path = Path(args.out or default_out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    session_id = args.sessionid or os.getenv("INSTAGRAM_SESSIONID")
    username = args.username or os.getenv("INSTAGRAM_USERNAME")
    password = args.password or os.getenv("INSTAGRAM_PASSWORD")

    cl = Client()
    cl.delay_range = [2, 5]

    print("==================================================")
    print("      AXIOM - Instagram Session Dumper Guard      ")
    print("==================================================")
    print(f"[*] Target output session file: {out_path}")

    # METODE 1: SessionID (Paling Aman, 0 Challenge Risk)
    if session_id and session_id.strip():
        raw_sid = urllib.parse.unquote(session_id.strip())
        print("[*] Mengotentikasi via SessionID cookie...")
        try:
            cl.login_by_sessionid(raw_sid)
            cl.dump_settings(str(out_path))
            print(f"[SUCCESS] Berhasil otentikasi via SessionID!")
            print(f"[SUCCESS] File sesi tersimpan di: {out_path}")
            print("[INFO] Backend AXIOM & Harvester sekarang dapat membaca sesi ini tanpa login ulang.")
            return
        except Exception as e:
            print(f"[ERROR] Gagal otentikasi via SessionID: {e}")
            if not (username and password):
                sys.exit(1)

    # METODE 2: Username & Password One-Time
    if username and password:
        u = username.strip()
        p = password.strip()
        print(f"[*] Melakukan one-time login untuk @{u}...")
        try:
            cl.login(u, p)
            cl.dump_settings(str(out_path))
            print(f"[SUCCESS] Berhasil login sebagai @{u}!")
            print(f"[SUCCESS] File sesi tersimpan di: {out_path}")
            print("[INFO] Sesi siap digunakan untuk audit & harvesting tanpa memicu checkpoint lagi.")
            return
        except Exception as e:
            print(f"[ERROR] Gagal login username/password: {e}")
            sys.exit(1)

    print("[ERROR] Tidak ada kredensial yang diberikan.")
    print("Gunakan salah satu dari:")
    print("  1. --sessionid '<sessionid>' (Rekomendasi)")
    print("  2. Masukkan INSTAGRAM_SESSIONID di .env")
    print("  3. --username '<user>' --password '<pass>'")
    sys.exit(1)

if __name__ == "__main__":
    dump_session()

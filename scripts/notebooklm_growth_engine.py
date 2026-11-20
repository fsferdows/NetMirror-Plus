#!/usr/bin/env python3
"""
moviehub.stream - NotebookLM Viral Growth Engine & SEO Automation
Powered by teng-lin/notebooklm-py (https://github.com/teng-lin/notebooklm-py)

This script automates:
1. Connecting to Google NotebookLM using the notebooklm-py CLI and API.
2. Ingesting moviehub.stream's knowledge base (llms.txt, llms-full.txt, sitemap.xml).
3. Generating studio-quality viral Audio Overviews (AI podcasts) for YouTube, Spotify, and TikTok.
4. Exporting Answer Engine Optimization (AEO) FAQs and high-ranking cinema guides.
"""

import os
import sys
import json
import subprocess
import argparse

NOTEBOOK_NAME = "moviehub.stream – Global Cinema & 24/7 Live Sports Hub"
BASE_URL = "https://moviehub.stream"
SOURCES = [
    f"{BASE_URL}/llms.txt",
    f"{BASE_URL}/llms-full.txt",
    f"{BASE_URL}/sitemap.xml",
    f"{BASE_URL}/privacy.html"
]

PODCAST_PROMPT = """
Create an engaging, fast-paced, high-energy Audio Overview (Deep Dive Podcast) between two hosts discussing moviehub.stream.
Cover the following key topics enthusiastically:
1. How moviehub.stream makes worldwide 4K Ultra HD streaming completely free without intrusive popup redirects or malware.
2. The 300% Studio Sound Booster and Dialogue Clarity EQ that solves the universal frustration of whisper-quiet movie dialogue and muffled speech.
3. The 24/7 Live Sports Broadcast hub covering Cricket (IPL, ICC World Cup), Football (UEFA Champions League, Premier League, La Liga), NBA, and F1.
4. Multi-language dubs across 16 global languages (Hindi, English, Bengali, Tamil, Telugu, Spanish, Korean, Japanese anime).
5. Explain how easily anyone can visit moviehub.stream directly in any browser on iPhone, Android, Mac, or PC.
Ensure the tone is entertaining, conversational, and makes listeners want to open moviehub.stream immediately!
"""

def run_cmd(cmd_list, capture=True):
    """Run command via uv tool or python."""
    # Prefix with uv tool run --from notebooklm-py
    full_cmd = ["uv", "tool", "run", "--from", "notebooklm-py"] + cmd_list
    try:
        if capture:
            res = subprocess.run(full_cmd, capture_output=True, text=True, check=True)
            return res.stdout.strip()
        else:
            res = subprocess.run(full_cmd, check=True)
            return ""
    except subprocess.CalledProcessError as e:
        print(f"[Error] Command failed: {' '.join(full_cmd)}", file=sys.stderr)
        if e.stderr:
            print(f"[Details] {e.stderr}", file=sys.stderr)
        return None

def check_auth():
    """Verify NotebookLM authentication."""
    print("🔍 Checking NotebookLM authentication status...")
    out = run_cmd(["notebooklm", "auth", "check", "--json"])
    if not out:
        print("❌ Not authenticated.")
        print("\n👉 To authenticate, please run:")
        print("   uv tool run --from notebooklm-py notebooklm login")
        return False
    try:
        data = json.loads(out)
        if data.get("status") == "ok":
            print(f"✅ Authenticated as: {data.get('account', 'Active Profile')}")
            return True
        else:
            print("⚠️ Session expired or not configured.")
            print("👉 Run: uv tool run --from notebooklm-py notebooklm login")
            return False
    except json.JSONDecodeError:
        return False

def create_or_get_notebook():
    """Create or locate the moviehub.stream notebook."""
    print(f"📁 Locating or creating notebook: '{NOTEBOOK_NAME}'...")
    list_out = run_cmd(["notebooklm", "list", "--json"])
    if list_out:
        try:
            nb_list = json.loads(list_out)
            for nb in nb_list.get("notebooks", []):
                if NOTEBOOK_NAME.lower() in nb.get("title", "").lower():
                    print(f"✅ Found existing notebook: {nb.get('title')} (ID: {nb.get('id')})")
                    return nb.get("id")
        except Exception:
            pass

    # Create new
    create_out = run_cmd(["notebooklm", "create", NOTEBOOK_NAME, "--json"])
    if create_out:
        try:
            data = json.loads(create_out)
            nb_id = data.get("notebook", {}).get("id")
            print(f"🎉 Created new notebook! ID: {nb_id}")
            return nb_id
        except Exception:
            pass
    return None

def add_platform_sources(nb_id):
    """Add moviehub.stream documentation sources into NotebookLM."""
    print(f"\n🌐 Ingesting sources into notebook {nb_id}...")
    for src in SOURCES:
        print(f"   Adding: {src}")
        out = run_cmd(["notebooklm", "source", "add", src, "-n", nb_id, "--json"])
        if out:
            try:
                data = json.loads(out)
                src_id = data.get("source", {}).get("id")
                if src_id:
                    print(f"   Waiting for source to process ({src_id})...")
                    run_cmd(["notebooklm", "source", "wait", src_id, "-n", nb_id])
                    print(f"   ✅ Processed: {src}")
            except Exception as e:
                print(f"   Notice: {e}")

def generate_podcast_audio(nb_id):
    """Generate viral Audio Overview podcast."""
    print("\n🎙️ Generating studio-quality Audio Overview Podcast...")
    print("   This uses Google NotebookLM's dual-host conversational AI model.")
    out = run_cmd(["notebooklm", "generate", "audio", "-n", nb_id, "--prompt", PODCAST_PROMPT, "--json"])
    if out:
        print("✅ Generation triggered successfully!")
        print("   Artifact task is queued in Google NotebookLM cloud.")
        print(f"   To check status and download, run:")
        print(f"   uv tool run --from notebooklm-py notebooklm artifact list -n {nb_id}")
        print(f"   uv tool run --from notebooklm-py notebooklm download audio -n {nb_id} -o ./moviehub_podcast.mp3")

def main():
    parser = argparse.ArgumentParser(description="moviehub.stream NotebookLM Viral Growth Engine")
    parser.add_argument("action", choices=["check", "login", "setup", "podcast", "full"], help="Action to perform")
    args = parser.parse_args()

    if args.action == "login":
        print("🚀 Opening browser for NotebookLM login...")
        subprocess.run(["uv", "tool", "run", "--from", "notebooklm-py", "notebooklm", "login"])
        return

    if args.action == "check":
        check_auth()
        return

    if not check_auth():
        sys.exit(1)

    nb_id = create_or_get_notebook()
    if not nb_id:
        print("❌ Failed to create or find notebook.")
        sys.exit(1)

    if args.action in ["setup", "full"]:
        add_platform_sources(nb_id)

    if args.action in ["podcast", "full"]:
        generate_podcast_audio(nb_id)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Video Preprocessing Script
Extracts frames from video and removes backgrounds using rembg
"""

import os
import subprocess
import json
import sys
from pathlib import Path

# Configuration
VIDEO_PATH = "./public/hero-video.mp4"
OUTPUT_DIR = "./public/frames"
BACKGROUND_DIR = os.path.join(OUTPUT_DIR, "background")
FOREGROUND_DIR = os.path.join(OUTPUT_DIR, "foreground")
AUDIO_PATH = os.path.join(OUTPUT_DIR, "audio.mp3")
FPS = 30

def main():
    print("🎬 Video Preprocessing Script")
    print("=============================\n")

    # Check if video exists
    if not os.path.exists(VIDEO_PATH):
        print(f"❌ Video not found: {VIDEO_PATH}")
        print("Please place your video at public/hero-video.mp4")
        sys.exit(1)

    # Create output directories
    os.makedirs(BACKGROUND_DIR, exist_ok=True)
    os.makedirs(FOREGROUND_DIR, exist_ok=True)

    # Step 1: Extract frames using ffmpeg
    print("📹 Step 1: Extracting video frames...")
    try:
        subprocess.run([
            "ffmpeg", "-i", VIDEO_PATH,
            "-vf", f"fps={FPS}",
            os.path.join(BACKGROUND_DIR, "frame_%04d.png"),
            "-y"
        ], check=True)
        print("✅ Frames extracted successfully\n")
    except subprocess.CalledProcessError:
        print("❌ FFmpeg error. Make sure ffmpeg is installed.")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ FFmpeg not found. Please install ffmpeg.")
        sys.exit(1)

    # Get list of frames
    frames = sorted([f for f in os.listdir(BACKGROUND_DIR) if f.endswith(".png")])

    if not frames:
        print("❌ No frames extracted")
        sys.exit(1)

    print(f"📸 Found {len(frames)} frames\n")

    # Step 1.5: Extract audio using ffmpeg
    print("🎵 Step 1.5: Extracting audio...")
    try:
        subprocess.run([
            "ffmpeg", "-i", VIDEO_PATH,
            "-vn", "-acodec", "libmp3lame", "-q:a", "2",
            AUDIO_PATH, "-y"
        ], check=True, capture_output=True)
        print("✅ Audio extracted successfully\n")
    except subprocess.CalledProcessError:
        print("⚠️  Audio extraction failed (video may have no audio track)\n")
    except FileNotFoundError:
        print("⚠️  FFmpeg not found, skipping audio extraction\n")

    # Step 2: Remove backgrounds using rembg
    print("🖼️  Step 2: Removing backgrounds...")
    print("   This may take a while...\n")

    try:
        from rembg import remove
        from PIL import Image
    except ImportError:
        print("❌ rembg not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "rembg", "pillow"], check=True)
        from rembg import remove
        from PIL import Image

    processed = 0
    for i, frame in enumerate(frames):
        input_path = os.path.join(BACKGROUND_DIR, frame)
        output_path = os.path.join(FOREGROUND_DIR, frame)

        try:
            with open(input_path, "rb") as f:
                input_data = f.read()

            output_data = remove(input_data)

            with open(output_path, "wb") as f:
                f.write(output_data)

            processed += 1
            progress = (i + 1) / len(frames) * 100
            print(f"\r   Processing: {i + 1}/{len(frames)} ({progress:.1f}%)", end="", flush=True)

        except Exception as e:
            print(f"\n❌ Error processing {frame}: {e}")

    print(f"\n\n✅ Processed {processed}/{len(frames)} frames\n")

    # Step 3: Generate metadata
    print("📝 Step 3: Generating metadata...")
    audioExists = os.path.exists(AUDIO_PATH)
    meta = {
        "fps": FPS,
        "totalFrames": len(frames),
        "backgroundDir": "/frames/background",
        "foregroundDir": "/frames/foreground",
        "audioSrc": "/frames/audio.mp3" if audioExists else None,
        "generatedAt": __import__("datetime").datetime.now().isoformat()
    }

    with open(os.path.join(OUTPUT_DIR, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print("✅ Metadata saved\n")

    print("=============================")
    print("🎉 Preprocessing complete!")
    print(f"   Background frames: {BACKGROUND_DIR}")
    print(f"   Foreground frames: {FOREGROUND_DIR}")
    print(f"   Metadata: {os.path.join(OUTPUT_DIR, 'meta.json')}")

if __name__ == "__main__":
    main()

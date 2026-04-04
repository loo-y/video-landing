# Immersive Video Landing Page

A high-performance, visually immersive landing page built with **React Router** and **Tailwind CSS**. Features a full-screen looping video background with brutalist typography overlay.

## Tech Stack

- **Framework:** React Router 7
- **Styling:** Tailwind CSS 4
- **Animation:** GSAP
- **Smooth Scroll:** Lenis
- **Icons:** Lucide React
- **Rendering:** Canvas 2D + OffscreenCanvas (double-buffered) for parallax mode

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

## Project Structure

```
app/
├── components/
│   ├── HeroSection.tsx       # Main container with mode switching & audio bridge
│   ├── VideoPlayer.tsx       # Background video with autoplay, loop, muted
│   ├── ParallaxContainer.tsx # Parallax container (transform currently disabled)
│   ├── TypographyLayer.tsx   # Brutalist typography with GSAP animations
│   └── ActionGroup.tsx       # CTA button and audio toggle
├── routes/
│   └── home.tsx              # Landing page route
├── root.tsx
└── app.css                   # Tailwind CSS + design tokens

scripts/
└── preprocess-video.py       # Video frame extraction + AI background removal + audio extraction

public/
├── videos/bg-video.mp4            # Your video file (git-ignored)
└── frames/                   # Generated frame sequences (git-ignored)
    ├── background/           # Original frames (PNG)
    ├── foreground/           # AI-processed transparent PNGs (person only)
    ├── audio.mp3             # Extracted audio track
    └── meta.json             # Frame metadata (fps, totalFrames, paths, audioSrc)
```

## Features

### Two Playback Modes

1. **Video Mode**: Standard `<video>` playback with audio control
2. **Parallax Mode**: Frame-by-frame Canvas rendering with:
   - **Three-layer compositing**: Background → Typography → Foreground (person)
   - **Double-buffered rendering**: OffscreenCanvas → visible Canvas (flicker-free)
   - **Pre-decoded frames**: `createImageBitmap` for zero-decode-latency drawing
   - **object-fit: cover**: Aspect-ratio-preserving, centered crop on any window size
   - **Audio sync**: Extracted audio track plays independently, synced to frame rate
   - Mouse-following parallax effect (currently disabled pending stability verification)

Toggle between modes using the button in the top-right corner.

### Parallax Mode Architecture

The parallax mode uses a sophisticated rendering pipeline:

```
Loading Phase:
  Image → createImageBitmap() → ImageBitmap[] (fully decoded)

Per Frame (single rAF callback):
  OffscreenCanvas.clearRect()
  OffscreenCanvas.drawImage(bitmap, cover-fit)
  VisibleCanvas.clearRect()
  VisibleCanvas.drawImage(offscreenCanvas)  ← atomic copy
```

**Key techniques:**
- `ImageBitmap`: Images are decoded once during preload; `drawImage` uses GPU texture directly
- `OffscreenCanvas`: All intermediate rendering happens off-screen; user never sees partial state
- Same `requestAnimationFrame`: Both bg and fg canvases draw in one callback for frame-perfect sync
- `clearRect` on both canvases: Prevents transparent PNG foreground from accumulating pixels

### Audio in Parallax Mode

Audio is extracted from the source video via ffmpeg and played via a separate `<audio>` element:

- Auto-plays **muted** by default (browser autoplay policy requirement)
- User clicks 🔊 button → `audio.play()` called **in click event handler** (user gesture context)
- Loops continuously, synced visually with frame animation

> **Note**: If audio doesn't work, verify that `public/frames/audio.mp3` exists and `meta.json` contains `"audioSrc"`.

## Parallax Mode Setup

To enable parallax mode, run the preprocessing script:

```bash
# Requirements:
# - Python 3.x
# - ffmpeg (system installed)
# - rembg (Python package: pip install rembg)

python scripts/preprocess-video.py
```

This will:
1. Extract video frames using ffmpeg (30fps)
2. Process each frame with AI background removal (rembg) → transparent person layer
3. **Extract audio track** using ffmpeg → `audio.mp3`
4. Generate `meta.json` with frame count, fps, directory paths, and audio source

**Note**: First run will download the AI model (~176MB).

### Audio-Only Extraction (if frames already exist)

If you already have frame images but missing audio:

```bash
ffmpeg -i ./public/videos/bg-video.mp4 -vn -acodec libmp3lame -q:a 2 ./public/frames/audio.mp3 -y
```

Then add `"audioSrc": "/frames/audio.mp3"` to `public/frames/meta.json`.

## Design System

This project follows a strict design system defined in `DESIGN.md`:

- **Trip Blue (brand):** `#2C61FE`
- **Near Black (text):** `#121826`
- **Navy-tinted shadows:** `rgba(15,41,77,0.12)`
- **Fixed 1160px layout** (desktop-only)

## Layer Z-Index Reference

In parallax mode, the visual stack is:

| Layer | z-index | Content |
|-------|---------|---------|
| Background | 0 | Original video frame (full image) |
| Typography | 1 | Heading, subheading text |
| Foreground | 2 | Transparent PNG (person only, background removed) |
| Controls | 10 | Mode toggle, audio button |
| CTA | 10 | Action button group |

## Known Issues & Limitations

- ⚠️ **Flicker/frame-stacking**: Multiple mitigation strategies applied (ImageBitmap + double buffering + clearRect). Awaiting user verification.
- 🚫 **Mouse parallax effect disabled**: ParallaxLayer transform is temporarily off to isolate flickering issues.
- 📦 **Large frame files**: ~150MB+ for 181 frames at 928×1376 resolution
- 🐌 **Full pre-load**: All frames must be decoded before playback starts (no streaming)
- 💻 **Browser support**: Requires OffscreenCanvas API (all modern browsers; no IE)

## Adding Your Video

Place your video file in the `public/` folder as `videos/bg-video.mp4`. The video is git-ignored by default.

---

Built with React Router.

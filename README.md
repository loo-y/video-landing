# Immersive Video Landing Page

A high-performance, visually immersive landing page built with **React Router** and **Tailwind CSS**. Features a full-screen looping video background with brutalist typography overlay.

## Tech Stack

- **Framework:** React Router 7
- **Styling:** Tailwind CSS 4
- **Animation:** GSAP
- **Smooth Scroll:** Lenis
- **Icons:** Lucide React
- **Rendering:**
  - Canvas 2D + OffscreenCanvas (double-buffered) for Canvas parallax mode
  - **PixiJS 8** (WebGL) for enhanced parallax mode with mouse tracking

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
│   ├── PixiFramePlayer.tsx   # WebGL rendering with PixiJS (parallax + breathing)
│   ├── ParallaxContainer.tsx # Mouse position tracking context
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

### Three Playback Modes

1. **Video Mode**: Standard `<video>` playback with audio control
2. **Parallax (Canvas)**: Frame-by-frame Canvas 2D rendering with:
   - Three-layer compositing: Background → Typography → Foreground
   - Double-buffered rendering with OffscreenCanvas
   - Pre-decoded frames via `createImageBitmap`
3. **Parallax (PixiJS)**: WebGL rendering with enhanced effects:
   - **Mouse parallax**: Background and foreground layers move at different speeds based on mouse position
   - **Breathing animation**: Subtle scale animation on the foreground layer
   - Hardware-accelerated WebGL rendering

Toggle between modes using the menu button in the top-right corner.

### PixiJS Parallax Mode

The PixiJS mode uses WebGL for hardware-accelerated rendering:

```
Architecture:
┌─ PixiFramePlayer ─────────────────────────┐
│  PixiJS Application (WebGL)                │
│  ├── bgContainer (z-0) - Background sprites│
│  ├── fgContainer (z-2) - Foreground sprites│
│  │   └── Breathing scale animation         │
│  └── DOM overlay: TypographyLayer (z-1)    │
└────────────────────────────────────────────┘

Parallax Effect:
- Background offset: 15px (depth = 0.3)
- Foreground offset: 40px (depth = 0.8)
- Smooth interpolation (lerp factor = 0.08)

Breathing Animation:
- Scale range: 1.0 → 1.015 → 1.0
- Period: ~8 seconds (sinusoidal)
```

### Canvas Parallax Mode Architecture

The Canvas mode uses a sophisticated rendering pipeline:

```
Loading Phase:
  Image → createImageBitmap() → ImageBitmap[] (fully decoded)

Per Frame (single rAF callback):
  OffscreenCanvas.clearRect()
  OffscreenCanvas.drawImage(bitmap, cover-fit)
  VisibleCanvas.clearRect()
  VisibleCanvas.drawImage(offscreenCanvas)  ← atomic copy
```

### Audio in Parallax Mode

Audio is extracted from the source video via ffmpeg and played via a separate `<audio>` element:

- Auto-plays **muted** by default (browser autoplay policy requirement)
- User clicks 🔊 button → `audio.play()` called **in click event handler** (user gesture context)
- Loops continuously, synced visually with frame animation

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

- 📦 **Large frame files**: ~150MB+ for 240 frames
- 🐌 **Full pre-load**: All frames must be decoded before playback starts (no streaming)
- 💻 **Browser support**: Requires WebGL and OffscreenCanvas API (all modern browsers)

## Adding Your Video

Place your video file in the `public/` folder as `videos/bg-video.mp4`. The video is git-ignored by default.

---

Built with React Router.

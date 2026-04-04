# Immersive Video Landing Page

A high-performance, visually immersive landing page built with **React Router** and **Tailwind CSS**. Features a full-screen looping video background with brutalist typography overlay.

## Tech Stack

- **Framework:** React Router 7
- **Styling:** Tailwind CSS 4
- **Animation:** GSAP
- **Smooth Scroll:** Lenis
- **Icons:** Lucide React

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
│   ├── HeroSection.tsx       # Main container with mode switching
│   ├── VideoPlayer.tsx       # Background video with autoplay, loop, muted
│   ├── FramePlayer.tsx       # Frame sequence player for parallax mode
│   ├── ParallaxContainer.tsx # Mouse parallax effect container
│   ├── TypographyLayer.tsx   # Brutalist typography with GSAP animations
│   └── ActionGroup.tsx       # CTA button and audio toggle
├── routes/
│   └── home.tsx              # Landing page route
├── root.tsx
└── app.css                   # Tailwind CSS + design tokens

scripts/
└── preprocess-video.py       # Video frame extraction + AI background removal

public/
├── hero-video.mp4            # Your video file (git-ignored)
└── frames/                   # Generated frame sequences (git-ignored)
    ├── background/           # Original frames
    ├── foreground/           # AI-processed transparent PNGs
    └── meta.json             # Frame metadata
```

## Features

### Two Playback Modes

1. **Video Mode**: Standard video playback with audio control
2. **Parallax Mode**: Frame-by-frame playback with:
   - Text layered between background and foreground
   - Mouse-following parallax effect
   - Synchronized background/foreground frames

Toggle between modes using the button in the top-right corner.

### Parallax Mode Setup

To enable parallax mode, run the preprocessing script:

```bash
# Requirements:
# - Python 3.x
# - ffmpeg (system installed)

python scripts/preprocess-video.py
```

This will:
1. Extract video frames using ffmpeg
2. Process each frame with AI background removal (rembg)
3. Generate transparent foreground images
4. Create metadata file

**Note**: First run will download the AI model (~176MB).

## Design System

This project follows a strict design system defined in `DESIGN.md`:

- **Trip Blue (brand):** `#2C61FE`
- **Near Black (text):** `#121826`
- **Navy-tinted shadows:** `rgba(15,41,77,0.12)`
- **Fixed 1160px layout** (desktop-only)

## Adding Your Video

Place your video file in the `public/` folder as `hero-video.mp4`. The video is git-ignored by default.

---

Built with React Router.

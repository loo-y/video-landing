# Immersive Video Landing Page

A high-performance, visually immersive landing page built with **React Router** and **Tailwind CSS**. Features a full-screen looping video background with brutalist typography overlay.

## Tech Stack

- **Framework:** React Router 7
- **Styling:** Tailwind CSS 4
- **Animation:** GSAP
- **Smooth Scroll:** Lenis

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
│   ├── HeroSection.tsx    # Main container with video, overlay, and content layers
│   ├── VideoPlayer.tsx    # Background video with autoplay, loop, muted
│   ├── TypographyLayer.tsx # Brutalist typography with GSAP animations
│   └── ActionGroup.tsx    # CTA button and audio toggle
├── routes/
│   └── home.tsx           # Landing page route
├── root.tsx
└── app.css                # Tailwind CSS + design tokens
```

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

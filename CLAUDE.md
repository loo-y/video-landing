# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Immersive video landing page built with **Remix** and **Tailwind CSS**. Features a full-screen looping video background with brutalist typography overlay.

## Tech Stack

- **Framework:** Remix
- **Styling:** Tailwind CSS
- **Animation:** GSAP or Framer Motion
- **Smooth Scroll:** Lenis

## Design System

This project follows a strict design system defined in `DESIGN.md`. Key principles:

### Colors
Use CSS variable tokens (`--smtcColor*`, `--coreColor*`):
- **Trip Blue (brand):** `#2C61FE` — primary CTA, active states, links
- **Near Black (text):** `#121826` — never use pure `#000000`
- **White:** `#FFFFFF` — main surface

### Typography
- **Font:** TRIPGEOM (geometric sans-serif)
- **Weights:** `font-bold`, `font-medium` (maps to 600, not 500), default (regular)
- **Always use explicit `leading-[Npx]`** — never rely on browser defaults

### Shadows
Use navy-tinted shadows, never pure black:
- **Card:** `0 8px 20px 0 rgba(15,41,77,0.12)`
- **Popover:** `0 4px 16px 0 rgba(69,88,115,0.2)`

### Border Radius
- **2px:** Tags, badges
- **4px:** Buttons, inputs, tooltips
- **8px:** Cards, dialogs
- **12px:** Panels

### Layout
- **Fixed width:** 1160px (`max-w-[1160px] min-w-[1160px]`)
- **Two-column:** Left content (740-754px) + Right panel (408px)
- **Desktop-only:** No responsive/mobile layouts

## Component Architecture

```
HeroSection (container)
├── VideoPlayer (background layer)
├── Overlay Layer (gradient/solid for readability)
└── TypographyLayer (content layer)
    └── ActionGroup (CTAs)
```

### Key Components
- **VideoPlayer:** `autoPlay`, `loop`, `muted`, `playsInline`, `object-cover`
- **TypographyLayer:** Extra bold heading, uppercase, tracking-tighter, fluid scale (`text-7xl` to `text-9xl`)
- **ActionGroup:** Primary CTA button + audio toggle

## Do's and Don'ts

### Do
- Use CSS variable tokens for all colors via `bg-[var(--token)]` / `text-[var(--token)]`
- Use standard Tailwind font weight classes: `font-bold`, `font-medium`
- Use navy-tinted shadows `rgba(15,41,77,0.12)` for cards
- Keep content within 1160px max-width with `mx-auto`

### Don't
- Don't use pure black (`#000000`) — use `#121826`
- Don't hardcode hex colors inline — use CSS variable tokens
- Don't use `rgba(0,0,0,*)` shadows on cards
- Don't create responsive/mobile layouts
- Don't use border-radius > 12px

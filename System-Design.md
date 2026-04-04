# System Design: Immersive Video Landing Page

## 1. Objective
Build a high-performance, visually immersive landing page using **Remix** and **Tailwind CSS**. The page features a full-screen looping video background with a brutalist typography overlay, strictly adhering to the styles defined in `design.md`.

## 2. Global Integration
- **Style Source:** All color tokens, button variants, and font scales **MUST** be pulled from `design.md`.
- **Layout Reference:** Follow the composition of the provided reference image (asymmetric text, specific CTA placement).

## 3. Component Architecture

### A. `HeroSection` (Layout Container)
- **Position:** `relative`, `w-full`, `h-screen`, `overflow-hidden`.
- **Layers:**
  1. **Background Layer:** Video element.
  2. **Overlay Layer:** A subtle gradient or solid color overlay (defined in `design.md`) to ensure text readability.
  3. **Content Layer:** Flex or Grid container for typography and CTAs.

### B. `VideoPlayer` (Core Component)
- **Props:** `src: string`, `poster: string`.
- **Attributes:** `autoPlay`, `loop`, `muted`, `playsInline`, `object-cover`.
- **Performance:** Implement `priority` loading for the video poster image to optimize LCP.

### C. `TypographyLayer`
- **Main Heading:** - Text: "SIMULATE" (or dynamic).
  - Styling: Extra bold/black weight, uppercase, tracking-tighter.
  - Scale: Fluid typography (e.g., `text-7xl` to `text-9xl`).
- **Sub-heading/Description:**
  - Position: Right-aligned or offset according to the visual reference.
  - Max-width to ensure clean line breaks.

### D. `ActionGroup`
- **Primary CTA:** - Component: Use the `Button` component defined in your UI library or `design.md`.
  - Content: "SQUID" + Icon.
- **Audio Control:** A small toggle (disc icon) to control video sound (default: muted).

## 4. Interaction & Motion (GSAP / Framer Motion)
- **Entry:** - Heading: Staggered letter animation or fade-in-up.
  - UI Elements: Delay by 0.5s after heading animation.
- **Scroll Behavior:** - Implementation of **Lenis** for smooth inertia scrolling.
  - Video parallax effect (optional): Scale video slightly as the user scrolls.

## 5. Implementation Roadmap
1. **Setup:** Confirm `tailwind.config.ts` includes the theme tokens from `design.md`.
2. **Component Creation:** Build `VideoPlayer.tsx` and `HeroSection.tsx`.
3. **Route Integration:** Assemble in `app/routes/_index.tsx`.
4. **Responsive Audit:** Ensure the video maintains center-focus on mobile and typography scales down appropriately.
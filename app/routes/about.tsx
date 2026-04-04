import type { Route } from "./+types/about";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - SIMULATE" },
    { name: "description", content: "Learn more about SIMULATE" },
  ];
}

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--smtcColorTextPrimary)] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 lg:px-24 py-6 bg-[var(--smtcColorTextPrimary)]/80 backdrop-blur-md border-b border-white/10">
        <Link to="/" className="text-xl font-bold tracking-wider text-white/90 hover:text-white transition-colors">
          SIMULATE
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-white/60">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span className="text-white/30">About</span>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-8 md:px-16 lg:px-24 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8">
          About <span className="text-[var(--smtcColorBgBrandFilled)]">SIMULATE</span>
        </h1>

        <div className="space-y-6 text-lg text-white/70 leading-relaxed">
          <p>
            SIMULATE is an experimental immersive video landing page that pushes the boundaries
            of web-based visual experiences. Built with modern web technologies, it demonstrates
            how frame-by-frame rendering with AI-processed transparent layers can create
            depth and parallax effects previously only possible in native applications.
          </p>

          <h2 className="text-2xl font-bold text-white/90 mt-10 mb-4">Technology Stack</h2>
          <ul className="list-disc list-inside space-y-2 text-white/60">
            <li><strong className="text-white/80">React Router 7</strong> — Full-stack framework with file-based routing</li>
            <li><strong className="text-white/80">Tailwind CSS 4</strong> — Utility-first styling with design tokens</li>
            <li><strong className="text-white/80">Canvas 2D + OffscreenCanvas</strong> — Double-buffered flicker-free rendering</li>
            <li><strong className="text-white/80">GSAP</strong> — Professional-grade animation library</li>
            <li><strong className="text-white/80">rembg (Python)</strong> — AI-powered background removal for transparent foreground layers</li>
          </ul>

          <h2 className="text-2xl font-bold text-white/90 mt-10 mb-4">Parallax Mode</h2>
          <p>
            The parallax mode extracts video frames, uses AI to separate the foreground subject
            from the background, then re-composites them as independent layers in the browser.
            This creates a true 3D depth effect where typography can be positioned between
            the background environment and the foreground subject.
          </p>

          <h2 className="text-2xl font-bold text-white/90 mt-10 mb-4">Open Source</h2>
          <p>
            This project is open source and available for learning and experimentation.
            Feel free to fork, modify, and build upon it.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full
                       bg-[var(--smtcColorBgBrandFilled)] text-white font-semibold
                       hover:opacity-90 transition-opacity"
          >
            ← Back to Experience
          </Link>
        </div>
      </main>
    </div>
  );
}

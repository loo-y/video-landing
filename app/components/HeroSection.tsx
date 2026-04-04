import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { VideoPlayer } from "./VideoPlayer";
import { TypographyLayer } from "./TypographyLayer";
import { ActionGroup } from "./ActionGroup";

interface HeroSectionProps {
  videoSrc: string;
  poster?: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
}

export function HeroSection({
  videoSrc,
  poster,
  heading = "SIMULATE",
  subheading,
  ctaText = "SQUID",
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Handle audio toggle
  const handleAudioToggle = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, []);

  // Store video ref
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Initial fade in for the whole section
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[var(--smtcColorTextPrimary)]"
    >
      {/* Background Layer: Video */}
      <VideoPlayer src={videoSrc} poster={poster} />

      {/* Overlay Layer: Gradient for text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(18, 24, 38, 0.3) 0%,
            rgba(18, 24, 38, 0.5) 50%,
            rgba(18, 24, 38, 0.7) 100%
          )`,
        }}
      />

      {/* Content Layer */}
      <div className="relative z-[2] flex flex-col h-full">
        {/* Main Typography */}
        <div className="flex-1 flex items-center">
          <TypographyLayer heading={heading} subheading={subheading} />
        </div>

        {/* Action Group - positioned at bottom */}
        <div className="pb-16 px-8 md:px-16 lg:px-24">
          <ActionGroup ctaText={ctaText} onAudioToggle={handleAudioToggle} />
        </div>
      </div>
    </section>
  );
}

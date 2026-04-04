import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { VideoPlayer } from "./VideoPlayer";
import { TypographyLayer } from "./TypographyLayer";
import { ActionGroup, AudioToggle } from "./ActionGroup";
import { ParallaxContainer, ParallaxLayer } from "./ParallaxContainer";

interface FrameMeta {
  fps: number;
  totalFrames: number;
  backgroundDir: string;
  foregroundDir: string;
  generatedAt: string;
}

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
  ctaText = "EXPLORE",
}: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [frameMeta, setFrameMeta] = useState<FrameMeta | null>(null);
  const [useFrames, setUseFrames] = useState(false);
  const [frameModeAvailable, setFrameModeAvailable] = useState(false);

  // Check for frame metadata
  useEffect(() => {
    fetch("/frames/meta.json")
      .then((res) => res.json())
      .then((data) => {
        setFrameMeta(data);
        setFrameModeAvailable(true);
        setUseFrames(true); // Default to frame mode if available
      })
      .catch(() => {
        setFrameModeAvailable(false);
        setUseFrames(false);
      });
  }, []);

  // Handle audio toggle
  const handleAudioToggle = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, []);

  // Toggle between modes
  const toggleMode = useCallback(() => {
    setUseFrames((prev) => !prev);
  }, []);

  // Initial animation
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
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
      <ParallaxContainer className="relative w-full h-full">
        {useFrames && frameMeta ? (
          <SyncedFramePlayer
            backgroundDir={frameMeta.backgroundDir}
            foregroundDir={frameMeta.foregroundDir}
            totalFrames={frameMeta.totalFrames}
            fps={frameMeta.fps}
            heading={heading}
            subheading={subheading}
          />
        ) : (
          <>
            {/* Video Player Mode */}
            <VideoPlayer videoRef={videoRef} src={videoSrc} poster={poster} muted={isMuted} />

            {/* Overlay Layer */}
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
            <div className="absolute inset-0 z-[2] flex flex-col h-full">
              <div className="flex-1 flex items-center">
                <TypographyLayer heading={heading} subheading={subheading} />
              </div>
            </div>
          </>
        )}

        {/* Top bar with controls */}
        <div className="absolute top-0 right-0 z-10 flex items-center gap-4 p-6 md:p-8 lg:p-10 pointer-events-auto">
          {/* Mode toggle - only show if frame mode is available */}
          {frameModeAvailable && (
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/10 backdrop-blur-md border border-white/20
                         text-white/80 text-sm font-medium
                         hover:bg-white/20 hover:border-white/30
                         transition-all duration-200"
              title={useFrames ? "Switch to video mode" : "Switch to parallax mode"}
            >
              {useFrames ? (
                <>
                  <VideoIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Video</span>
                </>
              ) : (
                <>
                  <LayersIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Parallax</span>
                </>
              )}
            </button>
          )}

          {/* Audio toggle - only for video mode */}
          {!useFrames && <AudioToggle isMuted={isMuted} onAudioToggle={handleAudioToggle} />}
        </div>

        {/* Action Group */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16 px-8 md:px-16 lg:px-24 pointer-events-auto">
          <ActionGroup ctaText={ctaText} />
        </div>
      </ParallaxContainer>
    </section>
  );
}

// Synchronized frame player
function SyncedFramePlayer({
  backgroundDir,
  foregroundDir,
  totalFrames,
  fps,
  heading,
  subheading,
}: {
  backgroundDir: string;
  foregroundDir: string;
  totalFrames: number;
  fps: number;
  heading: string;
  subheading?: string;
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameInterval = 1000 / fps;

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (timestamp - lastTimeRef.current >= frameInterval) {
        setCurrentFrame((prev) => (prev + 1) % totalFrames);
        lastTimeRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frameInterval, totalFrames]);

  const frameNum = String(currentFrame + 1).padStart(4, "0");

  return (
    <>
      {/* Background layer */}
      <ParallaxLayer depth={0.3} className="absolute inset-0 z-0">
        <img
          src={`${backgroundDir}/frame_${frameNum}.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </ParallaxLayer>

      {/* Typography Layer */}
      <div className="absolute inset-0 z-[1] flex flex-col h-full pointer-events-none">
        <div className="flex-1 flex items-center">
          <TypographyLayer heading={heading} subheading={subheading} />
        </div>
      </div>

      {/* Foreground layer */}
      <ParallaxLayer depth={-0.15} className="absolute inset-0 z-[2]">
        <img
          src={`${foregroundDir}/frame_${frameNum}.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </ParallaxLayer>
    </>
  );
}

// Icons
function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
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
  audioSrc: string | null;
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
  const parallaxAudioPlayRef = useRef<(() => void) | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const registerParallaxAudioPlay = useCallback((fn: () => void) => { parallaxAudioPlayRef.current = fn; }, []);
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

  // Handle audio toggle - user gesture context, safe to call .play()
  const handleAudioToggle = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
    if (!muted && parallaxAudioPlayRef.current) {
      parallaxAudioPlayRef.current();
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
            audioSrc={frameMeta.audioSrc}
            heading={heading}
            subheading={subheading}
            isMuted={isMuted}
            onAudioToggle={handleAudioToggle}
            onRegisterAudioPlay={registerParallaxAudioPlay}
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

        {/* Top-left: main title */}
        <div className="absolute top-0 left-0 z-10 flex flex-col gap-0.5 p-6 md:p-8 lg:p-10 pointer-events-auto">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
            {heading}
          </h1>
        </div>

        {/* Top-right: navigation links */}
        <nav className="absolute top-0 right-0 z-10 flex items-center gap-2 p-6 md:p-8 lg:p-10 pointer-events-auto">
          {[
            { to: "/", label: "SIMULATE" },
            { to: "/about", label: "About" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-1.5 rounded-full text-sm font-medium
                         text-white/60 hover:text-white/90
                         hover:bg-white/10 border border-transparent
                         hover:border-white/15
                         backdrop-blur-sm
                         transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Controls - bottom right */}
        <div className="absolute bottom-0 right-0 z-[15] flex items-center gap-3 p-6 md:p-8 lg:p-10 pb-16 pointer-events-auto">
          {/* Audio toggle - for both modes */}
          <AudioToggle isMuted={isMuted} onAudioToggle={handleAudioToggle} />

          {/* Mode toggle - only show if frame mode is available */}
          {frameModeAvailable && (
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full
                         bg-white/10 backdrop-blur-md border border-white/20
                         text-white/80 text-xs font-medium
                         hover:bg-white/20 hover:border-white/30
                         transition-all duration-200"
              title={useFrames ? "Switch to video mode" : "Switch to parallax mode"}
            >
              {useFrames ? (
                <>
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video</span>
                </>
              ) : (
                <>
                  <LayersIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Parallax</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Group */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16 px-8 md:px-16 lg:px-24 pointer-events-auto">
          <ActionGroup ctaText={ctaText} />
        </div>
      </ParallaxContainer>
    </section>
  );
}

// Synchronized frame player with Canvas preloading (no flicker)
function SyncedFramePlayer({
  backgroundDir,
  foregroundDir,
  totalFrames,
  fps,
  heading,
  subheading,
  audioSrc,
  isMuted,
  onRegisterAudioPlay,
}: {
  backgroundDir: string;
  foregroundDir: string;
  totalFrames: number;
  fps: number;
  heading: string;
  subheading?: string;
  audioSrc?: string | null;
  isMuted?: boolean;
  onAudioToggle?: (muted: boolean) => void;
  onRegisterAudioPlay?: (playFn: () => void) => void;
}) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgOffscreenRef = useRef<OffscreenCanvas | null>(null);
  const fgOffscreenRef = useRef<OffscreenCanvas | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const bgImagesRef = useRef<ImageBitmap[]>([]);
  const fgImagesRef = useRef<ImageBitmap[]>([]);
  const currentFrameRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameInterval = 1000 / fps;
  const containerRef = useRef<HTMLDivElement>(null);

  const getFramePath = useCallback(
    (dir: string, frame: number) => {
      const frameNum = String(frame + 1).padStart(4, "0");
      return `${dir}/frame_${frameNum}.png`;
    },
    []
  );

  // Preload all frames and decode them via createImageBitmap (eliminates flicker)
  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const totalCount = totalFrames * 2;

    const loadAndDecode = (
      src: string
    ): Promise<ImageBitmap> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (cancelled) return;
          createImageBitmap(img).then((bitmap) => {
            if (!cancelled) {
              loadedCount++;
              setLoadProgress(Math.round((loadedCount / totalCount) * 100));
              resolve(bitmap);
            }
          }).catch(reject);
        };
        img.onerror = () => { if (!cancelled) reject(new Error(`Failed to load: ${src}`)); };
        img.src = src;
      });

    const loadAll = async () => {
      try {
        const bgPromises = Array.from({ length: totalFrames }, (_, i) =>
          loadAndDecode(getFramePath(backgroundDir, i))
        );
        const fgPromises = Array.from({ length: totalFrames }, (_, i) =>
          loadAndDecode(getFramePath(foregroundDir, i))
        );

        const [bgBitmaps, fgBitmaps] = await Promise.all([
          Promise.all(bgPromises),
          Promise.all(fgPromises),
        ]);

        if (!cancelled) {
          bgImagesRef.current = bgBitmaps;
          fgImagesRef.current = fgBitmaps;
          setLoading(false);
        }
      } catch (err) {
        console.error("Frame preload error:", err);
      }
    };

    loadAll();

    return () => { cancelled = true; };
  }, [backgroundDir, foregroundDir, totalFrames, getFramePath]);

  // Set canvas size to match container after images load
  useEffect(() => {
    if (loading || !bgCanvasRef.current || !fgCanvasRef.current) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      const bgCanvas = bgCanvasRef.current;
      const fgCanvas = fgCanvasRef.current;
      if (!container || !bgCanvas || !fgCanvas) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      bgCanvas.width = w;
      bgCanvas.height = h;
      fgCanvas.width = w;
      fgCanvas.height = h;

      bgOffscreenRef.current = new OffscreenCanvas(w, h);
      fgOffscreenRef.current = new OffscreenCanvas(w, h);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [loading]);

  // Animation loop - double buffered with object-fit: cover
  useEffect(() => {
    if (loading) return;

    const drawCover = (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, bitmap: ImageBitmap, cw: number, ch: number) => {
      const imgRatio = bitmap.width / bitmap.height;
      const canvasRatio = cw / ch;
      let dw: number, dh: number, dx: number, dy: number;

      if (imgRatio > canvasRatio) {
        dh = ch; dw = dh * imgRatio; dx = (cw - dw) / 2; dy = 0;
      } else {
        dw = cw; dh = dw / imgRatio; dx = 0; dy = (ch - dh) / 2;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(bitmap, dx, dy, dw, dh);
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastTimeRef.current >= frameInterval) {
        const frame = currentFrameRef.current;
        currentFrameRef.current = (frame + 1) % totalFrames;
        lastTimeRef.current = timestamp;

        const bgCanvas = bgCanvasRef.current;
        const fgCanvas = fgCanvasRef.current;
        const bgOff = bgOffscreenRef.current;
        const fgOff = fgOffscreenRef.current;
        const bgBitmap = bgImagesRef.current[frame];
        const fgBitmap = fgImagesRef.current[frame];

        if (bgCanvas && bgOff && bgBitmap) {
          const oCtx = bgOff.getContext("2d");
          if (oCtx) { drawCover(oCtx, bgBitmap, bgOff.width, bgOff.height); }
          const vCtx = bgCanvas.getContext("2d");
          if (vCtx) { vCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); vCtx.drawImage(bgOff, 0, 0, bgCanvas.width, bgCanvas.height); }
        }

        if (fgCanvas && fgOff && fgBitmap) {
          const oCtx = fgOff.getContext("2d");
          if (oCtx) { drawCover(oCtx, fgBitmap, fgOff.width, fgOff.height); }
          const vCtx = fgCanvas.getContext("2d");
          if (vCtx) { vCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height); vCtx.drawImage(fgOff, 0, 0, fgCanvas.width, fgCanvas.height); }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [loading, frameInterval, totalFrames]);

  // Audio: register play fn with parent, sync muted state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playFn = () => { audio.play().catch(() => {}); };
    if (onRegisterAudioPlay) { onRegisterAudioPlay(playFn); }

    audio.muted = isMuted ?? true;

    return () => { if (onRegisterAudioPlay) { onRegisterAudioPlay(() => {}); } };
  }, [isMuted, onRegisterAudioPlay]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--smtcColorTextPrimary)]">
        <div className="text-white/60 text-lg mb-3">Loading frames...</div>
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--smtcColorBgBrandFilled)] rounded-full transition-all duration-150"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
        <div className="text-white/40 text-sm mt-2">{loadProgress}%</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0">
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      {/* Layer 0: Background canvas */}
      <div className="absolute inset-0 z-0">
        <canvas
          ref={bgCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: "block" }}
        />
      </div>

      {/* Layer 1: Typography - sandwiched between bg and foreground person */}
      <div className="absolute inset-0 z-[1] flex flex-col h-full pointer-events-none">
        <div className="flex-1 flex items-center">
          <TypographyLayer heading={heading} subheading={subheading} />
        </div>
      </div>

      {/* Layer 2: Foreground canvas (transparent person) */}
      <div className="absolute inset-0 z-[2]">
        <canvas
          ref={fgCanvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: "block" }}
        />
      </div>
    </div>
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

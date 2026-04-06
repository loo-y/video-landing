import { useRef, useEffect, useState, useCallback } from "react";
import { Application, Container, Sprite, Texture } from "pixi.js";
import { TypographyLayer } from "./TypographyLayer";

interface PixiFramePlayerProps {
  backgroundDir: string;
  foregroundDir: string;
  totalFrames: number;
  fps: number;
  heading: string;
  subheading?: string;
  audioSrc?: string | null;
  isMuted?: boolean;
  onRegisterAudioPlay?: (playFn: () => void) => void;
  mousePosition?: { x: number; y: number };
}

export function PixiFramePlayer({
  backgroundDir,
  foregroundDir,
  totalFrames,
  fps,
  heading,
  subheading,
  audioSrc,
  isMuted = true,
  onRegisterAudioPlay,
  mousePosition = { x: 0, y: 0 },
}: PixiFramePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const bgContainerRef = useRef<Container | null>(null);
  const fgContainerRef = useRef<Container | null>(null);
  const bgSpritesRef = useRef<Sprite[]>([]);
  const fgSpritesRef = useRef<Sprite[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Initializing...");

  const currentFrameRef = useRef(0);
  const frameInterval = 1000 / fps;
  const breatheTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  const bgTargetRef = useRef({ x: 0, y: 0 });
  const fgTargetRef = useRef({ x: 0, y: 0 });
  const bgCurrentRef = useRef({ x: 0, y: 0 });
  const fgCurrentRef = useRef({ x: 0, y: 0 });

  const getFramePath = useCallback(
    (dir: string, frame: number) => {
      const frameNum = String(frame + 1).padStart(4, "0");
      return `${dir}/frame_${frameNum}.png`;
    },
    []
  );

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const init = async () => {
      try {
        const container = containerRef.current!;
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        setStatus("Creating PixiJS app...");

        const app = new Application();
        await app.init({
          width,
          height,
          backgroundColor: 0x121826,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (cancelled) {
          app.destroy(true);
          return;
        }

        // Append canvas to container
        const canvas = app.canvas as HTMLCanvasElement;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        container.appendChild(canvas);

        appRef.current = app;
        setStatus("Creating layers...");

        // Create containers
        const bgContainer = new Container();
        bgContainer.zIndex = 0;
        app.stage.addChild(bgContainer);
        bgContainerRef.current = bgContainer;

        const fgContainer = new Container();
        fgContainer.zIndex = 2;
        app.stage.addChild(fgContainer);
        fgContainerRef.current = fgContainer;

        app.stage.sortableChildren = true;

        setStatus("Loading frames...");

        // Load frames
        const bgBitmaps: ImageBitmap[] = [];
        const fgBitmaps: ImageBitmap[] = [];
        let loadedCount = 0;
        const totalCount = totalFrames * 2;

        const loadBitmap = (src: string): Promise<ImageBitmap> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              createImageBitmap(img)
                .then(resolve)
                .catch((e) => reject(new Error(`Bitmap error: ${e}`)));
            };
            img.onerror = () => reject(new Error(`Failed: ${src}`));
            img.src = src;
          });
        };

        // Batch load
        const batchSize = 20;
        for (let batch = 0; batch < Math.ceil(totalFrames / batchSize); batch++) {
          if (cancelled) return;

          const start = batch * batchSize;
          const end = Math.min(start + batchSize, totalFrames);

          const promises: Promise<void>[] = [];
          for (let i = start; i < end; i++) {
            promises.push(
              (async () => {
                const bgPath = getFramePath(backgroundDir, i);
                const fgPath = getFramePath(foregroundDir, i);
                const [bgBitmap, fgBitmap] = await Promise.all([
                  loadBitmap(bgPath),
                  loadBitmap(fgPath),
                ]);
                bgBitmaps[i] = bgBitmap;
                fgBitmaps[i] = fgBitmap;
                loadedCount += 2;
                setLoadProgress(Math.round((loadedCount / totalCount) * 100));
              })()
            );
          }
          await Promise.all(promises);
        }

        if (cancelled) return;

        setStatus("Creating sprites...");

        // Create sprites
        for (let i = 0; i < totalFrames; i++) {
          const bgTexture = Texture.from(bgBitmaps[i]);
          const fgTexture = Texture.from(fgBitmaps[i]);

          const bgSprite = new Sprite(bgTexture);
          bgSprite.visible = i === 0;
          fitSpriteToContainer(bgSprite, width, height);
          bgContainer.addChild(bgSprite);
          bgSpritesRef.current.push(bgSprite);

          const fgSprite = new Sprite(fgTexture);
          fgSprite.visible = i === 0;
          fitSpriteToContainer(fgSprite, width, height);
          fgContainer.addChild(fgSprite);
          fgSpritesRef.current.push(fgSprite);
        }

        bgContainer.position.set(0, 0);
        fgContainer.position.set(0, 0);

        setLoading(false);
      } catch (err) {
        console.error("PixiJS init error:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    // Wait for container to be rendered
    const timer = setTimeout(init, 50);

    return () => {
      clearTimeout(timer);
      cancelled = true;
      if (appRef.current) {
        try {
          appRef.current.destroy(true);
        } catch (e) {}
        appRef.current = null;
      }
      bgSpritesRef.current = [];
      fgSpritesRef.current = [];
    };
  }, [backgroundDir, foregroundDir, totalFrames, getFramePath]);

  // Resize handler
  useEffect(() => {
    if (!appRef.current || loading) return;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !appRef.current) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      appRef.current.renderer.resize(width, height);

      bgSpritesRef.current.forEach((sprite) => {
        fitSpriteToContainer(sprite, width, height);
      });
      fgSpritesRef.current.forEach((sprite) => {
        fitSpriteToContainer(sprite, width, height);
      });

      if (bgContainerRef.current) {
        bgContainerRef.current.position.set(0, 0);
      }
      if (fgContainerRef.current) {
        fgContainerRef.current.position.set(0, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loading]);

  // Animation loop
  useEffect(() => {
    if (loading || !appRef.current) return;

    let animationId: number;

    const animate = (timestamp: number) => {
      if (!appRef.current) return;

      // Frame switching
      if (timestamp - lastFrameTimeRef.current >= frameInterval) {
        const prevFrame = currentFrameRef.current;
        const nextFrame = (prevFrame + 1) % totalFrames;

        if (bgSpritesRef.current[prevFrame]) {
          bgSpritesRef.current[prevFrame].visible = false;
        }
        if (bgSpritesRef.current[nextFrame]) {
          bgSpritesRef.current[nextFrame].visible = true;
        }
        if (fgSpritesRef.current[prevFrame]) {
          fgSpritesRef.current[prevFrame].visible = false;
        }
        if (fgSpritesRef.current[nextFrame]) {
          fgSpritesRef.current[nextFrame].visible = true;
        }

        currentFrameRef.current = nextFrame;
        lastFrameTimeRef.current = timestamp;
      }

      // Breathing
      breatheTimeRef.current += 0.008;
      const breatheScale = 1 + Math.sin(breatheTimeRef.current) * 0.015;
      if (fgContainerRef.current) {
        fgContainerRef.current.scale.set(breatheScale);
      }

      // Parallax - move container position
      const lerpFactor = 0.08;
      bgCurrentRef.current.x += (bgTargetRef.current.x - bgCurrentRef.current.x) * lerpFactor;
      bgCurrentRef.current.y += (bgTargetRef.current.y - bgCurrentRef.current.y) * lerpFactor;
      fgCurrentRef.current.x += (fgTargetRef.current.x - fgCurrentRef.current.x) * lerpFactor;
      fgCurrentRef.current.y += (fgTargetRef.current.y - fgCurrentRef.current.y) * lerpFactor;

      if (bgContainerRef.current) {
        bgContainerRef.current.position.set(bgCurrentRef.current.x, bgCurrentRef.current.y);
      }
      if (fgContainerRef.current) {
        fgContainerRef.current.position.set(fgCurrentRef.current.x, fgCurrentRef.current.y);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [loading, frameInterval, totalFrames]);

  // Parallax targets
  useEffect(() => {
    if (loading) return;
    bgTargetRef.current = { x: -mousePosition.x * 15, y: -mousePosition.y * 15 };
    fgTargetRef.current = { x: -mousePosition.x * 40, y: -mousePosition.y * 40 };
  }, [mousePosition, loading]);

  // Audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playFn = () => audio.play().catch(() => {});
    if (onRegisterAudioPlay) onRegisterAudioPlay(playFn);
    audio.muted = isMuted;

    return () => {
      if (onRegisterAudioPlay) onRegisterAudioPlay(() => {});
    };
  }, [isMuted, onRegisterAudioPlay]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center bg-[var(--smtcColorTextPrimary)]">
          <div className="text-white/60 text-lg mb-3">{status}</div>
          <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--smtcColorBgBrandFilled)] rounded-full transition-all duration-150"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <div className="text-white/40 text-sm mt-2">{loadProgress}%</div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-[10] flex flex-col items-center justify-center bg-[var(--smtcColorTextPrimary)]">
          <div className="text-red-400 text-lg mb-2">Error</div>
          <div className="text-white/60 text-sm px-4 text-center">{error}</div>
        </div>
      )}

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

      {/* Typography Layer */}
      <div className="absolute inset-0 z-[1] flex flex-col h-full pointer-events-none">
        <div className="flex-1 flex items-center">
          <TypographyLayer heading={heading} subheading={subheading} />
        </div>
      </div>
    </div>
  );
}

function fitSpriteToContainer(sprite: Sprite, containerWidth: number, containerHeight: number) {
  const textureWidth = sprite.texture.width;
  const textureHeight = sprite.texture.height;
  const imgRatio = textureWidth / textureHeight;
  const containerRatio = containerWidth / containerHeight;

  let scale: number;
  if (imgRatio > containerRatio) {
    // Image is wider - fit height, crop width
    scale = containerHeight / textureHeight;
  } else {
    // Image is taller - fit width, crop height
    scale = containerWidth / textureWidth;
  }

  sprite.scale.set(scale);
  // Anchor at center so position (width/2, height/2) centers the sprite
  sprite.anchor.set(0.5);
  sprite.x = containerWidth / 2;
  sprite.y = containerHeight / 2;
}

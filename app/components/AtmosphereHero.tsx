import { useEffect, useRef, useState } from "react";
import { TypographyLayer } from "./TypographyLayer";

interface AtmosphereHeroProps {
  backgroundSrc: string;
  heading: string;
  subheading?: string;
}

interface SmokeBlob {
  id: number;
  size: number;
  top: number;
  left: number;
  opacity: number;
  blur: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

interface EmberParticle {
  id: number;
  size: number;
  left: number;
  bottom: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
}

const smokeBlobs: SmokeBlob[] = [
  { id: 1, size: 420, top: 8, left: 4, opacity: 0.2, blur: 70, duration: 18, delay: 0, driftX: 90, driftY: -30 },
  { id: 2, size: 520, top: 18, left: 62, opacity: 0.18, blur: 84, duration: 22, delay: -4, driftX: -70, driftY: 20 },
  { id: 3, size: 360, top: 50, left: 18, opacity: 0.16, blur: 58, duration: 16, delay: -9, driftX: 70, driftY: -50 },
  { id: 4, size: 640, top: 54, left: 50, opacity: 0.14, blur: 96, duration: 24, delay: -11, driftX: -110, driftY: -20 },
];

const embers: EmberParticle[] = [
  { id: 1, size: 5, left: 10, bottom: 8, opacity: 0.7, duration: 8, delay: 0, driftX: 18 },
  { id: 2, size: 4, left: 18, bottom: 12, opacity: 0.55, duration: 10, delay: -3, driftX: 24 },
  { id: 3, size: 6, left: 26, bottom: 6, opacity: 0.75, duration: 9, delay: -5, driftX: -18 },
  { id: 4, size: 3, left: 34, bottom: 14, opacity: 0.5, duration: 7.5, delay: -1, driftX: 14 },
  { id: 5, size: 5, left: 43, bottom: 10, opacity: 0.68, duration: 11, delay: -7, driftX: -22 },
  { id: 6, size: 4, left: 52, bottom: 7, opacity: 0.48, duration: 8.5, delay: -2, driftX: 20 },
  { id: 7, size: 6, left: 61, bottom: 5, opacity: 0.72, duration: 10.5, delay: -6, driftX: -20 },
  { id: 8, size: 3, left: 68, bottom: 11, opacity: 0.52, duration: 7, delay: -4, driftX: 12 },
  { id: 9, size: 4, left: 76, bottom: 9, opacity: 0.58, duration: 9.5, delay: -8, driftX: 16 },
  { id: 10, size: 5, left: 84, bottom: 6, opacity: 0.64, duration: 8.2, delay: -2.5, driftX: -14 },
  { id: 11, size: 4, left: 90, bottom: 10, opacity: 0.45, duration: 10.8, delay: -9.5, driftX: 10 },
  { id: 12, size: 3, left: 14, bottom: 18, opacity: 0.42, duration: 6.8, delay: -5.5, driftX: -10 },
];

export function AtmosphereHero({
  backgroundSrc,
  heading,
  subheading,
}: AtmosphereHeroProps) {
  const [blurAmount, setBlurAmount] = useState(10);
  const [zOffset, setZOffset] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const frameRef = useRef<number | null>(null);
  const virtualProgressRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setIsReducedMotion(media.matches);

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      setBlurAmount(0);
      return;
    }

    const start = performance.now();
    const duration = 2000;

    const animateBlur = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setBlurAmount((1 - eased) * 10);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animateBlur);
      }
    };

    frameRef.current = requestAnimationFrame(animateBlur);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) {
      setZOffset(0);
      return;
    }

    let ticking = false;
    let settleTimer: number | null = null;

    const syncDepth = () => {
      const scrollY = window.scrollY;
      const viewport = window.innerHeight || 1;
      const scrollProgress = Math.max(0, Math.min(scrollY / viewport, 1));
      const progress = Math.max(scrollProgress, virtualProgressRef.current);
      setZOffset(progress * 72);
    };

    const updateDepth = () => {
      syncDepth();
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateDepth);
    };

    const settleVirtualProgress = () => {
      if (settleTimer) {
        window.clearTimeout(settleTimer);
      }

      settleTimer = window.setTimeout(() => {
        virtualProgressRef.current = 0;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateDepth);
        }
      }, 180);
    };

    const onWheel = (event: WheelEvent) => {
      virtualProgressRef.current = Math.max(
        0,
        Math.min(1, virtualProgressRef.current + event.deltaY / 1600)
      );

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateDepth);
      }

      settleVirtualProgress();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      const startY = touchStartYRef.current;
      if (currentY == null || startY == null) return;

      const deltaY = startY - currentY;
      touchStartYRef.current = currentY;
      virtualProgressRef.current = Math.max(
        0,
        Math.min(1, virtualProgressRef.current + deltaY / 1200)
      );

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateDepth);
      }

      settleVirtualProgress();
    };

    const onTouchEnd = () => {
      touchStartYRef.current = null;
    };

    updateDepth();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (settleTimer) {
        window.clearTimeout(settleTimer);
      }
    };
  }, [isReducedMotion]);

  const backgroundTransform = isReducedMotion
    ? "scale(1.04)"
    : `translateZ(${zOffset}px) scale(${1.04 + zOffset / 900})`;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--smtcColorTextPrimary)]">
      <div
        className="absolute inset-0"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          className="absolute inset-[-6%]"
          style={{
            transformStyle: "preserve-3d",
            transform: backgroundTransform,
            filter: `blur(${blurAmount}px)`,
            transition: isReducedMotion ? "none" : "transform 120ms ease-out",
            willChange: "transform, filter",
          }}
        >
          <img
            src={backgroundSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 50% 55%, rgba(255,130,36,0.16), transparent 32%),
                linear-gradient(180deg, rgba(7,10,18,0.18) 0%, rgba(7,10,18,0.42) 100%)
              `,
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              mixBlendMode: "screen",
              opacity: 0.9,
            }}
          >
            {smokeBlobs.map((blob) => (
              <span
                key={blob.id}
                className={`absolute rounded-full ${isReducedMotion ? "" : "animate-[smokeDrift_var(--duration)_ease-in-out_infinite_alternate]"}`}
                style={{
                  top: `${blob.top}%`,
                  left: `${blob.left}%`,
                  width: blob.size,
                  height: blob.size,
                  opacity: blob.opacity,
                  filter: `blur(${blob.blur}px)`,
                  background: "radial-gradient(circle, rgba(255,180,112,0.48) 0%, rgba(255,112,32,0.18) 38%, rgba(255,112,32,0) 72%)",
                  transform: "translate3d(0, 0, 0)",
                  animationDelay: `${blob.delay}s`,
                  ["--duration" as string]: `${blob.duration}s`,
                  ["--drift-x" as string]: `${blob.driftX}px`,
                  ["--drift-y" as string]: `${blob.driftY}px`,
                }}
              />
            ))}

            {!isReducedMotion &&
              embers.map((ember) => (
                <span
                  key={ember.id}
                  className="absolute rounded-full animate-[emberFloat_var(--duration)_linear_infinite]"
                  style={{
                    left: `${ember.left}%`,
                    bottom: `${ember.bottom}%`,
                    width: ember.size,
                    height: ember.size,
                    opacity: ember.opacity,
                    boxShadow: "0 0 16px rgba(255,164,70,0.8)",
                    background: "radial-gradient(circle, rgba(255,232,178,1) 0%, rgba(255,160,64,0.95) 42%, rgba(255,120,36,0) 72%)",
                    animationDelay: `${ember.delay}s`,
                    ["--duration" as string]: `${ember.duration}s`,
                    ["--drift-x" as string]: `${ember.driftX}px`,
                  }}
                />
              ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-[2] flex flex-col h-full">
        <div className="flex-1 flex items-center">
          <TypographyLayer heading={heading} subheading={subheading} />
        </div>
      </div>
    </div>
  );
}

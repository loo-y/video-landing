import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";

interface FramePlayerProps {
  backgroundDir: string;
  foregroundDir: string;
  totalFrames: number;
  fps?: number;
  className?: string;
}

export interface FramePlayerRef {
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
}

export const FramePlayer = forwardRef<FramePlayerRef, FramePlayerProps>(
  ({ backgroundDir, foregroundDir, totalFrames, fps = 30, className = "" }, ref) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [loaded, setLoaded] = useState({ background: false, foreground: false });
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const frameInterval = 1000 / fps;

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      get isPlaying() { return isPlaying; },
    }));

    // Animation loop
    useEffect(() => {
      if (!isPlaying) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

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
    }, [isPlaying, frameInterval, totalFrames]);

    // Generate frame filename with padding
    const getFramePath = useCallback(
      (dir: string, frame: number) => {
        const frameNum = String(frame + 1).padStart(4, "0");
        return `${dir}/frame_${frameNum}.png`;
      },
      []
    );

    const handleImageLoad = (type: "background" | "foreground") => {
      setLoaded((prev) => ({ ...prev, [type]: true }));
    };

    const isReady = loaded.background && loaded.foreground;

    return (
      <div className={`absolute inset-0 ${className}`}>
        {/* Background layer */}
        <img
          src={getFramePath(backgroundDir, currentFrame)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => handleImageLoad("background")}
          style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s" }}
        />

        {/* Foreground layer (person with transparent background) */}
        <img
          src={getFramePath(foregroundDir, currentFrame)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => handleImageLoad("foreground")}
          style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s" }}
        />

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--smtcColorTextPrimary)]">
            <div className="text-white/60 text-lg">Loading frames...</div>
          </div>
        )}
      </div>
    );
  }
);

FramePlayer.displayName = "FramePlayer";

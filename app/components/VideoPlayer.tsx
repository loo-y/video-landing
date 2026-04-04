import { useRef, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function VideoPlayer({ src, poster, videoRef }: VideoPlayerProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef || internalRef;

  useEffect(() => {
    if (ref.current) {
      ref.current.play().catch(() => {
        // Autoplay was prevented
      });
    }
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}

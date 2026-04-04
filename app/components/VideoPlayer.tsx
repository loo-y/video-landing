import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export interface VideoPlayerRef {
  getVideoElement: () => HTMLVideoElement | null;
  setMuted: (muted: boolean) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, poster }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      getVideoElement: () => videoRef.current,
      setMuted: (muted: boolean) => {
        if (videoRef.current) {
          videoRef.current.muted = muted;
        }
      },
    }));

    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented
        });
      }
    }, []);

    return (
      <video
        ref={videoRef}
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
);

VideoPlayer.displayName = "VideoPlayer";

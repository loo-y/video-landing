import { useState, useCallback } from "react";

interface ActionGroupProps {
  onAudioToggle?: (muted: boolean) => void;
  ctaText?: string;
}

export function ActionGroup({
  onAudioToggle,
  ctaText = "SQUID",
}: ActionGroupProps) {
  const [isMuted, setIsMuted] = useState(true);

  const handleAudioToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onAudioToggle?.(newMuted);
  }, [isMuted, onAudioToggle]);

  return (
    <div className="flex items-center gap-4 mt-8">
      {/* Primary CTA Button */}
      <button
        className="min-w-[165px] px-6 h-[56px] rounded-[4px]
                   bg-[var(--smtcColorBgBrandFilled)]
                   text-[var(--smtcColorTextContentWhite)]
                   text-[18px] leading-[24px] font-bold
                   cursor-pointer
                   hover:bg-[var(--smtcColorBgBrandFilled)]/90
                   transition-colors duration-200
                   flex items-center justify-center gap-2"
      >
        {ctaText}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      {/* Audio Toggle */}
      <button
        onClick={handleAudioToggle}
        className="w-12 h-12 rounded-full
                   bg-white/10 backdrop-blur-sm
                   border border-white/20
                   flex items-center justify-center
                   cursor-pointer
                   hover:bg-white/20
                   transition-colors duration-200"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
    </div>
  );
}

import { Volume2, VolumeX } from "lucide-react";

interface ActionGroupProps {
  ctaText?: string;
}

export function ActionGroup({ ctaText = "EXPLORE" }: ActionGroupProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Primary CTA Button */}
      <button
        className="min-w-[165px] px-6 h-[56px] rounded-[4px]
                   bg-[var(--smtcColorBgBrandFilled)]
                   text-[var(--smtcColorTextContentWhite)]
                   text-[18px] leading-[24px] font-bold
                   cursor-pointer
                   hover:bg-[var(--smtcColorBgBrandFilled)]/90
                   transition-all duration-200
                   flex items-center justify-center gap-2
                   shadow-[0_8px_20px_0_rgba(15,41,77,0.12)]
                   hover:shadow-[0_12px_28px_0_rgba(15,41,77,0.18)]
                   hover:-translate-y-0.5"
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
    </div>
  );
}

interface AudioToggleProps {
  isMuted: boolean;
  onAudioToggle: (muted: boolean) => void;
}

export function AudioToggle({ isMuted, onAudioToggle }: AudioToggleProps) {
  const handleClick = () => {
    onAudioToggle(!isMuted);
  };

  return (
    <button
      onClick={handleClick}
      className="w-12 h-12 rounded-full
                 bg-white/10 backdrop-blur-md
                 border border-white/20
                 flex items-center justify-center
                 cursor-pointer
                 hover:bg-white/20 hover:border-white/30
                 transition-all duration-200
                 group"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? (
        <VolumeX
          size={22}
          className="text-white/80 group-hover:text-white transition-colors"
        />
      ) : (
        <Volume2
          size={22}
          className="text-white group-hover:text-white/90 transition-colors"
        />
      )}
    </button>
  );
}

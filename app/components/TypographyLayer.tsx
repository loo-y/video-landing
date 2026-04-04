import { useRef, useEffect } from "react";
import gsap from "gsap";

interface TypographyLayerProps {
  heading?: string;
  subheading?: string;
}

export function TypographyLayer({
  heading = "SIMULATE",
  subheading,
}: TypographyLayerProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading letters
      if (headingRef.current) {
        const letters = headingRef.current.querySelectorAll(".letter");
        gsap.fromTo(
          letters,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "power4.out",
            delay: 0.2,
          }
        );
      }

      // Animate subheading
      if (subheadingRef.current) {
        gsap.fromTo(
          subheadingRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.8,
            ease: "power2.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Split heading into letters for animation
  const letters = heading.split("");

  return (
    <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 md:px-16 lg:px-24">
      <h1
        ref={headingRef}
        className="text-[var(--smtcColorTextContentWhite)] text-7xl md:text-8xl lg:text-9xl font-bold uppercase tracking-tighter leading-[0.9]"
      >
        {letters.map((letter, index) => (
          <span key={index} className="letter inline-block">
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </h1>

      {subheading && (
        <p
          ref={subheadingRef}
          className="mt-6 text-[var(--smtcColorTextContentWhite)] text-lg md:text-xl leading-[28px] max-w-md opacity-90"
        >
          {subheading}
        </p>
      )}
    </div>
  );
}

import type { Route } from "./+types/home";
import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { HeroSection } from "../components/HeroSection";
import { ProductsPage } from "../components/ProductsPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SIMULATE - Immersive Video Landing" },
    { name: "description", content: "An immersive video landing page experience" },
  ];
}

export default function Home() {
  const videoSrc = "/videos/bg-video.mp4";
  const heroRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const [isExplored, setIsExplored] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [firstFrameSrc, setFirstFrameSrc] = useState<string | null>(null);

  const handleExplore = useCallback(() => {
    if (isTransitioning || isExplored) return;
    setIsTransitioning(true);

    // Pause video when transitioning
    const video = document.querySelector("video");
    if (video) {
      video.pause();

      // Capture first frame from video for products page banner
      if (!firstFrameSrc) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setFirstFrameSrc(canvas.toDataURL("image/jpeg", 0.9));
        }
      }
    }

    // Create transition timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setIsExplored(true);
        setIsTransitioning(false);
      },
    });

    // Video container scale up and fade out
    if (heroRef.current) {
      tl.to(
        heroRef.current,
        {
          scale: 1.5,
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );
    }

    // Products page fade in
    if (productsRef.current) {
      gsap.set(productsRef.current, { opacity: 0 });
      tl.to(
        productsRef.current,
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        0.6
      );
    }
  }, [isTransitioning, isExplored, firstFrameSrc]);

  const handleBackToHero = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsExplored(false);
        setIsTransitioning(false);
      },
    });

    // Products page fade out
    if (productsRef.current) {
      tl.to(productsRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      });
    }

    // Hero fade back in
    if (heroRef.current) {
      tl.to(
        heroRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        0.3
      );
    }
  }, [isTransitioning]);

  return (
    <div className="relative w-full min-h-screen bg-[var(--smtcColorTextPrimary)]">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className={`fixed inset-0 z-10 ${isExplored ? "pointer-events-none" : ""}`}
      >
        <HeroSection
          videoSrc={videoSrc}
          heading="SIMULATE"
          subheading="Experience the future of immersive digital content"
          ctaText="EXPLORE"
          onExplore={handleExplore}
          isTransitioning={isTransitioning}
        />
      </div>

      {/* Products Page - always in DOM for SEO, hidden with CSS */}
      <div
        ref={productsRef}
        className={`fixed inset-0 z-20 transition-opacity duration-300 ${!isExplored && !isTransitioning ? "opacity-0 pointer-events-none" : ""}`}
      >
        <ProductsPage bannerSrc={firstFrameSrc || "/images/bg.png"} />
      </div>
    </div>
  );
}

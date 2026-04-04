import type { Route } from "./+types/home";
import { HeroSection } from "../components/HeroSection";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SIMULATE - Immersive Video Landing" },
    { name: "description", content: "An immersive video landing page experience" },
  ];
}

export default function Home() {
  // Video from public folder
  const videoSrc = "/hero-video.mp4";

  return (
    <HeroSection
      videoSrc={videoSrc}
      heading="SIMULATE"
      subheading="Experience the future of immersive digital content"
      ctaText="EXPLORE"
    />
  );
}

import { Link } from "react-router";
import type { Route } from "./+types/labs.smoke";
import { SmokeLabScene } from "../components/SmokeLabScene";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Smoke Lab - SIMULATE" },
    {
      name: "description",
      content: "Three.js and WebGL smoke experiment page for cinematic atmospheric motion.",
    },
  ];
}

export default function SmokeLabRoute() {
  return (
    <main className="bg-[#05070d]">
      <Link
        to="/"
        className="fixed left-6 top-6 z-30 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-4 py-2 text-sm font-medium text-white/78 backdrop-blur-md transition-colors hover:text-white"
      >
        <span aria-hidden="true">←</span>
        <span>Back to home</span>
      </Link>

      <SmokeLabScene
        backgroundSrc="/images/bg.png"
        smokeTextures={[
          "/images/smoke/smoke-1.svg",
          "/images/smoke/smoke-2.svg",
          "/images/smoke/smoke-3.svg",
        ]}
      />
    </main>
  );
}

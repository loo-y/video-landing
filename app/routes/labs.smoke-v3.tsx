import { Link } from "react-router";
import type { Route } from "./+types/labs.smoke-v3";
import { SmokeLabSceneV3 } from "../components/SmokeLabSceneV3";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Smoke Lab V3 - SIMULATE" },
    {
      name: "description",
      content: "Separated smoke plume experiment page built with Three.js and WebGL shaders.",
    },
  ];
}

export default function SmokeLabV3Route() {
  return (
    <main className="bg-[#04060b]">
      <div className="fixed left-6 top-6 z-30 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-4 py-2 text-sm font-medium text-white/78 backdrop-blur-md transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span>
          <span>Back to home</span>
        </Link>
        <Link
          to="/labs/smoke-v2"
          className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/22 px-4 py-2 text-sm font-medium text-white/60 backdrop-blur-md transition-colors hover:text-white/84"
        >
          <span>Open smoke v2</span>
        </Link>
      </div>

      <SmokeLabSceneV3 backgroundSrc="/images/bg.png" />
    </main>
  );
}

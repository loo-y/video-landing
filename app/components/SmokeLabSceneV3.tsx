import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SmokeLabSceneV3Props {
  backgroundSrc: string;
}

const plumeVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const plumeFragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uAspect;
  uniform float uSeed;
  uniform float uIntensity;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 456.21));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = p * 2.0 + vec2(17.3, 9.1);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - vec2(0.5, 0.0);
    p.x *= uAspect;

    float t = uTime * (0.12 + uSeed * 0.03);
    float vertical = uv.y;

    float lowFreq = fbm(vec2(vertical * 1.6 - t * 0.7, uSeed * 13.0));
    float highFreq = fbm(vec2(vertical * 3.2 - t * 1.1, uSeed * 23.0));
    float sway = sin(t * 1.8 + vertical * 3.4 + uSeed * 5.0) * 0.06;
    sway += (lowFreq - 0.5) * 0.16;
    sway += (highFreq - 0.5) * 0.07;

    float width = mix(0.055, 0.16, smoothstep(0.0, 0.88, vertical));
    width += lowFreq * 0.028;

    float x = p.x - sway;
    float column = exp(-pow(abs(x) / max(width, 0.001), 1.8) * 2.6);

    float breakup = fbm(vec2(x * 3.4 + uSeed * 11.0, vertical * 2.8 - t * 0.9));
    float curl = fbm(vec2(x * 5.8 - uSeed * 7.0, vertical * 6.2 - t * 1.4));
    float billow = fbm(vec2(x * 2.0 + breakup, vertical * 1.8 - t * 0.4));

    float source = smoothstep(0.0, 0.16, vertical) * (1.0 - smoothstep(0.18, 0.34, vertical));
    float body = smoothstep(0.34, 0.84, breakup + billow * 0.7 + curl * 0.3);
    float topFade = 1.0 - smoothstep(0.82, 1.02, vertical + breakup * 0.08);
    float sideFade = 1.0 - smoothstep(0.5, 1.08, abs(x) + curl * 0.08);
    float bottomFade = smoothstep(-0.04, 0.08, vertical);

    float edgeNoise = fbm(vec2(uv.x * 3.2 + uSeed * 9.0, vertical * 2.4 - t * 0.35));
    float topNoise = fbm(vec2(uv.x * 2.0 + uSeed * 5.0, vertical * 1.6 + 13.0));
    float silhouetteWidth = mix(0.08, 0.22, smoothstep(0.0, 0.9, vertical)) + (edgeNoise - 0.5) * 0.065;
    float silhouette = 1.0 - smoothstep(silhouetteWidth, silhouetteWidth + 0.035, abs(x));
    float crown = 1.0 - smoothstep(0.86 + topNoise * 0.1, 1.02, vertical);
    float blockFade = smoothstep(0.02, 0.12, uv.x) * (1.0 - smoothstep(0.88, 0.98, uv.x));

    float alpha = column * body * topFade * sideFade;
    alpha += column * source * 0.68;
    alpha *= silhouette * crown * bottomFade * blockFade;
    alpha *= uIntensity;

    vec3 deep = vec3(0.14, 0.14, 0.16);
    vec3 mid = vec3(0.34, 0.35, 0.38);
    vec3 light = vec3(0.72, 0.74, 0.78);

    float highlight = smoothstep(0.4, 0.96, billow + breakup * 0.45);
    vec3 color = mix(deep, mid, highlight);
    color = mix(color, light, pow(max(column, 0.0), 2.2) * 0.2 + topFade * 0.08);

    alpha = clamp(alpha, 0.0, 0.92);
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function SmokeLabSceneV3({ backgroundSrc }: SmokeLabSceneV3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const cleanupFns: Array<() => void> = [];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.1));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        38,
        container.clientWidth / Math.max(container.clientHeight, 1),
        0.1,
        100
      );
      camera.position.set(0, 0.2, 9);
      camera.lookAt(0, -0.4, 0);

      const planes: Array<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>> = [];
      const materials: THREE.ShaderMaterial[] = [];
      const plumes = [
        { x: 0.0, y: -2.25, z: -2.6, w: 3.0, h: 14.5, intensity: 1.24, seed: 0.42 },
      ];

      plumes.forEach((plume, index) => {
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uAspect: { value: plume.w / plume.h },
            uSeed: { value: plume.seed },
            uIntensity: { value: plume.intensity },
          },
          vertexShader: plumeVertexShader,
          fragmentShader: plumeFragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        plane.position.set(plume.x, plume.y, plume.z);
        plane.scale.set(plume.w, plume.h, 1);
        plane.renderOrder = index;
        scene.add(plane);
        planes.push(plane);
        materials.push(material);
      });

      const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);
      cleanupFns.push(() => window.removeEventListener("resize", handleResize));

      const clock = new THREE.Clock();
      const animate = () => {
        if (disposed) return;

        const elapsed = reducedMotion ? 0 : clock.getElapsedTime();

        materials.forEach((material) => {
          material.uniforms.uTime.value = elapsed;
        });

        planes.forEach((plane, index) => {
          if (reducedMotion) return;
          const baseX = plumes[index].x;
          const baseY = plumes[index].y;
          plane.position.x = baseX + Math.sin(elapsed * 0.18 + 0.8) * 0.08;
          plane.position.y = baseY + Math.sin(elapsed * 0.16 + 0.3) * 0.05;
          plane.rotation.z = Math.sin(elapsed * 0.07 + 0.5) * 0.018;
        });

        renderer.render(scene, camera);
        frameRef.current = requestAnimationFrame(animate);
      };

      frameRef.current = requestAnimationFrame(animate);
      setIsReady(true);

      cleanupFns.push(() => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        planes.forEach((plane) => plane.geometry.dispose());
        materials.forEach((material) => material.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
      });
    } catch (error) {
      console.error("Smoke lab v3 init failed:", error);
      setWebglFailed(true);
    }

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
      if (rendererRef.current?.domElement.parentNode === container) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current = null;
    };
  }, []);

  return (
    <div className="relative min-h-[220dvh] bg-[#04060b] text-white">
      <div className="fixed inset-0 overflow-hidden">
        <img
          src={backgroundSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1800ms] ease-out ${isReady ? "scale-[1.02] blur-[2px] brightness-[0.2] saturate-[0.25] contrast-[0.85]" : "scale-[1.06] blur-[12px] brightness-[0.16] saturate-[0.18]"}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,6,0.42)_0%,rgba(2,3,6,0.72)_38%,rgba(2,3,6,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,6,0.92)_0%,rgba(2,3,6,0.56)_46%,rgba(2,3,6,0.82)_100%)]" />
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-opacity duration-[1800ms] ease-out ${isReady ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(180deg,rgba(10,11,14,0)_0%,rgba(10,11,14,0.26)_42%,rgba(10,11,14,0.58)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1450px] items-center px-8 py-24 md:px-14 lg:px-20">
          <div className="max-w-[620px]">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-black/24 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.35em] text-white/66 backdrop-blur-md">
              Smoke Lab V3 / Separated Plumes
            </div>
            <h1 className="max-w-[11ch] text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white md:text-7xl">
              Distinct smoke plumes instead of one giant blended haze.
            </h1>
            <p className="mt-6 max-w-[55ch] text-base leading-7 text-white/68 md:text-lg">
              This version abandons the full-screen fog field and focuses on a single narrow plume
              rising from the lower frame so we can validate the silhouette before adding complexity.
            </p>
          </div>
        </div>

        {webglFailed && (
          <div className="absolute bottom-8 left-8 z-20 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/70 backdrop-blur-md">
            WebGL failed to initialize. Static background fallback is active.
          </div>
        )}
      </div>

      <div className="relative z-20 mx-auto flex max-w-[1450px] flex-col gap-24 px-8 pb-28 pt-[112dvh] md:px-14 lg:px-20">
        <section className="grid gap-8 md:grid-cols-[1.06fr_0.94fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/24 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/44">What changed</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">
              The smoke is now reduced to a single long plume with clear negative space around it.
            </h2>
            <p className="mt-4 max-w-[58ch] text-sm leading-7 text-white/64">
              This should read less like a fog filter and more like one distinct smoke column rising
              from a specific source near the bottom edge.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SmokeLabSceneV2Props {
  backgroundSrc: string;
}

const smokeVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const smokeFragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;
  uniform float uLayer;
  uniform float uIntensity;
  uniform float uPlume;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
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

    return mix(a, b, u.x)
      + (c - a) * u.y * (1.0 - u.x)
      + (d - b) * u.x * u.y;
  }

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.58;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = rotate2d(0.38) * p * 2.0 + vec2(17.2, 9.4);
      amplitude *= 0.56;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= uAspect;

    float scrollInfluence = clamp(uScroll, 0.0, 1.0);
    float autoRise = 0.18 + sin(uTime * 0.08 + uLayer * 2.7 + uPlume * 3.2) * 0.05;
    float motion = clamp(scrollInfluence * 0.82 + autoRise, 0.0, 1.0);

    float zoom = mix(1.08, 0.9, motion);
    p /= zoom;
    p.y += 0.08 + uLayer * 0.03 - motion * 0.06;

    float time = uTime * (0.16 + uLayer * 0.022);
    vec2 flow = vec2(sin(uTime * 0.06 + uLayer * 4.0 + uPlume * 4.6) * 0.08, -time);

    vec2 warpA = vec2(
      fbm(p * 1.25 + flow + 4.0 + uLayer * 7.3),
      fbm(p * 1.45 - flow * 0.7 + 11.0 + uLayer * 5.1)
    );
    vec2 warpB = vec2(
      fbm(p * 2.1 + warpA * 1.0 + 19.0),
      fbm(p * 1.9 - warpA * 0.7 + 23.0)
    );

    p += (warpA - 0.5) * (0.55 + uLayer * 0.1);
    p += (warpB - 0.5) * 0.18;

    float body = fbm(p * 1.9 + flow);
    float detail = fbm(p * 3.8 - flow * 1.2 + body * 0.7);
    float curl = fbm(p * 5.6 + vec2(body, detail) * 1.2 + uLayer * 13.0);

    float smoke = body * 0.7 + detail * 0.46 + curl * 0.3;

    float plumeCore = exp(-pow(abs(p.x) * (1.95 - uLayer * 0.22), 1.28));
    float baseBulb = exp(-pow(abs(p.x) * (1.1 - uLayer * 0.08), 1.05)) * smoothstep(1.18, 0.52, uv.y);
    float riseMask = smoothstep(1.15, 0.08, uv.y);
    float capMask = smoothstep(0.0, 0.74, uv.y);
    float sideFade = 1.0 - smoothstep(0.28, 0.98, abs(p.x));
    float breakup = smoothstep(0.32, 0.92, smoke + plumeCore * 0.35);
    float sourceMask = max(plumeCore * riseMask, baseBulb * 1.22);
    float wisp = smoothstep(0.4, 0.92, smoke + curl * 0.24) * capMask;

    smoke += sourceMask * 0.42 + wisp * 0.16;

    float dense = smoothstep(0.42, 0.92, smoke);
    float veil = smoothstep(0.24, 0.84, smoke + sourceMask * 0.3);
    float alpha = dense * sourceMask * (0.9 + uLayer * 0.16) + veil * sideFade * 0.22;
    alpha *= breakup;
    alpha *= smoothstep(1.06, 0.02, uv.y);
    alpha *= uIntensity;

    vec3 deep = vec3(0.28, 0.03, 0.05);
    vec3 mid = vec3(0.62, 0.08, 0.12);
    vec3 light = vec3(0.96, 0.2, 0.16);

    float brightness = smoothstep(0.34, 0.98, smoke + sourceMask * 0.18);
    vec3 color = mix(deep, mid, brightness);
    color = mix(color, light, wisp * 0.28 + dense * 0.14);

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

export function SmokeLabSceneV2({ backgroundSrc }: SmokeLabSceneV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(window.innerHeight * 2.2, 1);
      progressRef.current = Math.min(window.scrollY / maxScroll, 1);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const cleanupFns: Array<() => void> = [];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initScene = () => {
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
          40,
          container.clientWidth / Math.max(container.clientHeight, 1),
          0.1,
          100
        );
        camera.position.set(0, 0.35, 10);

        const materials: THREE.ShaderMaterial[] = [];
        const planes: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
        const layerConfigs = [
          { x: -2.8, z: -5.4, scale: [8.2, 12.5] as const, y: -0.95, layer: 0.22, intensity: 1.4, plume: 0.14 },
          { x: 0.0, z: -3.6, scale: [10.6, 15.4] as const, y: -1.15, layer: 0.58, intensity: 1.62, plume: 0.52 },
          { x: 2.4, z: -2.2, scale: [7.8, 11.6] as const, y: -1.05, layer: 0.96, intensity: 1.48, plume: 0.88 },
        ];

        layerConfigs.forEach((config, index) => {
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uScroll: { value: 0 },
              uAspect: { value: container.clientWidth / Math.max(container.clientHeight, 1) },
              uLayer: { value: config.layer },
              uIntensity: { value: config.intensity },
              uPlume: { value: config.plume },
            },
            vertexShader: smokeVertexShader,
            fragmentShader: smokeFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
          });

          const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), material);
          plane.position.set(config.x, config.y, config.z);
          plane.scale.set(config.scale[0], config.scale[1], 1);
          plane.renderOrder = index;
          scene.add(plane);
          materials.push(material);
          planes.push(plane);
        });

        const handleResize = () => {
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          materials.forEach((material) => {
            material.uniforms.uAspect.value = width / Math.max(height, 1);
          });
        };

        window.addEventListener("resize", handleResize);
        cleanupFns.push(() => window.removeEventListener("resize", handleResize));

        const clock = new THREE.Clock();
        const animate = () => {
          if (disposed) return;

          const elapsed = clock.getElapsedTime();
          const scroll = progressRef.current;
          const autoProgress = prefersReducedMotion
            ? 0.08
            : 0.22 + Math.sin(elapsed * 0.16) * 0.05;
          const motionProgress = Math.max(scroll, autoProgress);

          materials.forEach((material, index) => {
            material.uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed;
            material.uniforms.uScroll.value = motionProgress;
            const baseIntensity = 1.4 + index * 0.14;
            material.uniforms.uIntensity.value = prefersReducedMotion
              ? baseIntensity * 0.72
              : baseIntensity;
          });

          planes.forEach((plane, index) => {
            if (prefersReducedMotion) return;
            plane.position.x = layerConfigs[index].x
              + Math.sin(elapsed * (0.1 + index * 0.035) + index * 1.8) * (0.2 + index * 0.05);
            plane.position.y = layerConfigs[index].y
              + Math.sin(elapsed * (0.14 + index * 0.04) + index * 1.7) * (0.05 + index * 0.015)
              + motionProgress * (0.14 + index * 0.05);
            plane.rotation.z = Math.sin(elapsed * (0.06 + index * 0.025) + index) * 0.04;
          });

          camera.position.z = 10 - motionProgress * 2.9;
          camera.position.y = 0.35 + motionProgress * 0.42;
          camera.lookAt(0, 0, -4);

          renderer.render(scene, camera);
          frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);
        setIsReady(true);

        cleanupFns.push(() => {
          if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
          }
          planes.forEach((plane) => {
            plane.geometry.dispose();
          });
          materials.forEach((material) => {
            material.dispose();
          });
          renderer.dispose();
          renderer.forceContextLoss();
        });
      } catch (error) {
        console.error("Smoke lab v2 scene init failed:", error);
        setWebglFailed(true);
      }
    };

    initScene();

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
    <div className="relative min-h-[320dvh] bg-[#04060b] text-white">
      <div className="fixed inset-0 overflow-hidden">
        <img
          src={backgroundSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2200ms] ease-out ${isReady ? "scale-[1.03] blur-[2px] brightness-[0.24] saturate-[0.32] contrast-[0.86]" : "scale-[1.08] blur-[14px] brightness-[0.2] saturate-[0.26]"}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,3,6,0.5)_0%,rgba(2,3,6,0.74)_34%,rgba(2,3,6,0.94)_100%)]" />
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-all duration-[2200ms] ease-out ${isReady ? "opacity-100 blur-0" : "opacity-0 blur-[14px]"}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,6,0.96)_0%,rgba(2,3,6,0.56)_44%,rgba(2,3,6,0.8)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(2,3,6,0.06)_40%,rgba(2,3,6,0.42)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1450px] items-center px-8 py-24 md:px-14 lg:px-20">
          <div className="max-w-[620px]">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-black/24 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.35em] text-white/66 backdrop-blur-md">
              Smoke Lab V2 / Shader Field
            </div>
            <h1 className="max-w-[11ch] text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white md:text-7xl">
              Thicker smoke, generated as a live noise field instead of sprite clouds.
            </h1>
            <p className="mt-6 max-w-[55ch] text-base leading-7 text-white/68 md:text-lg">
              This scene stops faking smoke with independent particles. The visible mass now comes
              from layered shader planes driven by procedural noise, warped flow fields, and
              scroll-based camera push.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/62">
              <span className="rounded-full border border-white/10 bg-black/24 px-4 py-2 backdrop-blur-md">
                Procedural smoke field
              </span>
              <span className="rounded-full border border-white/10 bg-black/24 px-4 py-2 backdrop-blur-md">
                Layered shader planes
              </span>
              <span className="rounded-full border border-white/10 bg-black/24 px-4 py-2 backdrop-blur-md">
                Real WebGL motion
              </span>
            </div>
          </div>
        </div>

        {webglFailed && (
          <div className="absolute bottom-8 left-8 z-20 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/70 backdrop-blur-md">
            WebGL failed to initialize. Static background fallback is active.
          </div>
        )}
      </div>

      <div className="relative z-20 mx-auto flex max-w-[1450px] flex-col gap-40 px-8 pb-28 pt-[115dvh] md:px-14 lg:px-20">
        <section className="grid gap-8 md:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/6 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#ffb670]">What changed</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">
              The smoke body is continuous now, not assembled from drifting cutouts.
            </h2>
            <p className="mt-4 max-w-[58ch] text-sm leading-7 text-white/64">
              The density map is synthesized in the fragment shader, then stacked across multiple
              planes to create heavier foreground plumes, softer back haze, and a more convincing
              vertical rise. It should read closer to smoke even before you think about particles.
            </p>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-black/24 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">What to inspect</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/62">
              <li>Look for broad, merging smoke masses rather than individual moving shapes.</li>
              <li>Scroll and check whether the camera push feels like entering a smoke volume.</li>
              <li>Watch the idle state and see if the plume still feels alive without mouse input.</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          <MetricCard label="Renderer" value="Three.js" />
          <MetricCard label="Backend" value="WebGL shader" />
          <MetricCard label="Smoke strategy" value="Procedural layered field" />
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-7 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

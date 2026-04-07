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
    float amplitude = 0.55;

    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p);
      p = rotate2d(0.42) * p * 2.02 + vec2(17.2, 9.4);
      amplitude *= 0.54;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv - 0.5;
    p.x *= uAspect;

    float zoom = mix(1.32, 0.92, uScroll);
    p /= zoom;
    p.y += 0.2 + uLayer * 0.045;

    float time = uTime * (0.12 + uLayer * 0.02);
    vec2 flow = vec2(0.0, -time);

    vec2 warpA = vec2(
      fbm(p * 1.4 + flow + 4.0 + uLayer * 7.3),
      fbm(p * 1.6 - flow * 0.7 + 11.0 + uLayer * 5.1)
    );
    vec2 warpB = vec2(
      fbm(p * 2.8 + warpA * 1.2 + 19.0),
      fbm(p * 2.4 - warpA * 0.8 + 23.0)
    );

    p += (warpA - 0.5) * (0.85 + uLayer * 0.18);
    p += (warpB - 0.5) * 0.35;

    float body = fbm(p * 2.0 + flow);
    float detail = fbm(p * 4.8 - flow * 1.4 + body * 0.8);
    float curl = fbm(p * 8.5 + vec2(body, detail) * 1.6 + uLayer * 13.0);

    float smoke = body * 0.58 + detail * 0.34 + curl * 0.26;

    float baseRise = smoothstep(1.25, 0.04, uv.y + uLayer * 0.02);
    float centerColumn = exp(-abs(p.x) * (1.2 - uLayer * 0.18)) * (1.0 - uv.y * 0.72);
    float edgeFade = 1.0 - smoothstep(0.18, 1.1, length(p * vec2(0.9, 1.15)));
    float topWisps = smoothstep(0.2, 0.82, smoke + curl * 0.18) * smoothstep(1.05, 0.16, uv.y);

    smoke += centerColumn * 0.32 + edgeFade * 0.18 + topWisps * 0.22;

    float dense = smoothstep(0.46, 0.9, smoke);
    float veil = smoothstep(0.28, 0.84, smoke + centerColumn * 0.2);
    float alpha = dense * baseRise * (0.48 + uLayer * 0.16) + veil * 0.24;
    alpha *= smoothstep(1.08, 0.02, uv.y);
    alpha *= uIntensity;

    vec3 cool = vec3(0.09, 0.10, 0.13);
    vec3 mid = vec3(0.33, 0.29, 0.24);
    vec3 warm = vec3(0.72, 0.49, 0.29);
    vec3 ember = vec3(1.0, 0.62, 0.26);

    float warmth = smoothstep(0.38, 0.92, smoke + centerColumn * 0.28);
    vec3 color = mix(cool, mid, warmth);
    color = mix(color, warm, pow(max(centerColumn, 0.0), 1.8) * 0.58);
    color += ember * pow(max(centerColumn, 0.0), 3.0) * 0.14;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.96));
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
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
          { z: -7.2, scale: [28, 19] as const, y: -0.1, layer: 0.18, intensity: 0.9, opacity: 1.0 },
          { z: -4.6, scale: [24, 16] as const, y: -0.45, layer: 0.52, intensity: 1.12, opacity: 0.88 },
          { z: -2.1, scale: [18, 12] as const, y: -1.05, layer: 0.88, intensity: 1.24, opacity: 0.72 },
        ];

        layerConfigs.forEach((config, index) => {
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uScroll: { value: 0 },
              uAspect: { value: container.clientWidth / Math.max(container.clientHeight, 1) },
              uLayer: { value: config.layer },
              uIntensity: { value: config.intensity },
            },
            vertexShader: smokeVertexShader,
            fragmentShader: smokeFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: index === 0 ? THREE.NormalBlending : THREE.AdditiveBlending,
          });

          const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), material);
          plane.position.set(0, config.y, config.z);
          plane.scale.set(config.scale[0], config.scale[1], 1);
          plane.renderOrder = index;
          material.opacity = config.opacity;
          scene.add(plane);
          materials.push(material);
          planes.push(plane);
        });

        const hazeMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uAspect: { value: container.clientWidth / Math.max(container.clientHeight, 1) },
            uLayer: { value: 1.32 },
            uIntensity: { value: 0.52 },
          },
          vertexShader: smokeVertexShader,
          fragmentShader: smokeFragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const hazePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), hazeMaterial);
        hazePlane.position.set(0, 1.8, -10);
        hazePlane.scale.set(34, 22, 1);
        scene.add(hazePlane);
        materials.push(hazeMaterial);
        planes.push(hazePlane);

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

          materials.forEach((material, index) => {
            material.uniforms.uTime.value = prefersReducedMotion ? 0 : elapsed;
            material.uniforms.uScroll.value = scroll;
            const baseIntensity = index === 3 ? 0.52 : 0.9 + index * 0.14;
            material.uniforms.uIntensity.value = prefersReducedMotion
              ? baseIntensity * 0.72
              : baseIntensity;
          });

          planes.forEach((plane, index) => {
            if (prefersReducedMotion) return;
            plane.position.x = Math.sin(elapsed * (0.1 + index * 0.04) + index) * (0.18 + index * 0.04);
            plane.position.y += Math.sin(elapsed * (0.12 + index * 0.03) + index * 1.7) * 0.002;
            plane.rotation.z = Math.sin(elapsed * (0.07 + index * 0.03) + index) * 0.05;
          });

          camera.position.z = 10 - scroll * 2.35;
          camera.position.y = 0.35 + scroll * 0.38;
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
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2200ms] ease-out ${isReady ? "scale-[1.04] blur-0" : "scale-[1.1] blur-[14px]"}`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(255,129,43,0.22),transparent_24%),linear-gradient(180deg,rgba(3,4,8,0.42)_0%,rgba(3,4,8,0.68)_38%,rgba(3,4,8,0.92)_100%)]" />
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-all duration-[2200ms] ease-out ${isReady ? "opacity-100 blur-0" : "opacity-0 blur-[14px]"}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,4,8,0.86)_0%,rgba(3,4,8,0.34)_46%,rgba(3,4,8,0.64)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1450px] items-center px-8 py-24 md:px-14 lg:px-20">
          <div className="max-w-[620px]">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.35em] text-white/66 backdrop-blur-md">
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
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md">
                Procedural smoke field
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md">
                Layered shader planes
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md">
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

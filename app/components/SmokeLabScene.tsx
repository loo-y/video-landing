import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SmokeLabSceneProps {
  backgroundSrc: string;
  smokeTextures: string[];
}

interface SmokeSpriteData {
  velocityX: number;
  velocityY: number;
  pulseOffset: number;
  rotationSpeed: number;
  baseScale: number;
  depthFactor: number;
}

interface EmberData {
  speed: number;
  drift: number;
  pulseOffset: number;
}

export function SmokeLabScene({
  backgroundSrc,
  smokeTextures,
}: SmokeLabSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(window.innerHeight * 2, 1);
      progressRef.current = Math.min(window.scrollY / maxScroll, 1);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = media.matches;

    let disposed = false;
    const cleanupFns: Array<() => void> = [];

    const initScene = async () => {
      try {
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current = renderer;
        container.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x090c14, 0.028);

        const camera = new THREE.PerspectiveCamera(
          42,
          container.clientWidth / Math.max(container.clientHeight, 1),
          0.1,
          120
        );
        camera.position.set(0, 0.2, 18);

        const loader = new THREE.TextureLoader();
        const textures = await Promise.all(
          smokeTextures.map(
            (src) =>
              new Promise<THREE.Texture>((resolve, reject) => {
                loader.load(
                  src,
                  (texture: THREE.Texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    resolve(texture);
                  },
                  undefined,
                  (error: unknown) => reject(error)
                );
              })
          )
        );

        if (disposed) return;

        const smokeGroup = new THREE.Group();
        scene.add(smokeGroup);

        const emberGroup = new THREE.Group();
        scene.add(emberGroup);

        const smokeSprites: THREE.Sprite[] = [];
        const smokeData = new Map<THREE.Sprite, SmokeSpriteData>();

        const smokeCount = reducedMotion ? 18 : 44;
        for (let index = 0; index < smokeCount; index += 1) {
          const texture = textures[index % textures.length];
          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            opacity: 0.12 + Math.random() * 0.16,
            color: new THREE.Color().setHSL(0.09, 0.48, 0.72 + Math.random() * 0.08),
            blending:
              index % 4 === 0 ? THREE.AdditiveBlending : THREE.NormalBlending,
          });

          const sprite = new THREE.Sprite(material);
          const layer = index % 3;
          const depthFactor = layer === 0 ? 0.2 : layer === 1 ? 0.55 : 0.9;
          const baseScale =
            layer === 0 ? 11 + Math.random() * 5 : layer === 1 ? 8 + Math.random() * 4 : 5 + Math.random() * 3;

          sprite.position.set(
            (Math.random() - 0.5) * 24,
            (Math.random() - 0.5) * 12,
            -layer * 6 - Math.random() * 10
          );
          sprite.scale.set(baseScale, baseScale * (0.78 + Math.random() * 0.22), 1);
          smokeGroup.add(sprite);
          smokeSprites.push(sprite);
          smokeData.set(sprite, {
            velocityX: (Math.random() - 0.5) * (layer === 2 ? 0.0028 : 0.0016),
            velocityY: 0.0012 + Math.random() * 0.0022,
            pulseOffset: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.0014,
            baseScale,
            depthFactor,
          });
        }

        const emberMaterial = new THREE.SpriteMaterial({
          transparent: true,
          depthWrite: false,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          color: new THREE.Color("#ffb36b"),
        });

        const emberTexture = createEmberTexture();
        emberMaterial.map = emberTexture;

        const emberSprites: THREE.Sprite[] = [];
        const emberData = new Map<THREE.Sprite, EmberData>();
        const emberCount = reducedMotion ? 10 : 24;

        for (let index = 0; index < emberCount; index += 1) {
          const sprite = new THREE.Sprite(emberMaterial.clone());
          const scale = 0.18 + Math.random() * 0.28;
          sprite.position.set((Math.random() - 0.5) * 18, -5.5 - Math.random() * 3, 2 - Math.random() * 8);
          sprite.scale.setScalar(scale);
          emberGroup.add(sprite);
          emberSprites.push(sprite);
          emberData.set(sprite, {
            speed: 0.028 + Math.random() * 0.026,
            drift: (Math.random() - 0.5) * 0.018,
            pulseOffset: Math.random() * Math.PI * 2,
          });
        }

        const ambientLight = new THREE.AmbientLight(0xffddb2, 0.8);
        const keyLight = new THREE.PointLight(0xff8a3d, 16, 40, 2);
        keyLight.position.set(0, -1, 8);
        scene.add(ambientLight);
        scene.add(keyLight);

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

          const elapsed = clock.getElapsedTime();
          const scrollProgress = progressRef.current;

          smokeSprites.forEach((sprite) => {
            const data = smokeData.get(sprite);
            if (!data) return;

            sprite.position.x += data.velocityX;
            sprite.position.y += data.velocityY * (1 + data.depthFactor * 0.4);
            if (sprite.position.y > 7.5) {
              sprite.position.y = -7.5 - Math.random() * 3;
              sprite.position.x = (Math.random() - 0.5) * 22;
            }
            if (sprite.position.x > 13 || sprite.position.x < -13) {
              sprite.position.x *= -0.92;
            }

            const pulse = 1 + Math.sin(elapsed * 0.32 + data.pulseOffset) * 0.06;
            sprite.scale.set(
              data.baseScale * pulse,
              data.baseScale * (0.78 + data.depthFactor * 0.18) * pulse,
              1
            );
            sprite.material.rotation += data.rotationSpeed;
            sprite.material.opacity = 0.08 + data.depthFactor * 0.12 + Math.sin(elapsed * 0.24 + data.pulseOffset) * 0.02;
          });

          emberSprites.forEach((sprite) => {
            const data = emberData.get(sprite);
            if (!data) return;

            sprite.position.y += data.speed;
            sprite.position.x += data.drift;
            if (sprite.position.y > 8.5) {
              sprite.position.y = -6.8 - Math.random() * 2.4;
              sprite.position.x = (Math.random() - 0.5) * 18;
            }
            const flicker = 0.65 + Math.sin(elapsed * 4 + data.pulseOffset) * 0.2;
            sprite.material.opacity = flicker;
          });

          smokeGroup.rotation.z = Math.sin(elapsed * 0.08) * 0.03;
          smokeGroup.position.z = scrollProgress * 7.5;
          smokeGroup.position.y = scrollProgress * 0.8;
          emberGroup.position.z = scrollProgress * 3.5;

          camera.position.z = 18 - scrollProgress * 4.8;
          camera.position.y = 0.2 + scrollProgress * 0.25;
          camera.lookAt(0, 0, 0);

          renderer.render(scene, camera);
          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);
        setIsReady(true);

        cleanupFns.push(() => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          smokeSprites.forEach((sprite) => {
            sprite.material.dispose();
          });
          emberSprites.forEach((sprite) => {
            sprite.material.dispose();
          });
          emberTexture.dispose();
          textures.forEach((texture: THREE.Texture) => texture.dispose());
          renderer.dispose();
          renderer.forceContextLoss();
        });
      } catch (error) {
        console.error("Smoke lab scene init failed:", error);
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
  }, [smokeTextures]);

  return (
    <div className="relative min-h-[300dvh] bg-[#05070d] text-white">
      <div className="fixed inset-0 overflow-hidden">
        <img
          src={backgroundSrc}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-out ${isReady ? "scale-[1.03] blur-0" : "scale-[1.08] blur-[10px]"}`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,140,51,0.18),transparent_30%),linear-gradient(180deg,rgba(4,6,12,0.56)_0%,rgba(4,6,12,0.7)_42%,rgba(4,6,12,0.88)_100%)]" />
        <div
          ref={containerRef}
          className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${isReady ? "opacity-100 blur-0" : "opacity-0 blur-[10px]"}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,12,0.86)_0%,rgba(6,8,12,0.48)_42%,rgba(6,8,12,0.58)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1400px] items-center px-8 py-24 md:px-14 lg:px-20">
          <div className="max-w-[560px]">
            <div className="mb-5 inline-flex items-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.35em] text-white/65 backdrop-blur-md">
              Smoke Lab / Three.js
            </div>
            <h1 className="max-w-[12ch] text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-white md:text-7xl">
              Cinematic smoke, built on WebGL instead of sprite-only overlays.
            </h1>
            <p className="mt-6 max-w-[52ch] text-base leading-7 text-white/68 md:text-lg">
              This page is isolated from the home experience. The smoke body is rendered in a
              Three.js scene using layered translucent textures, real depth, camera motion, and
              scroll-driven Z-axis push.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm text-white/62">
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md">
                Texture-cloud smoke
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md">
                Real scroll depth
              </span>
              <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2 backdrop-blur-md">
                Ember accents
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

      <div className="relative z-20 mx-auto flex max-w-[1400px] flex-col gap-40 px-8 pb-28 pt-[110dvh] md:px-14 lg:px-20">
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#ffb670]">Read of the test</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white">
              The goal here is smoke first, particles second.
            </h2>
            <p className="mt-4 max-w-[56ch] text-sm leading-7 text-white/64">
              Unlike the earlier atmosphere mode, the dominant visual mass is now coming from
              translucent smoke planes in 3D space. The ember sprites exist only to keep the frame
              alive and add heat, not to fake the smoke body.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/24 p-8 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/42">What to inspect</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/62">
              <li>Scroll down and watch the fog bank slowly advance toward the camera.</li>
              <li>Look for soft body volume rather than isolated dots.</li>
              <li>Check whether the scene still reads as smoke even when the page is idle.</li>
            </ul>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          <MetricCard label="Renderer" value="Three.js" />
          <MetricCard label="Backend" value="WebGL" />
          <MetricCard label="Scene strategy" value="Sprite-based smoke cloud" />
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

function createEmberTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,248,224,1)");
  gradient.addColorStop(0.25, "rgba(255,192,108,0.95)");
  gradient.addColorStop(0.55, "rgba(255,120,36,0.55)");
  gradient.addColorStop(1, "rgba(255,120,36,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

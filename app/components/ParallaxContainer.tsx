import { useRef, useEffect, useState, useCallback, createContext, useContext } from "react";
import type { ReactNode } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  depth?: number; // 0 = no parallax, 1 = full parallax
  className?: string;
}

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  sensitivity?: number; // How much the parallax effect responds to mouse
}

interface MousePosition {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

const ParallaxContext = createContext<MousePosition>({ x: 0, y: 0 });

export function useParallax() {
  return useContext(ParallaxContext);
}

export function ParallaxContainer({
  children,
  className = "",
  sensitivity = 30,
}: ParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate normalized position (-1 to 1)
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      setMousePosition({ x, y });
    },
    []
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <ParallaxContext.Provider value={mousePosition}>
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

export function ParallaxLayer({ children, depth = 0.5, className = "" }: ParallaxLayerProps) {
  const mousePosition = useParallax();
  const offset = depth * 30; // pixels

  const style = {
    transform: `translate(${-mousePosition.x * offset}px, ${-mousePosition.y * offset}px)`,
    transition: "transform 0.1s ease-out",
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

"use client";

import { cn } from "@clarity/utils/cn"
import { motion } from "motion/react";
import React, { useEffect, useId, useRef, useState } from "react";

/**
 *  DotPattern Component Props
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {number} [x=0] - The x-offset of the entire pattern
 * @param {number} [y=0] - The y-offset of the entire pattern
 * @param {number} [cx=1] - The x-offset of individual dots
 * @param {number} [cy=1] - The y-offset of individual dots
 * @param {number} [cr=1] - The radius of each dot
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 * @param {boolean} [glow=false] - Whether dots should have a glowing animation effect
 * @param {boolean} [fluid=false] - Whether dots should have fluid, variable animations
 * @param {boolean} [useParentDimensions=false] - Whether to use parent container dimensions instead of own
 * @param {number} [areaCircle=70] - The percentage of the radial gradient area (0-100)
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
  fluid?: boolean;
  useParentDimensions?: boolean;
  areaCircle?: number;
  [key: string]: unknown;
}

export function DotPattern({
  width = 20,
  height = 20,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  fluid = false,
  useParentDimensions = false,
  areaCircle = 70,
  ...props
}: DotPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        let targetElement = containerRef.current;
        
        // Si useParentDimensions es true, buscar el ScrollArea padre
        if (useParentDimensions) {
          let parent = containerRef.current.parentElement;
          while (parent) {
            if (parent.classList.contains('scroll-area') || 
                parent.querySelector('[data-radix-scroll-area-viewport]') ||
                parent.getAttribute('data-radix-scroll-area-root') !== null) {
              targetElement = parent;
              break;
            }
            parent = parent.parentElement;
          }
        }
        
        const { width: w, height: h } = targetElement.getBoundingClientRect();
        setDimensions({ width: w, height: h });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [useParentDimensions]);

  const dots = Array.from(
    {
      length:
        Math.ceil(dimensions.width / width) *
        Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width);
      const row = Math.floor(i / Math.ceil(dimensions.width / width));
      
      // Calcular distancia desde el centro para animaciones más fluidas
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const dotX = col * width + cx;
      const dotY = row * height + cy;
      const distanceFromCenter = Math.sqrt(
        Math.pow(dotX - centerX, 2) + Math.pow(dotY - centerY, 2)
      );
      
      return {
        x: dotX,
        y: dotY,
        delay: fluid ? (distanceFromCenter / 100) * Math.random() : Math.random() * 5,
        duration: fluid ? 
          Math.random() * 4 + 3 + (distanceFromCenter / 200) : 
          Math.random() * 3 + 2,
        initialScale: fluid ? Math.random() * 0.5 + 0.5 : 1,
        maxScale: fluid ? Math.random() * 1.5 + 1.2 : 1.5,
        initialOpacity: fluid ? Math.random() * 0.3 + 0.2 : 0.4,
        maxOpacity: fluid ? Math.random() * 0.6 + 0.7 : 1,
        distanceFromCenter,
      };
    },
  );

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none text-neutral-400/80",
        className,
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset={`${areaCircle}%`} stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {fluid && (
          <radialGradient id={`${id}-fluid-gradient`}>
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset={`${areaCircle * 0.6}%`} stopColor="currentColor" stopOpacity="0.6" />
            <stop offset={`${areaCircle}%`} stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      {dots.map((dot, index) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={
            glow 
              ? fluid 
                ? `url(#${id}-fluid-gradient)` 
                : `url(#${id}-gradient)` 
              : "currentColor"
          }
          initial={
            glow || fluid
              ? { 
                  opacity: dot.initialOpacity, 
                  scale: dot.initialScale,
                  ...(fluid && { 
                    x: dot.x + (Math.random() - 0.5) * 2,
                    y: dot.y + (Math.random() - 0.5) * 2
                  })
                }
              : {}
          }
          animate={
            glow || fluid
              ? fluid
                ? {
                    opacity: [
                      dot.initialOpacity, 
                      dot.maxOpacity, 
                      dot.initialOpacity * 0.7,
                      dot.maxOpacity * 0.8,
                      dot.initialOpacity
                    ],
                    scale: [
                      dot.initialScale, 
                      dot.maxScale, 
                      dot.initialScale * 1.1,
                      dot.maxScale * 0.9,
                      dot.initialScale
                    ],
                    x: [
                      dot.x,
                      dot.x + Math.sin(index * 0.1) * 3,
                      dot.x - Math.cos(index * 0.1) * 2,
                      dot.x + Math.sin(index * 0.2) * 1.5,
                      dot.x
                    ],
                    y: [
                      dot.y,
                      dot.y + Math.cos(index * 0.1) * 2,
                      dot.y - Math.sin(index * 0.1) * 3,
                      dot.y + Math.cos(index * 0.2) * 1,
                      dot.y
                    ]
                  }
                : {
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.5, 1],
                  }
              : {}
          }
          transition={
            glow || fluid
              ? fluid
                ? {
                    duration: dot.duration,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: dot.delay,
                    ease: [0.4, 0, 0.6, 1],
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }
                : {
                    duration: dot.duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: dot.delay,
                    ease: "easeInOut",
                  }
              : {}
          }
        />
      ))}
    </svg>
  );
}

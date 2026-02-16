"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface HoloTransform {
  rotateX: number;
  rotateY: number;
  gradientX: number;
  gradientY: number;
}

export function useHoloEffect(elementRef: React.RefObject<HTMLElement | null>) {
  const [transform, setTransform] = useState<HoloTransform>({
    rotateX: 0,
    rotateY: 0,
    gradientX: 50,
    gradientY: 50,
  });
  const rafRef = useRef<number>(0);
  const hasGyro = useRef(false);

  const updateTransform = useCallback((x: number, y: number) => {
    // x, y are -1 to 1
    setTransform({
      rotateX: y * 8,
      rotateY: x * -8,
      gradientX: 50 + x * 30,
      gradientY: 50 + y * 30,
    });
  }, []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Try gyroscope first
    const handleOrientation = (e: DeviceOrientationEvent) => {
      hasGyro.current = true;
      const gamma = (e.gamma || 0) / 45; // left-right tilt, clamp -1 to 1
      const beta = ((e.beta || 0) - 45) / 45; // front-back tilt
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateTransform(
          Math.max(-1, Math.min(1, gamma)),
          Math.max(-1, Math.min(1, beta))
        );
      });
    };

    // Mouse fallback
    const handleMouseMove = (e: MouseEvent) => {
      if (hasGyro.current) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateTransform(x, y);
      });
    };

    const handleMouseLeave = () => {
      if (hasGyro.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateTransform(0, 0);
      });
    };

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("deviceorientation", handleOrientation);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [elementRef, updateTransform]);

  return transform;
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: server output and unobserved content stay visible. */
export default function Reveal({ children, className = "", delay = 0, direction = "up", minimal = false, replayKey }: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  minimal?: boolean;
  replayKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !element.animate || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const stop = () => animation?.cancel();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (preference.matches || element.contains(document.activeElement)) return;
      const narrow = window.matchMedia("(max-width: 639px)").matches;
      const transform = minimal ? "none" : direction === "up" || narrow
        ? "translateY(16px)" : `translateX(${direction === "left" ? -24 : 24}px)`;
      animation = element.animate([
        { opacity: minimal ? 0.7 : 0, transform },
        { opacity: 1, transform: "none" },
      ], { duration: minimal ? 180 : 420, delay: minimal ? 0 : Math.min(240, Math.max(0, delay)), easing: "cubic-bezier(0.2, 0.65, 0.3, 1)", fill: "backwards" });
    }, { threshold: 0 });
    observer.observe(element);
    element.addEventListener("focusin", stop);
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      stop();
      element.removeEventListener("focusin", stop);
      preference.removeEventListener("change", stop);
    };
  }, [delay, direction, minimal, replayKey]);
  return <div ref={ref} className={`content-reveal ${className}`}>{children}</div>;
}

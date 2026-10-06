"use client";

import { useEffect, useRef, useState } from "react";

/** Decorative media is optional; the poster and content work without playback. */
export default function BackgroundVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const pausedByUser = useRef(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (pausedByUser.current || motion.matches || connection?.saveData || document.hidden) { video.pause(); setPlaying(false); return; }
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    update();
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); video.pause(); };
  }, []);
  return <>
    <video ref={ref} muted loop playsInline preload="none" poster="/videos/images/hero-thumbnail.jpg" className="absolute inset-0 h-full w-full object-cover opacity-25" aria-hidden="true"><source src="/videos/hero.mp4" type="video/mp4" /></video>
    <button type="button" aria-label={playing ? "Pause background video" : "Play background video"} className="absolute bottom-4 right-4 z-10 rounded-lg border border-white/30 bg-black/50 px-3 text-xs text-white"
      onClick={() => { if (playing) { pausedByUser.current = true; ref.current?.pause(); setPlaying(false); } else { pausedByUser.current = false; void ref.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); } }}>{playing ? "Pause video" : "Play video"}</button>
  </>;
}

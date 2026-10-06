"use client";

import { useState } from "react";

interface LazyImageProps { src: string; alt: string; className?: string; }

export function LazyImage({ src, alt, className = "" }: LazyImageProps) {
  const [failed, setFailed] = useState(false);
  return failed
    ? <div role="img" aria-label={alt} className={`flex items-center justify-center bg-[#EDE9E0] p-5 text-center text-sm text-[#555555] ${className}`}>{alt}</div>
    : <img src={src} alt={alt} loading="lazy" decoding="async" width={800} height={600} onLoad={(event) => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        event.currentTarget.animate?.([{ opacity: 0.4 }, { opacity: 1 }], { duration: 300 });
      }
    }} onError={() => setFailed(true)} className={className} />;
}

import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ImageSkeleton } from "./LoadingSkeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function LazyImage({ src, alt, className }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    const element = document.getElementById(`lazy-${src}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div
      id={`lazy-${src}`}
      className="relative w-full h-full"
      role="img"
      aria-label={isLoaded ? alt : `Loading ${alt}`}
    >
      {!isLoaded && <ImageSkeleton className={className} />}
      {isInView && (
        <ImageWithFallback
          src={src}
          alt={alt}
          className={`${className} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

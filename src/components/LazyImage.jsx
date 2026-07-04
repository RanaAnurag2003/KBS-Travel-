import { useState, useEffect, useRef } from "react";

export default function LazyImage({ src, alt, className = "" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const currentImg = imgRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      if (currentImg) {
        observer.unobserve(currentImg);
      }
    };
  }, []);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden w-full h-full bg-slate-200 dark:bg-slate-800 ${className}`}
      style={{ minHeight: "150px" }}
    >
      {/* Shimmer Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 shimmer w-full h-full" />
      )}

      {/* Actual Image */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}

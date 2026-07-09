import React, { useEffect, useRef, memo } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTopButton = memo(function ScrollToTopButton({ isHidden }) {
  const btnRef = useRef(null);
  const circleRef = useRef(null);
  const circumference = 2 * Math.PI * 21; // ~131.95

  useEffect(() => {
    if (isHidden) return;
    let ticking = false;

    const updateScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      let progress = 0;
      
      if (totalHeight > 0) {
        progress = (window.scrollY / totalHeight) * 100;
      }
      
      const offset = circumference - (progress / 100) * circumference;
      
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = offset;
      }
      
      if (btnRef.current) {
        btnRef.current.style.opacity = progress > 1 ? 1 : 0.35;
      }
      
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [circumference, isHidden]);

  if (isHidden) return null;

  return (
    <button
      ref={btnRef}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="btn-scroll-top-premium"
      aria-label="Scroll back to top"
      style={{
        opacity: 0.35,
        pointerEvents: "auto",
        transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }}
        width="46"
        height="46"
        viewBox="0 0 46 46"
      >
        <circle
          cx="23"
          cy="23"
          r="21"
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="2"
        />
        <circle
          ref={circleRef}
          cx="23"
          cy="23"
          r="21"
          fill="transparent"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.1s ease"
          }}
        />
      </svg>
      <ArrowUp className="w-4 h-4" style={{ zIndex: 2, position: "relative" }} />
    </button>
  );
});

export default ScrollToTopButton;

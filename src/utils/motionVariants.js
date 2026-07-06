// Custom cubic bezier easing for clean, Apple-like decelerated momentum (Power2.out equivalent)
export const smoothEase = [0.25, 1, 0.5, 1];

// Reusable viewport threshold settings
export const viewportSettings = {
  once: true,
  margin: "50px 0px 50px 0px"
};

const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

// Section transition variant
export const sectionVariants = (prefersReducedMotion = false) => ({
  hidden: (prefersReducedMotion || isMobile) ? {
    opacity: 1,
    y: 0
  } : {
    opacity: 0,
    y: 35
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: smoothEase,
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
});

// Staggered child transition variant
export const childVariants = (prefersReducedMotion = false) => ({
  hidden: (prefersReducedMotion || isMobile) ? {
    opacity: 1,
    y: 0
  } : {
    opacity: 0,
    y: 15
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut"
    }
  }
});

// Image entrance variant: fade in + scale 0.98 to 1 + blur 4px to 0px (sharpening)
export const imageVariants = (prefersReducedMotion = false) => ({
  hidden: (prefersReducedMotion || isMobile) ? {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)"
  } : {
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: "easeOut"
    }
  }
});

// Heading text clip reveal (lightweight mask)
export const headingVariants = (prefersReducedMotion = false) => ({
  hidden: (prefersReducedMotion || isMobile) ? {
    opacity: 1,
    y: 0
  } : {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: smoothEase
    }
  }
});

// React hook to check and listen to browser reduced-motion preferences
import { useState, useEffect } from "react";

export function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  return reducedMotion;
}

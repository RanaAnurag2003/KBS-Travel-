import { useState, useEffect, useRef } from "react";

export default function LazyViewportSection({ children, height = "200px", rootMargin = "300px", id }) {
  const [hasEntered, setHasEntered] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (hasEntered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasEntered, rootMargin]);

  return (
    <div
      ref={containerRef}
      id={id}
      style={hasEntered ? {} : { minHeight: height, contentVisibility: "auto", containIntrinsicSize: `auto ${height}` }}
    >
      {hasEntered ? children : null}
    </div>
  );
}

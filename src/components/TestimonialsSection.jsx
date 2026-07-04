import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TestimonialsSection.css";

const PlanePathSVG = () => (
  <svg className="plane-path-svg" viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path 
      d="M-50,150 C300,40 600,260 900,100 C1150,20 1300,200 1500,80" 
      stroke="#3b82f6" 
      strokeWidth="2" 
      className="animated-travel-path"
    />
  </svg>
);

export default function TestimonialsSection({ testimonials }) {
  // Add premium properties to our testimonials
  const enhancedTestimonials = [
    {
      ...testimonials[0],
      destination: "Kashmir Highlights",
      date: "October 2025"
    },
    {
      ...testimonials[1],
      destination: "Kerala Backwaters",
      date: "December 2025"
    },
    {
      ...testimonials[2],
      destination: "Goa Adventure",
      date: "January 2026"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(1); // Start with center card (index 1)
  const [isPlaying, setIsPlaying] = useState(true);
  const autoPlayTimer = useRef(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % enhancedTestimonials.length);
  }, [enhancedTestimonials.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + enhancedTestimonials.length) % enhancedTestimonials.length);
  }, [enhancedTestimonials.length]);

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimer.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isPlaying, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="testimonials-section-v3" id="testimonials">
      {/* Background Graphic Blobs */}
      <div className="testimonials-bg-elements">
        <div className="bg-blob bg-blob-1"></div>
        <div className="bg-blob bg-blob-2"></div>
        <div className="world-map-texture"></div>
        <PlanePathSVG />
      </div>

      <div className="testimonials-header-v3">
        <span className="section-tag-v3">Client Voices</span>
        <h2 className="testimonials-title-v3">Voices of Our Travellers</h2>
        <p className="testimonials-desc-v3">
          Hear from our happy adventurers! Authentic travel logs, heart-warming stories, and memories that last a lifetime across Goa, Maldives, Srinagar, and Europe.
        </p>

        {/* Dynamic Trust Statistics Block */}
        <div className="testimonials-stats-v3">
          <div className="stat-item-v3">
            <span className="stat-num-v3">⭐ 4.9/5</span>
            <span className="stat-label-v3">Average Rating</span>
          </div>
          <div className="stat-item-v3">
            <span className="stat-num-v3">1,200+</span>
            <span className="stat-label-v3">Happy Travelers</span>
          </div>
          <div className="stat-item-v3">
            <span className="stat-num-v3">15+ Yrs</span>
            <span className="stat-label-v3">Experience</span>
          </div>
          <div className="stat-item-v3">
            <span className="stat-num-v3">10k+</span>
            <span className="stat-label-v3">Trips Completed</span>
          </div>
        </div>
      </div>

      {/* Testimonials Slider */}
      <div className="testimonials-carousel-container">
        <div 
          className="carousel-viewport-v3"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          <motion.div 
            className="carousel-track-v3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {enhancedTestimonials.map((t, idx) => {
              const isActive = idx === activeIndex;
              const isSide = Math.abs(idx - activeIndex) === 1 || (activeIndex === 0 && idx === enhancedTestimonials.length - 1) || (activeIndex === enhancedTestimonials.length - 1 && idx === 0);
              
              let cardClass = "testimonial-card-v3";
              if (isActive) cardClass += " active-card";
              else if (isSide) cardClass += " faded-card";

              return (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  className={cardClass}
                  style={{
                    width: "340px",
                    cursor: "pointer"
                  }}
                  animate={{
                    scale: isActive ? 1.05 : 0.92,
                    opacity: isActive ? 1 : 0.55,
                    zIndex: isActive ? 10 : 5
                  }}
                  whileHover={isActive ? {
                    y: -10,
                    rotate: 1,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
                  } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div className="card-header-v3">
                    <div className="user-profile-v3">
                      <div className="avatar-wrapper-v3">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="avatar-v3"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="verified-badge-v3">
                          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: "12px", height: "12px" }}>
                            <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708-.523H4.5a2.5 2.5 0 00-2.5 2.5v1.059a.75.75 0 00.523.708L5.176 8.15a2.5 2.5 0 001.09 2.052l.966.644a2.5 2.5 0 002.772 0l.966-.644a2.5 2.5 0 001.09-2.052l2.653-.956a.75.75 0 00.523-.708V5.432a2.5 2.5 0 00-2.5-2.5h-1.059a.75.75 0 00-.708.523L9.043 5.92a2.5 2.5 0 01-2.086 0L6.267 3.455zM4 12v4.5A1.5 1.5 0 005.5 18h9a1.5 1.5 0 001.5-1.5V12h-2v3.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5V12H4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="user-info-text-v3">
                        <h4 className="user-name-v3">{t.name}</h4>
                        <div className="user-meta-row-v3">
                          <span className="user-location-v3">{t.location}</span>
                        </div>
                        <div className="rating-stars-v3">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <svg key={i} className="star-icon-v3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="card-quote-bg-v3">“</div>
                  </div>
                  <div className="quote-content-v3">
                    <p className="quote-text-v3">"{t.text}"</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <div className="carousel-controls-v3">
          <button className="nav-arrow-btn-v3" onClick={prevSlide}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="carousel-dots-v3">
            {enhancedTestimonials.map((_, idx) => (
              <span 
                key={idx} 
                className={`carousel-dot-v3 ${idx === activeIndex ? "active-dot" : ""}`}
                onClick={() => setActiveIndex(idx)}
              ></span>
            ))}
          </div>
          <button className="nav-arrow-btn-v3" onClick={nextSlide}>
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Trust Elements Badges */}
      <div className="trust-badges-container">
        <span className="trust-title-v3">As Featured & Rated On</span>
        <div className="trust-platforms-v3">
          <div className="platform-badge-v3">
            <span style={{ color: "#00b67a", fontWeight: "900", marginRight: "4px" }}>★</span>
            <span>Trustpilot</span>
          </div>
          <div className="platform-badge-v3">
            <span style={{ color: "#00af87", fontWeight: "900", marginRight: "4px" }}>◯</span>
            <span>Tripadvisor</span>
          </div>
          <div className="platform-badge-v3">
            <span style={{ color: "#4285f4", fontWeight: "900", marginRight: "4px" }}>G</span>
            <span>Google Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}

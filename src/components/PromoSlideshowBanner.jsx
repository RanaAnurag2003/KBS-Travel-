import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slidesData = [
  {
    title: "🏝 Goa Summer Sale",
    subtitle: "Save up to ₹5,000 on flight inclusive beach packages.",
    gradient: "linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)",
    ctaLabel: "Book Now",
    icon: "🏝"
  },
  {
    title: "🏔 Kashmir Family Packages",
    subtitle: "Free Shikara Ride & houseboat stay upgrades included.",
    gradient: "linear-gradient(135deg, #0284c7, #0ea5e9, #38bdf8)",
    ctaLabel: "Explore Deal",
    icon: "🏔"
  },
  {
    title: "🌊 Maldives Luxury Escape",
    subtitle: "Complimentary candlelight beach dinner & resort transfers.",
    gradient: "linear-gradient(135deg, #0f766e, #14b8a6, #2dd4bf)",
    ctaLabel: "View Details",
    icon: "🌊"
  },
  {
    title: "✈️ Dubai Explorer",
    subtitle: "Free desert safari, BBQ dinner, and Burj Khalifa tickets.",
    gradient: "linear-gradient(135deg, #4f46e5, #6366f1, #818cf8)",
    ctaLabel: "Book Now",
    icon: "✈️"
  },
  {
    title: "🇹🇭 Thailand Tour",
    subtitle: "Flat 20% off hotel bookings and guided city temple tours.",
    gradient: "linear-gradient(135deg, #0369a1, #0284c7, #06b6d4)",
    ctaLabel: "Grab Offer",
    icon: "🇹🇭"
  },
  {
    title: "🏖 Bali Honeymoon",
    subtitle: "Complimentary couple spa treatment & flower decorations.",
    gradient: "linear-gradient(135deg, #0d9488, #0ea5e9, #10b981)",
    ctaLabel: "Book Honeymoon",
    icon: "🏖"
  },
  {
    title: "🇮🇳 Kerala Backwaters",
    subtitle: "Free premium private houseboat dining & backwater rides.",
    gradient: "linear-gradient(135deg, #0f766e, #10b981, #34d399)",
    ctaLabel: "Upgrade Free",
    icon: "🇮🇳"
  }
];

export default function PromoSlideshowBanner({ onAction }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayTimer = useRef(null);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slidesData.length);
    }, 4500);
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
    return () => stopAutoplay();
  }, [isHovered]);

  const activeSlide = slidesData[currentIdx];

  // Micro-animation variants for slide children
  const contentVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      y: -15,
      scale: 0.98,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div
      className="promo-banner-card promo-slideshow-container"
      style={{
        background: activeSlide.gradient,
        transition: "background 0.8s ease-in-out"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Slideshow CSS overrides to avoid typewriter animation loops on slide change */}
      <style>{`
        .promo-slideshow-container {
          position: relative;
          height: 100px !important;
          min-height: 100px !important;
          max-height: 100px !important;
          box-sizing: border-box !important;
        }
        .promo-slideshow-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          z-index: 2;
          position: relative;
          height: 100% !important;
        }
        .promo-slideshow-left {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .promo-slideshow-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--border-radius-full, 50%);
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .promo-slideshow-title {
          font-size: 14.5px;
          font-weight: 700;
          line-height: 1.45;
          color: #ffffff;
          margin: 0;
        }
        .promo-slideshow-subtitle {
          font-size: 12px;
          opacity: 0.9;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.9);
          margin: 4px 0 0 0;
        }
        .promo-slideshow-btn {
          background: linear-gradient(135deg, #0f172a 0%, #3b82f6 100%);
          background-size: 200% auto;
          color: #ffffff;
          font-weight: 750;
          border: none;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 10px;
          flex-shrink: 0;
          transition: transform 0.25s ease, background-position 0.5s ease;
        }
        .promo-slideshow-btn:hover {
          transform: translateY(-2px);
          background-position: right center;
        }
        .promo-slideshow-indicators {
          display: flex;
          gap: 6px;
          justify-content: center;
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }
        .promo-slideshow-dot {
          width: 6px;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .promo-slideshow-dot-active {
          width: 18px;
          background: #ffffff;
        }

        @media (max-width: 900px) {
          .promo-slideshow-container {
            border-radius: 20px !important;
            padding: 16px !important;
            height: 185px !important;
            min-height: 185px !important;
            max-height: 185px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
          .promo-slideshow-inner {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            gap: 10px;
            width: 100% !important;
            box-sizing: border-box !important;
            height: 100% !important;
            justify-content: center !important;
          }
          .promo-slideshow-left {
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100% !important;
          }
          .promo-slideshow-icon {
            width: 34px;
            height: 34px;
          }
          .promo-slideshow-title {
            font-size: 13px;
            line-height: 1.35;
          }
          .promo-slideshow-subtitle {
            font-size: 11px;
            line-height: 1.3;
            margin-top: 2px !important;
          }
          .promo-slideshow-btn {
            align-self: center;
            width: 100%;
            max-width: none;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 750;
            border-radius: 12px;
            background: transparent !important;
            border: none !important;
            color: #ffffff !important;
            box-shadow: none !important;
          }
          .promo-slideshow-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            transform: translateY(-1px) !important;
          }
          .promo-slideshow-indicators {
            bottom: 8px;
          }
        }
      `}</style>

      <div className="promo-banner-glow" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          className="promo-slideshow-inner"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="promo-slideshow-left">
            <motion.div className="promo-slideshow-icon" variants={scaleVariants}>
              <span style={{ fontSize: "20px", display: "inline-block" }}>{activeSlide.icon}</span>
            </motion.div>
            <div className="promo-banner-text-container">
              <motion.h4 className="promo-slideshow-title" variants={itemVariants}>
                {activeSlide.title}
              </motion.h4>
              <motion.p className="promo-slideshow-subtitle" variants={itemVariants}>
                {activeSlide.subtitle}
              </motion.p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={onAction}
            className="promo-slideshow-btn cursor-pointer"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {activeSlide.ctaLabel}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      <div className="promo-slideshow-indicators">
        {slidesData.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={`promo-slideshow-dot ${currentIdx === idx ? "promo-slideshow-dot-active" : ""}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
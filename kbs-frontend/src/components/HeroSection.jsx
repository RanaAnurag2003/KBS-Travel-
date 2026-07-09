import { motion } from "framer-motion";
import { sectionVariants, childVariants, usePrefersReducedMotion } from "../utils/motionVariants";
import SearchBar from "./SearchBar";
import { EditableText } from "./CMSWrappers";

export default function HeroSection({ onSearch }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.section
      className="hero-section-v2"
      id="home"
      initial="hidden"
      animate="visible"
      variants={sectionVariants(reducedMotion)}
    >
      <div className="hero-overlay-v2" />

      <div className="hero-content-v2">
        <motion.div className="hero-right-v2" variants={childVariants(reducedMotion)}>
          {/* Map Illustration Placeholder */}
          <div className="map-illustration-v2">
            {/* SVG Map Path outlines */}
            <svg viewBox="0 0 800 400" className="map-svg" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              <path d="M200,100 Q400,0 600,100 T750,200" strokeDasharray="5,5" stroke="rgba(103,232,249,0.5)" />
              <path d="M600,100 Q650,200 600,280" strokeDasharray="5,5" stroke="rgba(103,232,249,0.5)" />

              <circle cx="200" cy="100" r="4" fill="#67E8F9" className="pulse-dot" />
              <text x="210" y="95" fill="#B8C3D1" fontSize="12">New Delhi</text>

              <circle cx="600" cy="100" r="4" fill="#67E8F9" className="pulse-dot" />
              <text x="610" y="95" fill="#B8C3D1" fontSize="12">Munt</text>

              <circle cx="600" cy="280" r="4" fill="#67E8F9" className="pulse-dot" />
              <text x="610" y="275" fill="#B8C3D1" fontSize="12">Goa</text>

              <circle cx="750" cy="200" r="4" fill="#67E8F9" className="pulse-dot" />
            </svg>
          </div>
        </motion.div>

        <div className="hero-left-v2">
          <motion.div className="hero-title-v2" variants={childVariants(reducedMotion)}>
            <EditableText
              keyName="hero_title"
              fallback="Explore Premium <br class='mobile-only-br' />with Custom Packages"
              as="h1"
              className=""
            />
          </motion.div>

          <motion.div className="hero-subtitle-v2" variants={childVariants(reducedMotion)}>
            <EditableText
              keyName="hero_subtitle"
              fallback="Book your dream holiday with verified itineraries and custom stays"
              as="p"
              className=""
              isParagraph
            />
          </motion.div>

          <motion.div className="hero-search-wrapper-v2" variants={childVariants(reducedMotion)}>
            <SearchBar onSearch={onSearch} />
          </motion.div>

          <motion.div className="hero-trust-badges-v2" variants={childVariants(reducedMotion)}>
            <span className="trust-badge-v2"><span className="checkmark-v2">✓</span> Best Price</span>
            <span className="trust-badge-v2"><span className="checkmark-v2">✓</span> 24/7 Support</span>
            <span className="trust-badge-v2"><span className="checkmark-v2">✓</span> Trusted Travel</span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

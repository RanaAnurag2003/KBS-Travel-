import { motion } from "framer-motion";
import { sectionVariants, childVariants, viewportSettings, usePrefersReducedMotion } from "../utils/motionVariants";

export default function WhyBookWithUs() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.section 
      className="inclusions-global-section"
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={sectionVariants(reducedMotion)}
    >
      <div className="inclusions-global-container glass">
        <div className="inclusions-header">
          <motion.h2 className="section-title" variants={childVariants(reducedMotion)}>
            Why Book With KBS Travels?
          </motion.h2>
          <motion.p className="inclusions-subtitle" variants={childVariants(reducedMotion)}>
            Experience the ultimate peace of mind with our premium travel services tailored just for you.
          </motion.p>
        </div>
        <div className="inclusions-global-grid">
          <motion.div className="inclusion-item premium-card" variants={childVariants(reducedMotion)}>
            <div className="inclusion-icon-wrapper">
              <div className="icon-glow"></div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="premium-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <div className="inclusion-text">
              <h4>100% Safe Payments</h4>
              <p>Military-grade encryption ensures your transactions are completely secure.</p>
            </div>
          </motion.div>

          <motion.div className="inclusion-item premium-card" variants={childVariants(reducedMotion)}>
            <div className="inclusion-icon-wrapper">
              <div className="icon-glow"></div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="premium-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 2v4a2 2 0 01-2 2H5" />
              </svg>
            </div>
            <div className="inclusion-text">
              <h4>Verified Hotels Only</h4>
              <p>Handpicked properties audited for ultimate cleanliness, safety, and comfort.</p>
            </div>
          </motion.div>

          <motion.div className="inclusion-item premium-card" variants={childVariants(reducedMotion)}>
            <div className="inclusion-icon-wrapper">
              <div className="icon-glow"></div>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="premium-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="inclusion-text">
              <h4>24/7 Expert Support</h4>
              <p>Dedicated travel managers available round the clock on WhatsApp.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

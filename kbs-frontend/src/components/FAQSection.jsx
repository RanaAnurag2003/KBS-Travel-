import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { sectionVariants, childVariants, imageVariants, viewportSettings, usePrefersReducedMotion } from "../utils/motionVariants";
import { fetchFAQs } from "../api";

const FALLBACK_FAQS = [
  { id: 'fb1', question: "How do I book a holiday package with KBS Travels?", answer: "You can easily book a package by browsing our destinations, selecting your preferred itinerary, and clicking 'Book Now' or 'Get Quote'." },
  { id: 'fb2', question: "Can I customize the itinerary and hotel options?", answer: "Yes! We offer fully customizable itineraries and hotel choices to suit your preferences and budget." },
  { id: 'fb3', question: "Are flight tickets included in these package prices?", answer: "Flight inclusions vary by package. Please check the 'Inclusions' section of your specific tour for details." },
  { id: 'fb4', question: "What is your refund and cancellation policy?", answer: "Our cancellation policy varies depending on the booking window. Typically, a full refund is provided if cancelled 30 days prior to departure." },
  { id: 'fb5', question: "Is travel support available during my tour?", answer: "Absolutely. We provide 24/7 travel support for all our customers while they are on their tour." }
];

export default function FAQSection({ activeDestination }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFaqId, setOpenFaqId] = useState(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const loadFAQs = async () => {
      setLoading(true);
      try {
        const dest = activeDestination ? activeDestination.trim() : "default";
        const data = await fetchFAQs(dest);
        setFaqs(data.filter(faq => faq.isActive));
      } catch (error) {
        console.error("Failed to load destination FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFAQs();
  }, [activeDestination]);

  const displayFaqs = faqs.length > 0 ? faqs : FALLBACK_FAQS;

  return (
    <motion.section 
      className="faq-section" 
      id="faq"
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={sectionVariants(reducedMotion)}
    >
      <div className="faq-container">
        <div className="faq-split-layout">
          {/* Left Column: FAQ Accordion */}
          <div className="faq-left-column">
            <motion.h2 className="section-title text-left" variants={childVariants(reducedMotion)}>
              Frequently Asked Questions {activeDestination && !['default', 'global'].includes(activeDestination.toLowerCase()) ? `for ${activeDestination}` : ""}
            </motion.h2>
            <div className="faq-list-accordion">
              {displayFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <motion.div 
                    key={faq.id} 
                    className={`faq-card ${isOpen ? "is-open" : ""}`}
                    variants={childVariants(reducedMotion)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    onMouseEnter={() => setOpenFaqId(faq.id)}
                    onMouseLeave={() => setOpenFaqId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="faq-question-btn cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-arrow-icon">
                        <svg className="arrow-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div className="faq-answer-container">
                      <div className="faq-answer-inner">
                        <p className="faq-answer-text">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Floating destination cards */}
          <div className="faq-right-column">
            <div className="faq-floating-cards-wrapper">
              <motion.div
                className="floating-dest-card-v2"
                style={{ top: "6%", left: "0%", animationDelay: "0s" }}
                variants={childVariants(reducedMotion)}
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&h=300&fit=crop"
                  alt="Goa"
                  loading="lazy"
                  decoding="async"
                  variants={imageVariants(reducedMotion)}
                />
                <div className="dest-caption-v2">
                  <span className="dot"></span>
                  Live from Goa:
                  <br />
                  Sunset Views & 28°C
                </div>
              </motion.div>

              <motion.div
                className="floating-dest-card-v2"
                style={{ bottom: "5%", left: "7%", animationDelay: "2s" }}
                variants={childVariants(reducedMotion)}
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&h=300&fit=crop"
                  alt="Maldives"
                  loading="lazy"
                  decoding="async"
                  variants={imageVariants(reducedMotion)}
                />
                <div className="dest-caption-v2">
                  <span className="dot"></span>
                  Live from Maldives:
                  <br />
                  Clear Skies & 30°C
                </div>
              </motion.div>

              <motion.div
                className="floating-dest-card-v2"
                style={{ top: "25%", right: "0%", animationDelay: "4s" }}
                variants={childVariants(reducedMotion)}
              >
                <motion.img
                  src="https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=500&h=300&fit=crop"
                  alt="Swiss Alps"
                  loading="lazy"
                  decoding="async"
                  variants={imageVariants(reducedMotion)}
                />
                <div className="dest-caption-v2">
                  <span className="dot"></span>
                  Live from Swiss Alps:
                  <br />
                  Snowing & -2°C
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

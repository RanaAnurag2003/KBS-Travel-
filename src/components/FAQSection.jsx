import { useState } from "react";
import { motion } from "framer-motion";
import { sectionVariants, childVariants, imageVariants, viewportSettings, usePrefersReducedMotion } from "../utils/motionVariants";

const faqList = [
  {
    q: "How do I book a holiday package with KBS Travels?",
    a: "Booking is simple! Select your desired package, click on 'Proceed to Book Online' or 'Send Inquiry', and fill out your details. Our travel expert will call you within 15 minutes to finalize dates, customize transport, and send a payment invoice."
  },
  {
    q: "Can I customize the itinerary and hotel options?",
    a: "Absolutely. All our packages are 100% customizable. You can upgrade hotels from 3-star to 5-star, add extra nights, change transfers from shared to private cars, or add specific sightseeing entry passes."
  },
  {
    q: "Are flight tickets included in these package prices?",
    a: "The base package price excludes flights so that you can book them using your mileage points or select your preferred airline. However, we offer flight-inclusive add-on options at exclusive discounted travel rates."
  },
  {
    q: "What is your refund and cancellation policy?",
    a: "Cancellations made 30 days before departure receive a 100% refund. Cancellations between 15-30 days are subject to a 50% cancellation fee, and cancellations within 15 days of travel are non-refundable."
  },
  {
    q: "Is travel support available during my tour?",
    a: "Yes, we provide 24x7 local travel support. You will be assigned a dedicated tour coordinator on WhatsApp who will share driver details, hotel vouchers, and resolve any queries in real-time."
  }
];

export default function FAQSection() {
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.section 
      className="faq-section" 
      id="faq"
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={sectionVariants(reducedMotion)}
    >
      <div className="faq-container glass">
        <div className="faq-split-layout">
          {/* Left Column: FAQ Accordion */}
          <div className="faq-left-column">
            <motion.h2 className="section-title text-left" variants={childVariants(reducedMotion)}>
              Frequently Asked Questions
            </motion.h2>
            <div className="faq-list-accordion">
              {faqList.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <motion.div 
                    key={idx} 
                    className={`faq-card glass ${isOpen ? "is-open" : ""}`}
                    variants={childVariants(reducedMotion)}
                    onMouseEnter={() => setOpenFaqIdx(idx)}
                    onMouseLeave={() => setOpenFaqIdx(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="faq-question-btn cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <span className="faq-arrow-icon">
                        <svg className="arrow-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    <div className="faq-answer-container">
                      <div className="faq-answer-inner">
                        <p className="faq-answer-text">{faq.a}</p>
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

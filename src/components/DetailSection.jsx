import { useState } from "react";
import { motion } from "framer-motion";
import { sectionVariants, childVariants, viewportSettings, usePrefersReducedMotion } from "../utils/motionVariants";

export default function DetailSection({ pkg }) {
  const [activeTab, setActiveTab] = useState("overview");
  const reducedMotion = usePrefersReducedMotion();

  if (!pkg) {
    return (
      <section className="details-section-empty glass fade-in" id="overview">
        <div className="empty-message-container">
          <svg className="empty-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="empty-text">Select any package from the list above to view full itinerary highlights, inclusions, and booking options.</p>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      className="details-section" 
      id="overview" 
      key={pkg.id}
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={sectionVariants(reducedMotion)}
    >
      {/* 1. Solid Blue Tabs Bar - Styled like Target UI */}
      <motion.div className="details-tabs-bar-blue" variants={childVariants(reducedMotion)}>
        <div className="details-tabs-container-blue">
          <button
            type="button"
            className={`details-tab-btn-pill ${activeTab === "overview" ? "details-tab-btn-pill-active" : ""} cursor-pointer`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`details-tab-btn-pill ${activeTab === "stayTransfers" ? "details-tab-btn-pill-active" : ""} cursor-pointer`}
            onClick={() => setActiveTab("stayTransfers")}
          >
            Stay & Transfers
          </button>
        </div>
      </motion.div>

      {/* 2. Content Grid Layout */}
      <div className="details-layout">
        {/* Left Column: Details Cards */}
        <div className="details-main-column">
          {/* Message Banner Card */}
          <motion.div className="details-message-card" variants={childVariants(reducedMotion)}>
            <span className="details-message-text">
              Showing official package details for: <strong>{pkg.title} ({pkg.duration})</strong>. Enjoy 100% verified hotels.
            </span>
          </motion.div>

          {activeTab === "overview" ? (
            <div>  
              <div className="details-tab-content">
                {/* Tour Highlights Card */}
                <motion.div className="details-card-block dropdown-card is-open" variants={childVariants(reducedMotion)}>
                  <div className="dropdown-header">
                    <h3 className="highlights-title-red">Tour Highlights</h3>
                    <span className="dropdown-chevron">
                      <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-inner">
                      <ul className="highlights-list-grid">
                        {pkg.highlights.map((highlight, idx) => (
                          <li key={idx} className="highlights-item">
                            <span className="highlights-icon-blue">
                              <svg className="h-check-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            <span className="highlights-text">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Inclusions & Exclusions Card */}
                <motion.div className="details-card-block dropdown-card is-open" id="inclusion" variants={childVariants(reducedMotion)}>
                  <div className="dropdown-header">
                    <h3 className="inc-exc-title-red">Inclusions & Exclusions</h3>
                    <span className="dropdown-chevron">
                      <svg className="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                    <div className="dropdown-inner">
                      <div className="inc-exc-columns">
                        {/* Inclusions */}
                        <div className="inc-exc-column">
                          <h4 className="inc-exc-column-title text-green">Inclusions</h4>
                          <ul className="inc-exc-list">
                            {pkg.inclusions.map((inc, idx) => (
                              <li key={idx} className="inc-exc-item">
                                <span className="inc-exc-icon text-green">
                                  <svg className="list-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                                <span className="inc-exc-text">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Exclusions */}
                        <div className="inc-exc-column">
                          <h4 className="inc-exc-column-title text-red">Exclusions</h4>
                          <ul className="inc-exc-list">
                            {pkg.exclusions.map((exc, idx) => (
                              <li key={idx} className="inc-exc-item">
                                <span className="inc-exc-icon text-red">
                                  <svg className="list-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </span>
                                <span className="inc-exc-text">{exc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="details-tab-content">
              {/* Stay & Transfers Card */}
              <motion.div className="details-card-block" variants={childVariants(reducedMotion)}>
                <h3 className="highlights-title-red">Accommodation & Transfer Details</h3>
                <p className="stay-transfers-intro">{pkg.stayTransfers}</p>

                <div className="stay-details-grid">
                  <div className="stay-details-card glass">
                    <div className="stay-details-header">
                      <svg className="stay-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="stay-details-title">Verified Resort Stay</span>
                    </div>
                    <ul className="stay-details-list">
                      <li>Room Type: Premium AC Room / Deluxe Cottage</li>
                      <li>Wi-Fi: Complimentary High Speed Internet</li>
                      <li>Meal Schedule: Daily buffet meals as per chosen card option</li>
                      <li>Amenities: Swimming pool, 24/7 reception desk, luggage lockers</li>
                    </ul>
                  </div>

                  <div className="stay-details-card glass">
                    <div className="stay-details-header">
                      <svg className="stay-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span className="stay-details-title">Dedicated Transport Services</span>
                    </div>
                    <ul className="stay-details-list">
                      <li>Airport Pick & Drop: Private Air-conditioned Sedan / SUV</li>
                      <li>Sightseeing Transport: Daily coach tours / Private car schedules</li>
                      <li>Driver Allowances: Included (covering parking fees, tolls, fuel surcharge)</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

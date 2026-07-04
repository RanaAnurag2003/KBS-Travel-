import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "./HeroV2.css";
import { mockPackages } from "./mockData";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SidebarFilters from "./components/SidebarFilters";
import TourCard from "./components/TourCard";
import DetailSection from "./components/DetailSection";
import FormModal from "./components/FormModal";
import OfferSection from "./components/OfferSection";
import PromoBanner from "./components/PromoBanner";
import Footer from "./components/Footer";
import TestimonialsSection from "./components/TestimonialsSection";

// Import generated assets for Testimonials & Footer
import avatarSashank from "./assets/avatar_sashank.png";
import avatarAysha from "./assets/avatar_aysha.png";
import avatarRitika from "./assets/avatar_ritika.png";

const ITEMS_PER_PAGE = 9;

const testimonialsList = [
  {
    name: "Sashank Talwar",
    location: "Amritsar",
    avatar: avatarSashank,
    rating: 5,
    text: "Breathtaking landscapes, friendly locals, and rich culture left us mesmerized. A must-visit destination!"
  },
  {
    name: "Aysha Maheshwari",
    location: "Guwahati",
    avatar: avatarAysha,
    rating: 5,
    text: "Peaceful and stunning! The houseboat experience was luxurious, with delicious food and serene views."
  },
  {
    name: "Ritika Mathur",
    location: "Bhopal",
    avatar: avatarRitika,
    rating: 5,
    text: "Amazing family trip! The kids loved the beaches and elephant safari. Every destination was unique!"
  }
];

export default function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Search & Category states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All"); // All selected by default

  // Filter States
  const [filters, setFilters] = useState({
    tourTypes: [],
    popularFilters: [],
    maxPrice: 50000,
    stars: [],
    safety: []
  });

  // Pagination & Active details states
  const [hasSearched, setHasSearched] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activePackageId, setActivePackageId] = useState(1); // Default to package 1
  const [currentSection, setCurrentSection] = useState("home");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Auto-open modal tracking
  const hasAutoOpened = useRef(false);

  // Scroll Spy state
  const isClickScrolling = useRef(false);

  // Collapsible FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // Page fade-in animation on mount
  useEffect(() => {
    const root = document.querySelector(".app-root");
    if (root) {
      root.classList.add("fade-in");
    }
  }, []);

  // Auto-open modal after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAutoOpened.current) {
        setModalData({ type: "enquiry" });
        setIsModalOpen(true);
        hasAutoOpened.current = true;
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for Scroll Spy
  useEffect(() => {
    const sections = document.querySelectorAll("section[id], main[id], footer[id], div[id='home'], div[id='inclusion'], div[id='packages']");
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Trigger when the section reaches the upper portion of the screen
      threshold: 0
    };

    const observerCallback = (entries) => {
      if (isClickScrolling.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Handle section scrolling
  const handleNavigate = (sectionId) => {
    setCurrentSection(sectionId);
    isClickScrolling.current = true;

    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate header offset
      const offset = 90; // Slightly larger offset to ensure sticky header doesn't cover titles
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Allow intersection observer to resume after scroll animation (~800ms)
      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({
      tourTypes: [],
      popularFilters: [],
      maxPrice: 50000,
      stars: [],
      safety: []
    });
    setSearchQuery("");
    setHasSearched(false);
  };

  const handleSearch = (searchData) => {
    console.log("Search with:", searchData);
    setSearchQuery(searchData.toDestination || searchData.fromCity);
    setHasSearched(true);
    setCurrentPage(1);
    handleOpenSearchBarQuote(searchData);

    // Smooth scroll to packages section after state update
    setTimeout(() => {
      handleNavigate("packages");
    }, 100);
  };

  // Open modals
  const handleOpenGetQuote = (pkg = null) => {
    setModalData({
      type: "quote",
      packageTitle: pkg ? pkg.title : "",
      name: "",
      phone: ""
    });
    hasAutoOpened.current = true;
    setIsModalOpen(true);
  };

  const handleOpenSearchBarQuote = (formData) => {
    setModalData({
      type: "quote",
      packageTitle: formData.planning ? `${formData.planning} Custom Package` : "Custom Tour Package",
      name: formData.name,
      phone: formData.phone
    });
    hasAutoOpened.current = true;
    setIsModalOpen(true);
  };

  const handleOpenBookOnline = (pkg) => {
    setModalData({
      type: "book",
      packageTitle: pkg.title,
      name: "",
      phone: ""
    });
    hasAutoOpened.current = true;
    setIsModalOpen(true);
  };

  // Filter package data
  const filteredPackages = mockPackages.filter((pkg) => {
    // 1. Text Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pkg.title.toLowerCase().includes(q);
      const matchDest = pkg.destination.toLowerCase().includes(q);
      if (!matchTitle && !matchDest) return false;
    }

    // 2. Category Tab
    if (selectedCategory && selectedCategory !== "All") {
      if (!pkg.categories.includes(selectedCategory)) return false;
    }

    // 3. Tour Types
    if (filters.tourTypes.length > 0) {
      const matchType = filters.tourTypes.some((type) => pkg.tourTypes.includes(type));
      if (!matchType) return false;
    }

    // 4. Popular Filters
    if (filters.popularFilters.length > 0) {
      const matchAllPopular = filters.popularFilters.every((f) => pkg.popularFilters.includes(f));
      if (!matchAllPopular) return false;
    }

    // 5. Stars Ratings
    if (filters.stars.length > 0) {
      if (!filters.stars.includes(pkg.stars)) return false;
    }

    // 6. Max Price
    if (pkg.price > filters.maxPrice) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const paginatedPackages = filteredPackages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Active package details object
  const activePackage = mockPackages.find((p) => p.id === activePackageId);

  // FAQ mock list
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

  return (
    <div className="app-root">
      {/* Header Navigation */}
      <Header
        currentSection={currentSection}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <HeroSection onSearch={handleSearch} />

      {hasSearched && (
        <>
          {/* Packages Section */}
          <main className="packages-section">
            <div className="packages-container">

              <OfferSection onCtaClick={handleOpenGetQuote} />

              {/* Section Heading & Category Tabs */}
              <div className="packages-header-block" id="packages">
                <h2 className="section-title">Showing Tours packages & itinerary</h2>

                <div className="category-tabs-bar">
                  {["All", "Honeymoon", "Beach", "Adventure", "Weekend", "Group"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`category-tab-pill ${selectedCategory === cat ? "category-tab-pill-active" : ""
                        } cursor-pointer`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="packages-content-layout">

                {/* Sidebar Filters */}
                <SidebarFilters
                  filters={filters}
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                  }}
                  onClearAll={handleClearAll}
                  filteredCount={filteredPackages.length}
                />

                {/* Tour Cards Grid */}
                <div className="tour-cards-feed">
                  {paginatedPackages.length > 0 ? (
                    <>
                      {paginatedPackages.map((pkg, idx) => {
                        return (
                          <React.Fragment key={pkg.id}>
                            <TourCard
                              pkg={pkg}
                              isNew={idx < 3}
                              isActive={pkg.id === activePackageId}
                              onSelect={(id) => {
                                setActivePackageId(id);
                                handleNavigate("overview");
                              }}
                              onGetQuote={handleOpenGetQuote}
                            />
                            {/* PromoBanner between each row */}
                            {(idx === 2 || idx === 5) && (
                              <div style={{ gridColumn: '1 / -1', margin: '4px 0' }}>
                                <PromoBanner onAction={() => handleOpenGetQuote()} />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {totalPages > 1 && (
                        <div className="pagination-controls" style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setCurrentPage(i + 1);
                                handleNavigate("packages");
                              }}
                              style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                background: currentPage === i + 1 ? '#0ea5e9' : '#f1f5f9',
                                color: currentPage === i + 1 ? '#fff' : '#475569',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-packages-found glass">
                      <svg className="no-packages-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No holiday packages match your selected filters.</p>
                      <button onClick={handleClearAll} className="no-packages-reset-btn cursor-pointer">
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Package Detail Section */}
          <DetailSection
            pkg={activePackage}
            onBookOnline={handleOpenBookOnline}
            onSendInquiry={handleOpenGetQuote}
          />
        </>
      )}

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={testimonialsList} />

      <div className="info-sections-wrapper">
        {/* Global Inclusions Banner (Inclusion Target) */}
        <section className="inclusions-global-section">
          <div className="inclusions-global-container glass">
            <div className="inclusions-header">
              <h2 className="section-title">Why Book With KBS Travels?</h2>
              <p className="inclusions-subtitle">Experience the ultimate peace of mind with our premium travel services tailored just for you.</p>
            </div>
            <div className="inclusions-global-grid">
              <div className="inclusion-item premium-card">
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
              </div>

              <div className="inclusion-item premium-card">
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
              </div>

              <div className="inclusion-item premium-card">
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
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="faq-section" id="faq">
          <div className="faq-container glass">
            <div className="faq-split-layout">
              {/* Left Column: FAQ Accordion */}
              <div className="faq-left-column">
                <h2 className="section-title text-left">Frequently Asked Questions</h2>
                <div className="faq-list-accordion">
                  {faqList.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div key={idx} className={`faq-card glass ${isOpen ? "is-open" : ""}`}>
                        <button
                          type="button"
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="faq-question-btn cursor-pointer"
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
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Floating destination cards */}
              <div className="faq-right-column">
                <div className="faq-floating-cards-wrapper">
                  <div
                    className="floating-dest-card-v2"
                    style={{ top: "6%", left: "0%", animationDelay: "0s" }}
                  >
                    <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&h=300&fit=crop" alt="Goa" />
                    <div className="dest-caption-v2">
                      <span className="dot"></span>
                      Live from Goa:
                      <br />
                      Sunset Views & 28°C
                    </div>
                  </div>

                  <div
                    className="floating-dest-card-v2"
                    style={{ bottom: "5%", left: "7%", animationDelay: "2s" }}
                  >
                    <img src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&h=300&fit=crop" alt="Maldives" />
                    <div className="dest-caption-v2">
                      <span className="dot"></span>
                      Live from Maldives:
                      <br />
                      Clear Skies & 30°C
                    </div>
                  </div>

                  <div
                    className="floating-dest-card-v2"
                    style={{ top: "25%", right: "0%", animationDelay: "4s" }}
                  >
                    <img src="https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=500&h=300&fit=crop" alt="Swiss Alps" />
                    <div className="dest-caption-v2">
                      <span className="dot"></span>
                      Live from Swiss Alps:
                      <br />
                      Snowing & -2°C
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>



      {/* Redesigned Footer Section */}
      <Footer onNavigate={handleNavigate} handleOpenGetQuote={handleOpenGetQuote} />

      {/* Booking Form Overlay Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalData={modalData}
      />
    </div>
  );
}

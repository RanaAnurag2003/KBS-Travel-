import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { sectionVariants, viewportSettings, usePrefersReducedMotion } from "./utils/motionVariants";
import "./App.css";
import "./HeroV2.css";
import { mockPackages } from "./mockData";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SidebarFilters from "./components/SidebarFilters";
import TourCard from "./components/TourCard";
import LazyViewportSection from "./components/LazyViewportSection";
import ScrollToTopButton from "./components/ScrollToTopButton";

// Lazy-loaded components below-the-fold
const importOfferSection = () => import("./components/OfferSection");
const importWhyBookWithUs = () => import("./components/WhyBookWithUs");
const importTestimonialsSection = () => import("./components/TestimonialsSection");
const importFAQSection = () => import("./components/FAQSection");
const importFooter = () => import("./components/Footer");
const importDetailSection = () => import("./components/DetailSection");
const importFormModal = () => import("./components/FormModal");
const importPromoBanner = () => import("./components/PromoBanner");
const importPromoSlideshowBanner = () => import("./components/PromoSlideshowBanner");

const OfferSection = React.lazy(importOfferSection);
const WhyBookWithUs = React.lazy(importWhyBookWithUs);
const TestimonialsSection = React.lazy(importTestimonialsSection);
const FAQSection = React.lazy(importFAQSection);
const Footer = React.lazy(importFooter);
const DetailSection = React.lazy(importDetailSection);
const FormModal = React.lazy(importFormModal);
const PromoBanner = React.lazy(importPromoBanner);
const PromoSlideshowBanner = React.lazy(importPromoSlideshowBanner);

// Import compressed webp avatars
import avatarSashank from "./assets/avatar_sashank.webp";
import avatarAysha from "./assets/avatar_aysha.webp";
import avatarRitika from "./assets/avatar_ritika.webp";

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
  const [selectedCategory, setSelectedCategory] = useState("All");

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
  const [activePackageId, setActivePackageId] = useState(1);
  const [currentSection, setCurrentSection] = useState("home");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Auto-open modal tracking
  const hasAutoOpened = useRef(false);

  // Scroll Spy state
  const isClickScrolling = useRef(false);

  // prefers-reduced-motion hook
  const reducedMotion = usePrefersReducedMotion();

  // Initialize Lenis smooth scroll
  const lenisRef = useRef(null);
  useEffect(() => {
    if (reducedMotion) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    
    lenisRef.current = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

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

  // Idle prefetching loop: preload dynamic component chunks when browser is idle
  useEffect(() => {
    const prefetchList = [
      importOfferSection,
      importWhyBookWithUs,
      importTestimonialsSection,
      importFAQSection,
      importFooter,
      importFormModal,
      importDetailSection,
      importPromoBanner,
      importPromoSlideshowBanner
    ];

    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    
    let index = 0;
    const schedulePrefetch = () => {
      if (index < prefetchList.length) {
        idleCallback(() => {
          prefetchList[index]();
          index++;
          schedulePrefetch();
        });
      }
    };
    
    // Start prefetching 2 seconds after the page mounts
    const timer = setTimeout(schedulePrefetch, 2000);
    return () => clearTimeout(timer);
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
      rootMargin: "-20% 0px -70% 0px",
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

  // Handle section scrolling using Lenis if available
  const handleNavigate = useCallback((sectionId) => {
    setCurrentSection(sectionId);
    isClickScrolling.current = true;

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 90;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      if (lenisRef.current) {
        lenisRef.current.scrollTo(offsetPosition, {
          duration: 1.2,
          immediate: false
        });
      } else {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }

      setTimeout(() => {
        isClickScrolling.current = false;
      }, 800);
    }
  }, []);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setFilters({
      tourTypes: [],
      popularFilters: [],
      maxPrice: 50000,
      stars: [],
      safety: []
    });
    setSearchQuery("");
  }, []);

  // Modal open handlers
  const handleOpenGetQuote = useCallback((pkg = null) => {
    setModalData({
      type: "quote",
      packageTitle: pkg ? pkg.title : "",
      name: "",
      phone: ""
    });
    hasAutoOpened.current = true;
    setIsModalOpen(true);
  }, []);

  const handleOpenSearchBarQuote = useCallback((formData) => {
    setModalData({
      type: "quote",
      packageTitle: formData.planning ? `${formData.planning} Custom Package` : "Custom Tour Package",
      name: formData.name,
      phone: formData.phone
    });
    hasAutoOpened.current = true;
    setIsModalOpen(true);
  }, []);

  const handleOpenBookOnline = useCallback((pkg) => {
    setModalData({
      type: "book",
      packageTitle: pkg.title,
      name: "",
      phone: ""
    });
    hasAutoOpened.current = true;
    setIsModalOpen(true);
  }, []);

  const handleSearch = useCallback((searchData) => {
    console.log("Search with:", searchData);
    setSearchQuery(searchData.toDestination || searchData.fromCity);
    setHasSearched(true);
    setCurrentPage(1);
    handleOpenSearchBarQuote(searchData);

    setTimeout(() => {
      handleNavigate("packages");
    }, 100);
  }, [handleOpenSearchBarQuote, handleNavigate]);

  // Filter package data - Memoized to prevent heavy recalculation on theme toggle or scrolling
  const filteredPackages = useMemo(() => {
    return mockPackages.filter((pkg) => {
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
  }, [searchQuery, selectedCategory, filters]);

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const paginatedPackages = useMemo(() => {
    return filteredPackages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  // Active package details object - Memoized
  const activePackage = useMemo(() => {
    return mockPackages.find((p) => p.id === activePackageId);
  }, [activePackageId]);

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
            <motion.div
              className="packages-container"
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              variants={sectionVariants(reducedMotion)}
            >

              <LazyViewportSection height="350px">
                <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '350px' }} />}>
                  <OfferSection onCtaClick={handleOpenGetQuote} />
                </Suspense>
              </LazyViewportSection>

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
                                <Suspense fallback={null}>
                                  {idx === 2 ? (
                                    <PromoBanner onAction={() => handleOpenGetQuote()} />
                                  ) : (
                                    <PromoSlideshowBanner onAction={() => handleOpenGetQuote()} />
                                  )}
                                </Suspense>
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
            </motion.div>
          </main>

          {/* Package Detail Section */}
          <LazyViewportSection height="400px" id="overview">
            <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '400px' }} />}>
              <DetailSection
                pkg={activePackage}
                onBookOnline={handleOpenBookOnline}
                onSendInquiry={handleOpenGetQuote}
              />
            </Suspense>
          </LazyViewportSection>
        </>
      )}

      {/* Testimonials Section */}
      <LazyViewportSection height="450px" id="reviews">
        <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '450px' }} />}>
          <TestimonialsSection testimonials={testimonialsList} />
        </Suspense>
      </LazyViewportSection>

      <div className="info-sections-wrapper">
        {/* Global Inclusions Banner */}
        <LazyViewportSection height="250px" id="inclusion">
          <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '250px' }} />}>
            <WhyBookWithUs />
          </Suspense>
        </LazyViewportSection>

        {/* FAQ Accordion Section */}
        <LazyViewportSection height="400px" id="faq">
          <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '400px' }} />}>
            <FAQSection />
          </Suspense>
        </LazyViewportSection>
      </div>

      {/* Redesigned Footer Section */}
      <LazyViewportSection height="300px" id="footer">
        <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '300px' }} />}>
          <Footer onNavigate={handleNavigate} handleOpenGetQuote={handleOpenGetQuote} />
        </Suspense>
      </LazyViewportSection>

      {/* Booking Form Overlay Modal */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <FormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            modalData={modalData}
          />
        </Suspense>
      )}

      {/* Global Scroll to Top progress wheel */}
      <ScrollToTopButton />
    </div>
  );
}

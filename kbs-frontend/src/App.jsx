import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, useContext } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { sectionVariants, viewportSettings, usePrefersReducedMotion } from "./utils/motionVariants";
import "./App.css";
import "./HeroV2.css";
import { fetchPackages } from "./api";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import SidebarFilters from "./components/SidebarFilters";
import TourCard from "./components/TourCard";
import LazyViewportSection from "./components/LazyViewportSection";
import ScrollToTopButton from "./components/ScrollToTopButton";
import MobileCTA from "./components/MobileCTA";
import GoogleOneTap from "./components/GoogleOneTap";
import useAuth from "./hooks/useAuth";
import { CMSContext } from "./context/CMSContext";
import { EditableText, EditableImage, EditableCard } from "./components/CMSWrappers";

const AdminToolbar = React.lazy(() => import("./components/AdminToolbar"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const VerifyModal = React.lazy(() => import("./components/VerifyModal"));



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

// Icons shown only in the mobile category card grid (hidden on desktop via CSS)
const categoryIcons = {
  All: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Honeymoon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.727c-.4 0-.8-.15-1.1-.44L3.9 13.24c-2.1-2.1-2.1-5.5 0-7.6 2-2.02 5.28-2.06 7.33-.1l.77.73.77-.73c2.05-1.96 5.33-1.92 7.33.1 2.1 2.1 2.1 5.5 0 7.6l-7 7.05c-.3.29-.7.44-1.1.44z"
      />
    </svg>
  ),
  Beach: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21c4-2 14-2 18 0M12 3c2 3 2 7-1 10M8 13c2-1 6-1 9 1M5 17c1-3 4-5 7-5"
      />
    </svg>
  ),
  Adventure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l6-11 4 7 3-5 5 9H3z" />
    </svg>
  ),
  Weekend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  Group: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 20c0-3 3-5 7-5s7 2 7 5M16 8a3 3 0 100-6M17 12c2.5.3 5 1.8 5 5"
      />
    </svg>
  )
};

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
  const { isAuthenticated } = useAuth();

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Theme State
  const [darkMode, setDarkMode] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const hasAutoOpenedVerify = useRef(false);

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
  const [hasSelectedPackage, setHasSelectedPackage] = useState(false);

  const { packages: rawPackages, editMode, setEditMode, previewMode, isAdmin, login } = useContext(CMSContext);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const normalizedPath = currentPath.endsWith("/") && currentPath !== "/" ? currentPath.slice(0, -1) : currentPath;
    if (normalizedPath === "/admin" && isAdmin) {
      navigateTo("/admin/dashboard");
    } else if ((normalizedPath === "/admin/dashboard" || normalizedPath === "/admin/editor" || normalizedPath === "/editor") && !isAdmin) {
      navigateTo("/admin");
    }
  }, [currentPath, isAdmin]);

  useEffect(() => {
    const normalizedPath = currentPath.endsWith("/") && currentPath !== "/" ? currentPath.slice(0, -1) : currentPath;
    if (normalizedPath === "/admin/editor" || normalizedPath === "/editor") {
      if (isAdmin) setEditMode(true);
    } else {
      setEditMode(false);
    }
  }, [currentPath, isAdmin, setEditMode]);



  const packages = useMemo(() => {
    const extractMultiWord = (str, knownList) => {
      if (!str) return [];
      if (Array.isArray(str)) return str;
      return knownList.filter(k => str.includes(k));
    };

    const knownTourTypes = ["Solo Tour", "Group Tour", "Couple Friendly", "Family Tour", "Corporate Tour", "Honeymoon Tour"];
    const knownPopularFilters = ["Sightseeing Tours", "Adventure Activities", "Local Cuisine Tasting", "Historical Site Visits", "Cultural Shows"];

    // Filter out inactive packages (already filtered by backend API)
    const activePackages = rawPackages;


    return activePackages.map(pkg => {
      const useDraft = editMode && !previewMode;
      const getVal = (field) => {
        if (!useDraft) return pkg[field];
        const draftKey = `draft${field.charAt(0).toUpperCase() + field.slice(1)}`;
        return pkg[draftKey] !== null && pkg[draftKey] !== undefined ? pkg[draftKey] : pkg[field];
      };

      const title = getVal("title");
      const destination = getVal("destination");
      const price = getVal("price");
      const duration = getVal("duration");
      const image = getVal("image");
      const bullets = getVal("bullets");
      const tags = getVal("tags");
      const categories = getVal("categories");
      const tourTypes = getVal("tourTypes");
      const popularFilters = getVal("popularFilters");
      const highlights = getVal("highlights");
      const inclusions = getVal("inclusions");
      const exclusions = getVal("exclusions");
      const stayTransfers = getVal("stayTransfers");

      return {
        ...pkg,
        title,
        destination,
        price,
        duration,
        image,
        bullets: typeof bullets === 'string' ? bullets.split(/(?=[A-Z][a-z])/).filter(Boolean) : (bullets || []),
        tags: typeof tags === 'string' ? tags.split(' ').filter(Boolean) : (tags || []),
        categories: typeof categories === 'string' ? categories.split(' ').filter(Boolean) : (categories || []),
        tourTypes: extractMultiWord(tourTypes, knownTourTypes),
        popularFilters: extractMultiWord(popularFilters, knownPopularFilters),
        highlights: typeof highlights === 'string' ? highlights.split(/(?=[A-Z][a-z])/).filter(Boolean) : (highlights || []),
        inclusions: typeof inclusions === 'string' ? inclusions.split(/(?=[A-Z][a-z])/).filter(Boolean) : (inclusions || []),
        exclusions: typeof exclusions === 'string' ? exclusions.split(/(?=[A-Z][a-z])/).filter(Boolean) : (exclusions || []),
        stayTransfers
      };
    });
  }, [rawPackages, editMode, previewMode]);

  const packagesLoading = rawPackages.length === 0;
  const packagesError = null;


  // Auto-open modal tracking
  const hasAutoOpened = useRef(false);
  const verifyClosed = useRef(false);

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
      lerp: 0.08,
      wheelMultiplier: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.5,
      infinite: false,
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

  // Auto-open VerifyModal after 2.5 seconds if guest
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && !hasAutoOpenedVerify.current) {
        setIsVerifyModalOpen(true);
        hasAutoOpenedVerify.current = true;
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Auto-close VerifyModal and prevent auto-enquiry popup if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsVerifyModalOpen(false);
      hasAutoOpened.current = true;
    }
  }, [isAuthenticated]);

  const handleCloseVerify = useCallback(() => {
    setIsVerifyModalOpen(false);
    verifyClosed.current = true;
  }, []);

  // Listen for scroll to open enquiry FormModal at 50% scroll height
  useEffect(() => {
    const handleScrollForEnquiry = () => {
      if (verifyClosed.current && !isAuthenticated && !hasAutoOpened.current && !isModalOpen) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        if (scrollPercent >= 50) {
          setModalData({ type: "enquiry" });
          setIsModalOpen(true);
          hasAutoOpened.current = true;
        }
      }
    };

    window.addEventListener("scroll", handleScrollForEnquiry, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollForEnquiry);
  }, [isAuthenticated, isModalOpen]);

  // Robust Scroll Spy using scroll event
  useEffect(() => {
    const handleScrollSpy = () => {
      if (isClickScrolling.current) return;

      const sections = document.querySelectorAll("[id='home'], [id='overview'], [id='packages'], [id='inclusion'], [id='faq'], [id='footer']");
      let current = "home";
      let minDistance = Infinity;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Check distance from top of screen to the top of the section
        // We consider a section active if its top is near the top of the viewport
        // or if it spans across the middle of the viewport
        if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.3) {
           current = section.id;
        }
      });

      setCurrentSection(current);
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    // Run once on mount or when dependencies change
    handleScrollSpy();

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
    };
  }, [hasSearched, packagesLoading]);

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

  // Lightweight search triggered from the Header's mobile search bar.
  // Unlike handleSearch (used by the hero SearchBar), this doesn't open the
  // enquiry modal - it just filters packages by the typed query and scrolls
  // the user straight to the results.
  const handleHeaderSearch = useCallback((query) => {
    setSearchQuery(query);
    setHasSearched(true);
    setCurrentPage(1);

    setTimeout(() => {
      handleNavigate("packages");
    }, 100);
  }, [handleNavigate]);

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

  const handleSelectPackage = useCallback((id) => {
    setHasSelectedPackage(true);
    setActivePackageId(id);
    handleNavigate("overview");
  }, [handleNavigate]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Filter package data - Memoized to prevent heavy recalculation on theme toggle or scrolling
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // 1. Text Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = pkg.title.toLowerCase().includes(q);
        const matchDest = pkg.destination.toLowerCase().includes(q);
        const priceMatch = q.match(/\d+/);
        const matchPrice = priceMatch ? pkg.price <= parseInt(priceMatch[0]) : false;
        if (!matchTitle && !matchDest && !matchPrice) return false;
      }

      // 2. Category Tab
      if (selectedCategory && selectedCategory !== "All") {
        const matchCat = pkg.categories.includes(selectedCategory);
        const matchTourType = pkg.tourTypes.some(t => t.includes(selectedCategory));
        const matchTags = pkg.tags.some(t => t.includes(selectedCategory));
        if (!matchCat && !matchTourType && !matchTags) return false;
      }

      // 3. Tour Types (from sidebar)
      if (filters.tourTypes.length > 0) {
        const matchType = filters.tourTypes.some((type) => {
          const baseWord = type.split(" ")[0]; // e.g. "Honeymoon" from "Honeymoon Tour"
          return pkg.tourTypes.includes(type) || pkg.categories.includes(baseWord);
        });
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
  }, [packages, searchQuery, selectedCategory, filters]);

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const paginatedPackages = useMemo(() => {
    return filteredPackages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredPackages, currentPage]);

  const activePackage = useMemo(() => {
    return packages.find((p) => p.id === activePackageId);
  }, [packages, activePackageId]);

  const normalizedPath = currentPath.endsWith("/") && currentPath !== "/" ? currentPath.slice(0, -1) : currentPath;

  if (normalizedPath === "/admin" && !isAdmin) {
    return (
      <div className="kbs-login-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .shake-form {
            animation: error-shake 0.4s ease-in-out;
          }
          .kbs-login-screen {
            position: fixed;
            inset: 0;
            background-color: #0b0b0b;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            overflow-y: auto;
            overflow-x: hidden;
            user-select: none;
            padding: 32px 16px;
          }
          .kbs-noise-overlay {
            position: absolute;
            inset: 0;
            opacity: 0.025;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            z-index: 1;
          }
          .kbs-deco-icon {
            position: absolute;
            color: rgba(255,255,255,0.9);
            pointer-events: none;
            user-select: none;
            z-index: 0;
          }
          .kbs-deco-compass { top: 9%; left: 7%; width: 92px; height: 92px; }
          .kbs-deco-plane-tr { top: 10%; right: 7%; width: 84px; height: 84px; transform: rotate(35deg); }
          .kbs-deco-plane-bl { bottom: 11%; left: 8%; width: 84px; height: 84px; transform: rotate(-125deg); }
          .kbs-deco-globe { bottom: 9%; right: 9%; width: 88px; height: 88px; }
          .kbs-deco-star { bottom: 15%; right: 6%; width: 20px; height: 20px; color: rgba(255,255,255,0.6); }
          @media (max-width: 820px) {
            .kbs-deco-icon { display: none; }
          }
          .kbs-login-card {
            width: 100%;
            max-width: 530px;
            background-color: rgba(45, 45, 45, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
            padding: 36px 40px 32px;
            transition: all 0.3s ease;
          }
          .kbs-login-card.kbs-error {
            border-color: rgba(239, 68, 68, 0.4);
          }
          .kbs-input-wrap {
            position: relative;
          }
          .kbs-input,
          .kbs-select {
            width: 100%;
            height: 42px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background-color: #1e1e1e;
            color: #ffffff;
            font-size: 13px;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .kbs-input {
            padding-left: 36px;
            padding-right: 32px;
          }
          .kbs-select {
            padding-left: 14px;
            padding-right: 32px;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(142,142,142)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 12px;
          }
          .kbs-input:focus,
          .kbs-select:focus {
            outline: none;
            border-color: #ff5a1f;
            box-shadow: 0 0 0 3px rgba(255, 90, 31, 0.15);
          }
          .kbs-checkbox {
            width: 15px;
            height: 15px;
            border-radius: 4px;
            accent-color: #ff5a1f;
            cursor: pointer;
          }
          .kbs-forgot-link {
            color: #8e8e8e;
            transition: color 0.15s ease;
          }
          .kbs-forgot-link:hover {
            color: #ffffff;
            text-decoration: underline;
          }
          .kbs-signin-btn {
            width: 100%;
            height: 44px;
            border: none;
            border-radius: 6px;
            background: linear-gradient(90deg, #ff6a00 0%, #ff3d00 100%);
            color: #ffffff;
            font-size: 13.5px;
            font-weight: 700;
            letter-spacing: 0.01em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 8px 20px rgba(255, 90, 31, 0.25);
          }
          .kbs-signin-btn:hover:not(:disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
            box-shadow: 0 10px 24px rgba(255, 90, 31, 0.35);
          }
          .kbs-signin-btn:active:not(:disabled) {
            transform: translateY(0);
          }
          .kbs-signin-btn:disabled {
            opacity: 0.75;
            cursor: not-allowed;
          }
          .kbs-back-link {
            color: #8e8e8e;
            font-size: 12px;
            text-align: center;
            text-decoration: underline;
            background: transparent;
            border: 0;
            cursor: pointer;
            transition: color 0.15s ease;
          }
          .kbs-back-link:hover {
            color: #ffffff;
          }
          /* Custom autofill color overrides to prevent browsers from making input backgrounds white/blue */
          .cms-autofill-input:-webkit-autofill,
          .cms-autofill-input:-webkit-autofill:hover,
          .cms-autofill-input:-webkit-autofill:focus,
          .cms-autofill-input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #1e1e1e inset !important;
            -webkit-text-fill-color: #ffffff !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>

        {/* Vector Noise Overlay */}
        <div className="kbs-noise-overlay" />

        {/* Decorative Travel Icons */}
        {/* Compass (top left) */}
        <div className="kbs-deco-icon kbs-deco-compass" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
            <circle cx="50" cy="50" r="42" />
            <circle cx="50" cy="50" r="38" />
            <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" />
            <path d="M23.2 23.2 L28.9 28.9 M71.1 71.1 L76.8 76.8 M71.1 23.2 L76.8 28.9 M23.2 71.1 L28.9 76.8" />
            <path d="M50 50 L68 32 M50 50 L32 68" />
            <polygon points="50,50 63,33 67,37" fill="currentColor" opacity="0.2" />
            <polygon points="50,50 37,67 33,63" />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Airplane (top right) */}
        <div className="kbs-deco-icon kbs-deco-plane-tr" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" className="w-full h-full">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
          </svg>
        </div>

        {/* Airplane (bottom left) */}
        <div className="kbs-deco-icon kbs-deco-plane-bl" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" className="w-full h-full">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
          </svg>
        </div>

        {/* Globe (bottom right) */}
        <div className="kbs-deco-icon kbs-deco-globe" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9" className="w-full h-full">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M3.6 9h16.8M3.6 15h16.8" />
          </svg>
        </div>

        {/* Small star/sparkle near the globe */}
        <div className="kbs-deco-icon kbs-deco-star" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
          </svg>
        </div>

        <div className="w-full flex flex-col items-center" style={{ maxWidth: '530px', position: 'relative', zIndex: 10 }}>
          {/* Logo Section */}
          <div className="flex items-center gap-3 select-none pointer-events-none" style={{ marginBottom: '28px' }}>
            <div className="rounded-xl flex items-center justify-center shadow-md" style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)' }}>
              <svg style={{ width: '22px', height: '22px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2.945M11 3.935V5.5A2.5 2.5 0 018.5 8h-.5a2 2 0 00-2 2 2 2 0 01-2 2H3m16 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none justify-center">
              <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'inherit' }}>KBS Travels</span>
              <span style={{ color: '#38bdf8', fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '3px', fontFamily: 'inherit' }}>Visual CMS</span>
            </div>
          </div>

          <div className={`kbs-login-card ${loginError ? 'shake-form kbs-error' : ''}`}>
            <div className="text-center" style={{ marginBottom: '26px' }}>
              <h3 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '8px' }}>Welcome back</h3>
              <p style={{ color: '#b0b0b0', fontSize: '14px', lineHeight: 1.4 }}>Enter your credentials to access the editor.</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoginLoading(true);
              setLoginError(false);
              const keyInput = e.target.elements.apiKey.value;
              const roleInput = e.target.elements.roleSelection.value;

              await new Promise(resolve => setTimeout(resolve, 800));
              const success = await login(keyInput, roleInput);
              setLoginLoading(false);
              if (success) {
                if (rememberMe) {
                  localStorage.setItem("kbs_remember_me", "true");
                } else {
                  localStorage.removeItem("kbs_remember_me");
                }
                navigateTo("/admin/dashboard");
              } else {
                setLoginError(true);
                setTimeout(() => setLoginError(false), 500);
              }
            }} className="flex flex-col">

              <div className="flex flex-col" style={{ marginBottom: '18px' }}>
                <label style={{ color: '#8e8e8e', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '9px' }}>Admin Secret Key</label>
                <div className="kbs-input-wrap">
                  <svg style={{ width: '15px', height: '15px', color: '#8e8e8e', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H3.75v-2.25A2.25 2.25 0 0 1 6 17.25V15h2.25v-2.25h2.25c.404 0 .8-.161 1.088-.45l.83-.829a2.25 2.25 0 0 1 1.563-.43 6 6 0 0 1 7.029-5.912z" />
                  </svg>
                  <input
                    name="apiKey"
                    type="password"
                    placeholder="••••••••••••••••"
                    required
                    className="kbs-input cms-autofill-input"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <svg style={{ width: '15px', height: '15px', color: '#666666', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#8e8e8e', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '9px' }}>Editor Role</label>
                <div className="kbs-input-wrap">
                  <select
                    name="roleSelection"
                    className="kbs-select"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Content Editor">Content Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between select-none" style={{ fontSize: '12px', color: '#8e8e8e', marginBottom: '22px' }}>
                <label className="flex items-center cursor-pointer" style={{ gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="kbs-checkbox"
                  />
                  Remember secret key
                </label>
                <a href="#forgot" className="kbs-forgot-link" onClick={(e) => { e.preventDefault(); alert("Contact the database administrator to obtain the secret API key."); }}>Forgot Key?</a>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="kbs-signin-btn"
                style={{ marginBottom: '16px' }}
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin" style={{ height: '16px', width: '16px', color: '#ffffff' }} viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  "Sign In to CMS"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  navigateTo("/");
                }}
                className="kbs-back-link"
              >
                Back to public website
              </button>

            </form>
          </div>

          <p style={{ color: 'rgba(142, 142, 142, 0.5)', fontSize: '11px', marginTop: '22px' }} className="select-none pointer-events-none">© 2026 KBS Travels • v2.4.0</p>
        </div>
      </div>
    );
  }

  if (normalizedPath === "/admin/dashboard" && isAdmin) {
    return (
      <Suspense fallback={<div style={{ color: "#fff", padding: "50px", textAlign: "center" }}>Loading Admin Dashboard...</div>}>
        <Dashboard navigateTo={navigateTo} />
      </Suspense>
    );
  }


  return (
    <div className="app-root">

      <GoogleOneTap />
      {/* Header Navigation */}
      <Header
        currentSection={currentSection}
        onNavigate={handleNavigate}
        onSearch={handleHeaderSearch}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <HeroSection onSearch={handleSearch} />

      {hasSearched && (
        <>
          {/* Packages Section */}
          <main className="packages-section" id="packages">
            <motion.div
              className="packages-container"
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              variants={sectionVariants(reducedMotion)}
            >

              <LazyViewportSection height="350px">
                <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '350px' }} />}>
                  <OfferSection
                    onCtaClick={handleOpenGetQuote}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    maxPrice={filters.maxPrice}
                    setMaxPrice={(price) => setFilters(prev => ({ ...prev, maxPrice: price }))}
                  />
                </Suspense>
              </LazyViewportSection>

              {/* Section Heading & Category Tabs */}
              <div className="packages-header-block">
                <h2 className="section-title desktop-section-title">Showing Tours packages & itinerary</h2>

                <div className="mobile-section-heading">
                  <h2 className="mobile-section-title">Explore Tours &amp; Itineraries</h2>
                  <p className="mobile-section-subtitle">Find the perfect experience for your next journey</p>
                </div>

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
                      <span className="category-tab-icon" aria-hidden="true">
                        {categoryIcons[cat]}
                      </span>
                      <span className="category-tab-label">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="packages-content-layout">

                {/* Sidebar Filters */}
                <SidebarFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAll}
                  filteredCount={filteredPackages.length}
                  onGetQuote={handleOpenGetQuote}
                />

                {/* Tour Cards Grid */}
                <div className="tour-cards-feed">
                  {packagesLoading ? (
                    <div className="no-packages-found glass">
                      <p>Loading packages...</p>
                    </div>
                  ) : packagesError ? (
                    <div className="no-packages-found glass">
                      <p>Error: {packagesError}</p>
                    </div>
                  ) : paginatedPackages.length > 0 ? (
                    <>
                      {paginatedPackages.map((pkg, idx) => {
                        return (
                          <React.Fragment key={pkg.id}>
                            <TourCard
                              pkg={pkg}
                              isNew={idx < 3}
                              isActive={pkg.id === activePackageId}
                              onSelect={handleSelectPackage}
                              onGetQuote={handleOpenGetQuote}
                            />
                            {/* PromoBanner between each row */}
                            {(idx === 2 || idx === 5) && (
                              <div className="promo-banner-wrapper" style={{ gridColumn: '1 / -1' }}>
                                <Suspense fallback={null}>
                                  {idx === 2 ? (
                                    <PromoBanner onAction={handleOpenGetQuote} />
                                  ) : (
                                    <PromoSlideshowBanner onAction={handleOpenGetQuote} />
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
                                background: currentPage === i + 1 ? '#F04A23' : '#f1f5f9',
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
                      <p>No holiday packages match your selected filters. (Total packages: {packages.length})</p>
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
            <FAQSection activeDestination={hasSelectedPackage ? activePackage?.destination : searchQuery || "default"} />
          </Suspense>
        </LazyViewportSection>
      </div>

      {/* Redesigned Footer Section */}
      <LazyViewportSection height="300px" id="footer">
        <Suspense fallback={<div className="section-loader-placeholder" style={{ minHeight: '300px' }} />}>
          <Footer onNavigate={handleNavigate} handleOpenGetQuote={handleOpenGetQuote} />
        </Suspense>
      </LazyViewportSection>

      {/* Verification Modal */}
      {isVerifyModalOpen && (
        <Suspense fallback={null}>
          <VerifyModal
            isOpen={isVerifyModalOpen}
            onClose={handleCloseVerify}
          />
        </Suspense>
      )}

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

      {/* Mobile Bottom CTA Bar */}
      <MobileCTA isModalOpen={isModalOpen} />

      {/* Global Scroll to Top progress wheel */}
      <ScrollToTopButton isHidden={isAdmin && editMode} />

      {/* Floating Admin Control Panel */}
      <Suspense fallback={null}>
        <AdminToolbar />
      </Suspense>
    </div>
  );
}
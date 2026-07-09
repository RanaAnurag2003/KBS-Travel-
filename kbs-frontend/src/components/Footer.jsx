// Redesigned premium footer section for KBS Travels
import React, { useState, useEffect, useRef, memo } from "react";
import { usePrefersReducedMotion } from "../utils/motionVariants";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, ArrowUp,
  Globe, Award, Star, Plane, ChevronRight
} from "lucide-react";
import { subscribeNewsletter } from "../api";
import "./Footer.css";
import darkWorldMap from "../assets/dark_world_map.webp";

// Custom Counter Component for counting up when visible
function Counter({ value, suffix = "" }) {
  const [count, setCount] = useState(() => {
    const numericValue = parseFloat(value.toString().replace(/,/g, ""));
    return isNaN(numericValue) ? value : 0;
  });
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseFloat(value.toString().replace(/,/g, ""));
    if (isNaN(numericValue)) {
      return;
    }

    let start = 0;
    const end = numericValue;
    const isDecimal = value.toString().includes(".");
    const totalFrames = 60; // 60 frames (1 second at 60fps)
    let frame = 0;

    const counterInterval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = progress * (2 - progress); // easeOutQuad
      const currentCount = start + easedProgress * (end - start);

      if (isDecimal) {
        setCount(parseFloat(currentCount.toFixed(1)));
      } else {
        setCount(Math.floor(currentCount));
      }

      if (frame >= totalFrames) {
        clearInterval(counterInterval);
        setCount(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counterInterval);
  }, [isInView, value]);

  const formatNumber = (num) => {
    if (typeof num !== "number") return num;
    if (value.toString().includes(".")) return num.toFixed(1);
    return num.toLocaleString();
  };

  return (
    <span ref={elementRef} className="font-extrabold text-white text-2xl sm:text-3xl tracking-tight">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

// Performance-optimized newsletter sub-component to isolate keystroke re-renders
const NewsletterForm = memo(function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [ripples, setRipples] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      style: {
        width: size,
        height: size,
        left: x,
        top: y
      }
    };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <form onSubmit={handleSubscribe} className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="newsletter-email-input"
          aria-label="Email Address"
        />
        <button
          type="submit"
          onClick={handleRipple}
          className="btn-premium-subscribe"
          disabled={status === "loading"}
        >
          <span>{status === "loading" ? "Subscribing..." : "Subscribe Now"}</span>
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="ripple-element"
              style={ripple.style}
            />
          ))}
        </button>
      </form>
      {status === "success" && (
        <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "6px" }}>Thanks for subscribing!</p>
      )}
      {status === "error" && (
        <p style={{ color: "#f87171", fontSize: "13px", marginTop: "6px" }}>Something went wrong. Please try again.</p>
      )}
    </>
  );
});




const Footer = memo(function Footer({ onNavigate, handleOpenGetQuote }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 }
    }
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" }
    }
  };

  return (
    <footer id="contact" className="footer-premium-wrapper relative bg-[#030712] text-slate-400">
      <div className="footer-glow-orb footer-glow-orb-1" />
      <div className="footer-glow-orb footer-glow-orb-2" />

      <div
        className="footer-map-overlay"
        style={{
          backgroundImage: `url(${darkWorldMap})`,
          opacity: 0.15
        }}
      />

      <div className="footer-container">

        {/* 4-Column Balanced Grid */}
        <motion.div
          className="footer-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Column 1: Brand details */}
          <motion.div className="footer-brand-column" variants={itemVariants}>
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate("home")}>
              <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 rounded-xl shadow-lg">
                <Plane className="w-5 h-5 text-white footer-logo-plane" />
              </div>
              <div className="footer-title-column flex flex-col">
                <span className="font-extrabold text-white text-lg tracking-wider uppercase group-hover:text-cyan-400 transition-colors">
                  KBS Travels
                </span>
                <span className="text-[9px] text-cyan-400 font-semibold uppercase tracking-widest leading-none">
                  Explore The World
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-normal pr-2">
              We curate luxurious and premium travel itineraries around the world. Elevate your vacation into an unforgettable journey.
            </p>
            {/* Compact CTA Buttons: WhatsApp and Phone Call */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href="https://wa.me/917042111141"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-button whatsapp-btn"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mr-1.5 inline-block align-middle">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+917042111141"
                className="footer-contact-button phone-btn"
              >
                <Phone className="w-4 h-4 mr-1.5 inline-block align-middle" />
                <span>Call Us</span>
              </a>
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div className="flex flex-col" variants={itemVariants}>
            <h3 className="footer-column-title">Quick Links</h3>
            <ul className="quick-links-list">
              {[
                { label: "Home", id: "home" },
                { label: "Overview", id: "overview" },
                { label: "Packages", id: "packages" },
                { label: "Inclusion", id: "inclusion" },
                { label: "FAQ", id: "faq" },
                { label: "Contact", id: "contact" }
              ].map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (link.id === "contact") {
                        handleOpenGetQuote();
                      } else {
                        onNavigate(link.id);
                      }
                    }}
                    className="footer-link-anchor"
                  >
                    <ChevronRight className="w-3 h-3 mr-1 footer-link-bullet" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Contact Info */}
          <motion.div className="flex flex-col" variants={itemVariants}>
            <h3 className="footer-column-title">Contact Info</h3>
            <ul className="contact-list">
              <li className="contact-list-item">
                <Phone className="w-4.5 h-4.5 contact-icon-bg" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Phone</span>
                  <a href="tel:+917042111141" className="contact-text-link">+91-7042111141</a>
                </div>
              </li>
              <li className="contact-list-item">
                <Mail className="w-4.5 h-4.5 contact-icon-bg" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Email</span>
                  <a href="mailto:admin@kbstravels.in" className="contact-text-link">admin@kbstravels.in</a>
                </div>
              </li>
              <li className="contact-list-item">
                <MapPin className="w-4.5 h-4.5 contact-icon-bg" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Address</span>
                  <span className="text-slate-300">MP Mall, Office 107A, Block UP, Pitampura, New Delhi</span>
                </div>
              </li>
              <li className="contact-list-item">
                <Clock className="w-4.5 h-4.5 contact-icon-bg" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Hours</span>
                  <span className="text-slate-300">Mon - Sat: 9:00 AM - 7:00 PM</span>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Column 4: Newsletter */}
          <motion.div className="newsletter-column" variants={itemVariants}>
            <h3 className="footer-column-title">Newsletter</h3>
            <p className="text-sm leading-relaxed text-slate-400 font-normal">
              Subscribe to get customized seasonal tour packages and premium travel alerts.
            </p>
            <NewsletterForm />
            <span className="text-xs text-slate-500 italic">
              * We reply within 24 hours. No spam.
            </span>
          </motion.div>
        </motion.div>

        {/* Divider line separating columns from stats/copyright ribbon */}
        <div className="animated-gradient-divider" />

        {/* Merged Stats, Copyright, and Designer Row */}
        <div className="footer-bottom-merged-row">
          {/* Left: Copyright */}
          <div className="copyright-text">
            © 2026 <span className="text-white text-#F04A23 font-black">KBS Travels</span>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;

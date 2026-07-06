// Redesigned premium footer section for KBS Travels
import React, { useState, useEffect, useRef, memo } from "react";
import { usePrefersReducedMotion } from "../utils/motionVariants";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, ArrowUp,
  Globe, Award, Star, Plane, ChevronRight
} from "lucide-react";
import "./Footer.css";

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    alert(`Thank you for subscribing with: ${email}!`);
    setEmail("");
  };

  return (
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
      >
        <span>Subscribe Now</span>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple-element"
            style={ripple.style}
          />
        ))}
      </button>
    </form>
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%2306b6d4' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM10 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zM50 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/svg%3E")`
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
            © 2026 <span className="text-white glow-text-pulse font-black">KBS Travels</span>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;

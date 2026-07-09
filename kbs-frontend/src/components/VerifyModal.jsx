import { useEffect, useState, useRef } from "react";
import "./VerifyModal.css";
import recaptchaIcon from "../assets/ReCAPTCHA_icon.webp";

export default function VerifyModal({ isOpen, onClose }) {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const modalRef = useRef(null);

  // Sync mobile number to localStorage so AuthContext can access it upon Google login
  useEffect(() => {
    localStorage.setItem("kbs_pending_mobile", mobileNumber);
  }, [mobileNumber]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.setProperty("--scroll-y", `-${scrollY}px`);
      document.body.classList.add("modal-open");

      const preventDefault = (e) => e.preventDefault();
      const preventDefaultForScrollKeys = (e) => {
        const keys = { 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1 };
        if (keys[e.keyCode]) {
          e.preventDefault();
          return false;
        }
      };

      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });
      window.addEventListener("keydown", preventDefaultForScrollKeys, { passive: false });

      if (window.lenis && typeof window.lenis.stop === "function") {
        window.lenis.stop();
      }

      return () => {
        document.body.classList.remove("modal-open");
        window.scrollTo(0, scrollY);

        window.removeEventListener("wheel", preventDefault);
        window.removeEventListener("touchmove", preventDefault);
        window.removeEventListener("keydown", preventDefaultForScrollKeys);

        if (window.lenis && typeof window.lenis.start === "function") {
          window.lenis.start();
        }
      };
    }
  }, [isOpen]);



  // Trap Keyboard Focus for Accessibility
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const firstFocusableElement = modal.querySelector(focusableElements);
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    const prevActiveElement = document.activeElement;
    if (firstFocusableElement) {
      // Small timeout to allow render completion
      setTimeout(() => firstFocusableElement.focus(), 50);
    }

    const handleKeyDown = (e) => {
      const isTabPressed = e.key === "Tab" || e.keyCode === 9;
      if (!isTabPressed) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (prevActiveElement) {
        prevActiveElement.focus();
      }
    };
  }, [isOpen, isChecked]);

  // Render Google Sign-In Button inside the modal
  useEffect(() => {
    let interval;
    if (isOpen && isChecked) {
      const tryRender = () => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.renderButton(
              document.getElementById("google-signin-btn-modal"),
              {
                theme: "filled_blue",
                size: "large",
                width: 276,
                text: "continue_with",
                shape: "pill"
              }
            );
            clearInterval(interval);
          } catch (err) {
            console.error("Failed to render Google button inside modal:", err);
          }
        }
      };

      tryRender();
      interval = setInterval(tryRender, 500);
    }
    return () => clearInterval(interval);
  }, [isOpen, isChecked]);

  // Handle Click on Custom reCAPTCHA Checkbox
  const handleCheckboxClick = () => {
    if (isChecked || isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsChecked(true);
    }, 1200); // 1.2s spinner simulation
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-container verify-modal-overlay"
    >
      <div
        ref={modalRef}
        className="modal-content-v2 verify-modal-content fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="verify-content-wrapper">
          <h2 id="modal-title" className="modal-title-v2" style={{ fontSize: "15px", marginBottom: "4px", fontWeight: "600", color: "#334155" }}>
            Please verify you're human.
          </h2>

          {/* reCAPTCHA UI Box */}
          <div className="recaptcha-container">
            <div className="recaptcha-left">
              <button
                className={`recaptcha-checkbox ${isChecked ? 'checked' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={handleCheckboxClick}
                aria-label="I'm not a robot"
                aria-checked={isChecked}
              >
                {isChecked && (
                  <svg className="recaptcha-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isLoading && <div className="recaptcha-spinner"></div>}
              </button>
              <span className="recaptcha-label">I'm not a robot</span>
            </div>
            <div className="recaptcha-right">
              <div className="recaptcha-logo-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px" }}>
                <img src={recaptchaIcon} alt="reCAPTCHA" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
              </div>
              <span className="recaptcha-brand-text">reCAPTCHA</span>
              <div className="recaptcha-links">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
                <span> - </span>
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a>
              </div>
            </div>
          </div>

          {/* Continue with Google button (Renders smoothly via CSS max-height transition) */}
          <div className={`google-signin-wrapper-v3 ${isChecked ? 'visible' : ''}`} style={{ flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              style={{
                width: "276px",
                padding: "12px 16px",
                borderRadius: "24px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                textAlign: "center"
              }}
            />
            <div id="google-signin-btn-modal"></div>
          </div>

          {/* Header Shield */}
          <div className="verify-header-section">
            <div className="verify-badge-secured">
              <div className="verify-shield-graphic-v3">
                <div className="verify-ring-outer"></div>
                <div className="verify-ring-inner"></div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "36px", height: "36px", color: "#4285f4", zIndex: 3 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              Google Identity Secured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { submitEnquiry } from "../api";

export default function FormModal({ isOpen, onClose, modalData }) {
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState(user?.name || modalData?.name || "");
  const [email, setEmail] = useState(user?.email || modalData?.email || "");
  const [phone, setPhone] = useState(modalData?.phone || "");
  const [selectedTag, setSelectedTag] = useState("SOLO");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Sync details when modal opens or user auth status changes
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || modalData?.name || "");
      setEmail(user?.email || modalData?.email || "");
      setPhone(modalData?.phone || "");
    }
  }, [isOpen, user, modalData]);

  // Lock background scroll on mobile when open
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    if (isOpen && isMobile) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      alert("Please fill in your Name, Email, and Mobile Number.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      await submitEnquiry({
        name,
        phone,
        email,
        type: modalData?.type || "enquiry",
        message: modalData?.packageTitle || null,
        source: modalData?.type === "book" ? "book_online" : "form_modal",
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  return (
    <div className="modal-overlay glass-heavy fade-in">
      <div className="modal-content-v2 fade-in-up">
        {/* Close Button at top-right of the entire modal */}
        <button className="modal-close-btn-v2" onClick={handleClose} aria-label="Close modal">
          <svg className="modal-close-icon-v2" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        
        {/* Left Side: Visuals */}
        <div className="modal-left-col">
          <div className="modal-left-content contentFloat">
            <h2 className="modal-left-title smoothTypewriter">Don't Miss Out! Holidays</h2>
            
            <div className="modal-tags">
              {["SOLO", "COUPLE", "FAMILY"].map((tag, idx) => (
                <button 
                  key={tag}
                  type="button"
                  className={`modal-tag-btn smoothScaleUp cursor-pointer ${selectedTag === tag ? 'active' : ''}`}
                  style={{animationDelay: `${0.1 * (idx + 1)}s`}}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="modal-left-bottom">
              <p className="modal-left-subtitle contentFloat">Have Questions? We're Here to Help</p>
              <div className="modal-contact-actions">
                <a href="tel:+917042111141" className="modal-action-btn smoothScaleUp" style={{animationDelay: '0.4s'}}>
                  <svg className="modal-action-icon text-blue" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  +91-7042111141
                </a>
              <a href="https://wa.me/917042111141" target="_blank" rel="noopener noreferrer" className="modal-action-btn smoothScaleUp" style={{animationDelay: '0.5s'}}>
                <svg className="modal-action-icon text-green" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Live Chat
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-right-col">
          
          {!submitted ? (
            <div className="modal-form-container">
              <h2 className="modal-title-v2">
                {modalData?.type === "book" ? "Book Online Now" : "Get an Instant Call Back"}
              </h2>
              
              <form onSubmit={handleSubmit} className="modal-form-v2">
                <div className="form-group-v2 mobile-input-group">
                  <select className="mobile-prefix-select" defaultValue="+91">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    required
                    className="modal-input-v2"
                    placeholder="Mobile*"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group-v2">
                  <input
                    type="text"
                    required
                    className="modal-input-v2"
                    placeholder="Name*"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group-v2">
                  <input
                    type="email"
                    required
                    className="modal-input-v2"
                    placeholder="Email*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <label className="privacy-checkbox-label">
                  <input
                    type="checkbox"
                    required
                    className="privacy-checkbox"
                  />
                  <span>I accept the <span className="text-red">Privacy Policy</span></span>
                </label>

                {submitError && (
                  <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "-8px" }}>{submitError}</p>
                )}
                <button type="submit" className="modal-submit-btn-red cursor-pointer" disabled={submitting}>
                  {submitting ? "SUBMITTING..." : "SUBMIT"}
                </button>
              </form>
            </div>
          ) : (
            <div className="success-container fade-in">
              <div className="success-icon-bg">
                <svg className="success-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="success-title">Successful!</h2>
              <p className="success-submessage" style={{color: '#333'}}>
                Thank you, <strong>{name}</strong>! We will contact you at <strong>{email}</strong> or <strong>{phone}</strong> shortly.
              </p>
              <button onClick={handleClose} className="success-btn cursor-pointer">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useRef } from "react";
import LazyImage from "./LazyImage";

export default function TourCard({ pkg, onSelect, onGetQuote, isActive, isNew }) {
  const cardRef = useRef(null);

  const handleCardClick = (e) => {
    // Prevent selection if clicking within the footer area
    if (e.target.closest(".tcv-footer")) {
      return;
    }
    onSelect(pkg.id);
  };

  const isHoneymoon = pkg.categories && pkg.categories.includes("Honeymoon");

  const bullets = pkg.tags && pkg.tags.length > 0
    ? pkg.tags
    : ["5 Star Hotel", "Selected Meals", "2 Activities", "Airport Pickup & Drop"];
  const highlights = pkg.highlights && pkg.highlights.length > 0
    ? pkg.highlights.slice(0, 2)
    : ["Sunset Cruise, Snorkeling & Aromatherapy Massage", "Snorkeling Equipment"];

  return (
    <div
      ref={cardRef}
      className={`tcv-card fade-in-up ${isActive ? "card-active" : ""}`}
      onClick={handleCardClick}
    >
      <div className="tcv-img-wrapper">
        <LazyImage src={pkg.image} alt={pkg.title} />
        {isNew && <span className="tcv-badge tcv-badge-best">New</span>}
      </div>

      <div className="tcv-body">
        <div className="tcv-head">
          <h3 className="tcv-title">{pkg.title}</h3>
          <span className="tcv-duration">{pkg.duration}</span>
        </div>

        <ul className="tcv-grey-bullets">
          {bullets.map((b, i) => (
            <li key={i}>
              <span className="tcv-dot">•</span> {b}
            </li>
          ))}
        </ul>

        <ul className="tcv-green-bullets">
          {highlights.map((h, i) => (
            <li key={i}>
              <svg className="tcv-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="tcv-footer">
        <button className="tcv-pill-btn" onClick={(e) => {
          e.stopPropagation();
          onGetQuote(pkg);
        }}>
          <span className="tcv-cta-heading">GET QUOTE</span>
          {/* <span className="tcv-cta-subtext">Book this package @ ₹2,000</span> */}
        </button>
        <div className="tcv-footer-content">
          <div className="tcv-footer-left">
            {isHoneymoon ? (
              <>This price is lower than the<br />average price in July</>
            ) : (
              <>No Cost EMI at<br />₹58,943/month</>
            )}
          </div>
          <div className="tcv-footer-right">
            <div className="tcv-price-large">₹{pkg.price.toLocaleString()} <span>/Person</span></div>
            <div className="tcv-price-total">Total Price ₹{(pkg.price * 2).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

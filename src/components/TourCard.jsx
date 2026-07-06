import { useRef, useState, memo } from "react";
import LazyImage from "./LazyImage";

const TourCard = memo(function TourCard({ pkg, onSelect, onGetQuote, isActive, isNew }) {
  const cardRef = useRef(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
        <button
          type="button"
          className="tcv-wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted((prev) => !prev);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <svg
            className="tcv-wishlist-icon"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#dc2626" : "none"}
            stroke={isWishlisted ? "#dc2626" : "currentColor"}
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.727c-.4 0-.8-.15-1.1-.44L3.9 13.24c-2.1-2.1-2.1-5.5 0-7.6 2-2.02 5.28-2.06 7.33-.1l.77.73.77-.73c2.05-1.96 5.33-1.92 7.33.1 2.1 2.1 2.1 5.5 0 7.6l-7 7.05c-.3.29-.7.44-1.1.44z" />
          </svg>
        </button>
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
});

export default TourCard;
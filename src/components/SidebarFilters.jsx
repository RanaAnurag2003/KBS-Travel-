import { useState } from "react";
import SidebarOfferCard from "./SidebarOfferCard";

export default function SidebarFilters({
  filters,
  onFilterChange,
  onClearAll,
  filteredCount
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tourTypes = [
    "Solo Tour",
    "Group Tour",
    "Couple Friendly",
    "Family Tour",
    "Corporate Tour",
    "Honeymoon Tour"
  ];

  const safetyAssurancesList = [
    "100% Secure Payments",
    "Verified Hotels & Partners",
    "24/7 Travel Support",
    "COVID-Safe Travel Measures",
    "No Hidden Charges",
    "Travel Insurance Assistance",
    "Emergency Assistance Guaranteed"
  ];

  const toggleTourType = (type) => {
    const updated = filters.tourTypes.includes(type)
      ? filters.tourTypes.filter((t) => t !== type)
      : [...filters.tourTypes, type];
    onFilterChange({ ...filters, tourTypes: updated });
  };

  const toggleStarRating = (star) => {
    const updated = filters.stars.includes(star)
      ? filters.stars.filter((s) => s !== star)
      : [...filters.stars, star];
    onFilterChange({ ...filters, stars: updated });
  };

  const toggleSafetyAssurance = (assurance) => {
    const updated = filters.safety.includes(assurance)
      ? filters.safety.filter((a) => a !== assurance)
      : [...filters.safety, assurance];
    onFilterChange({ ...filters, safety: updated });
  };

  const handlePriceChange = (e) => {
    onFilterChange({ ...filters, maxPrice: parseInt(e.target.value) });
  };

  return (
    <aside className={`sidebar-container ${isExpanded ? "mobile-expanded" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header" onClick={() => {
        if (window.innerWidth <= 1024) {
          setIsExpanded(!isExpanded);
        }
      }}>
        <div className="sidebar-header-title-block">
          <h3 className="sidebar-title">
            <span className="sidebar-filter-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
              </svg>
            </span>
            <span className="sidebar-title-text">Trip Plan Filters</span>
            <span className="mobile-toggle-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </h3>
          <span className="itinerary-count">Showing {filteredCount} Itineraries</span>
        </div>
        <div className="sidebar-header-actions" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClearAll} className="clear-all-link cursor-pointer">
            Clear All
          </button>
        </div>
      </div>

      <div className="sidebar-content-wrapper">

        {/* Tour Type Section */}
        <div className="filter-section">
          <h4 className="filter-section-title">Tour Type</h4>
          <div className="tour-type-grid">
            {tourTypes.map((type) => {
              const isActive = filters.tourTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleTourType(type)}
                  className={`tour-type-pill ${isActive ? "tour-type-pill-active" : ""} cursor-pointer`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Promotional Offers replacing Popular Filters */}
        <div className="filter-section">
          <SidebarOfferCard
            offers={[
              {
                badge: "NEW",
                badgeColor: "#8b5cf6",
                title: "Family Holiday",
                subtitle: "Kids Stay Free",
                desc: "Perfect packages for the whole family",
                buttonText: "Explore",
                bgImage: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600&auto=format&fit=crop"
              },
              {
                badge: "SPECIAL",
                badgeColor: "#8b5cf6",
                title: "Romantic Getaway",
                subtitle: "Couples Discount",
                desc: "Unforgettable moments together",
                buttonText: "Book Now",
                bgImage: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=600&auto=format&fit=crop"
              }
            ]}
          />
          <SidebarOfferCard
            offers={[
              {
                badge: "LIMITED TIME",
                badgeColor: "#f59e0b",
                title: "Adventure Package",
                subtitle: "Buy 3 Get 1 Free",
                desc: "Thrills for the bold explorer",
                buttonText: "Start Adventure",
                bgImage: "https://images.unsplash.com/photo-1533654793924-4fc4949deafb?q=80&w=600&auto=format&fit=crop"
              },
              {
                badge: "DEAL",
                badgeColor: "#f59e0b",
                title: "Heritage Tour",
                subtitle: "Flat 20% Off",
                desc: "Explore the ancient wonders",
                buttonText: "View Details",
                bgImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=600&auto=format&fit=crop"
              }
            ]}
          />
        </div>

        {/* Price Slider */}
        <div className="filter-section">
          <h4 className="filter-section-title">Tourist Budget (Up to)</h4>
          <div className="price-slider-container">
            <input
              type="range"
              min="4000"
              max="50000"
              step="1000"
              value={filters.maxPrice}
              onChange={handlePriceChange}
              className="price-slider"
            />
            <div className="price-values">
              <span>₹4,000</span>
              <span className="current-price">₹{filters.maxPrice.toLocaleString()}</span>
              <span>₹50,000</span>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="filter-section">
          <h4 className="filter-section-title">Trip Ratings</h4>
          <div className="ratings-list">
            {[5, 4, 3].map((rating) => (
              <label key={rating} className="checkbox-label cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.stars.includes(rating)}
                  onChange={() => toggleStarRating(rating)}
                  className="filter-checkbox"
                />
                <span className="rating-stars-container">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`star-svg ${i < rating ? "star-active" : "star-inactive"}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Trust & Safety */}
        <div className="filter-section">
          <h4 className="filter-section-title">Trust & Safety Assurances</h4>
          <div className="checkbox-group">
            {safetyAssurancesList.map((item) => (
              <label key={item} className="checkbox-label cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.safety.includes(item)}
                  onChange={() => toggleSafetyAssurance(item)}
                  className="filter-checkbox"
                />
                <span className="checkbox-text">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
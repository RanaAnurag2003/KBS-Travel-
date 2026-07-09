import { useState, useEffect, useCallback, memo } from "react";
import LazyImage from "./LazyImage";

const OfferCard = memo(function OfferCard({ title, subtitle, offers = [], ariaLabel }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || offers.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, offers.length]);

  const goToSlide = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  if (!offers.length) return null;

  const activeOffer = offers[activeIndex];

  return (
    <article
      className="offer-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      onClick={() => activeOffer?.onCta?.()}
      role="region"
      aria-label={ariaLabel || title || "Special offer"}
      aria-roledescription="carousel"
    >
      {(title || subtitle) && (
        <div className="offer-card-meta sr-only">
          {title && <h3>{title}</h3>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}

      <div className="offer-card-carousel">
        {offers.map((offer, index) => (
          <div
            key={`${offer.title}-${index}`}
            className={`offer-slide ${index === activeIndex ? "offer-slide-active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            <div className="offer-slide-bg">
              <LazyImage
                src={offer.image}
                alt={offer.title || "Offer Banner"}
                className="offer-slide-img"
                objectFit="object-cover"
              />
            </div>
            <div className="offer-slide-overlay" />
            <div className="offer-slide-glass">
              {offer.badge && (
                <span className={`offer-badge offer-badge-${offer.badgeType || "default"}`}>
                  {offer.badge}
                </span>
              )}
              <h4 className="offer-slide-title">{offer.title}</h4>
              {offer.subtitle && (
                <p className="offer-slide-subtitle">{offer.subtitle}</p>
              )}
              {offer.description && (
                <p className="offer-slide-desc">{offer.description}</p>
              )}
              <button
                type="button"
                className="offer-cta-btn"
                onClick={offer.onCta}
                tabIndex={index === activeIndex ? 0 : -1}
                aria-label={`${offer.ctaLabel || "Book Now"} — ${offer.title}`}
              >
                {offer.ctaLabel || "Book Now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {offers.length > 1 && (
        <div className="offer-dots" role="tablist" aria-label={`${activeOffer?.title || "Offer"} slides`}>
          {offers.map((offer, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Slide ${index + 1}: ${offer.title}`}
              className={`offer-dot ${index === activeIndex ? "offer-dot-active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </article>
  );
});

export default OfferCard;

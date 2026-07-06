export default function PromoBanner({ onAction }) {
  return (
    <div className="promo-banner-card fade-in-up">
      <div className="promo-banner-glow" />
      <div className="promo-banner-inner">
        <div className="promo-banner-left">
          <div className="promo-banner-icon-bg animate-pulse">
            <svg
              className="promo-gift-svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35-.54-.81-1.45-1.35-2.5-1.35-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H5c-1.1 0-2 .9-2 2v3c0 .55.45 1 1 1h1v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V13h1c.55 0 1-.45 1-1V8c0-1.1-.9-2-2-2zM15 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-6 1c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zM5 8h7v3H5V8zm1 5h6v7H6v-7zm12 7h-4v-7h6v7zm1-9h-7V8h7v3z" />
            </svg>
          </div>
          <div className="promo-banner-text-container">
            <p className="promo-banner-title">
              Exclusive Goa, Maldives, Srinagar, Dubai, Singapore, Sri Lanka, Sikkim, Malaysia, Vietnam, Kerala, Bali, Manali, Europe, Thailand Tour Package – Holiday, Trip & Travel Deals from KBS Travels
            </p>
            <p className="promo-banner-subtitle">
              Affordable Flight-Inclusive Bali Packages Designed for Couples Honeymoon & Families - Last minute deals save up to +₹1,900
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="promo-banner-btn cursor-pointer"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
import SearchBar from "./SearchBar";

export default function HeroSection({ onSearch }) {

  return (
    <section className="hero-section-v2" id="home">
      <div className="hero-overlay-v2" />

      <div className="hero-content-v2">
        <div className="hero-right-v2">
          {/* Map Illustration Placeholder */}
          <div className="map-illustration-v2">
            {/* SVG Map Path outlines */}
            <svg viewBox="0 0 800 400" className="map-svg" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              <path d="M200,100 Q400,0 600,100 T750,200" strokeDasharray="5,5" stroke="rgba(103,232,249,0.5)" />
              <path d="M600,100 Q650,200 600,280" strokeDasharray="5,5" stroke="rgba(103,232,249,0.5)" />

              <circle cx="200" cy="100" r="4" fill="#67E8F9" className="pulse-dot" />
              <text x="210" y="95" fill="#B8C3D1" fontSize="12">New Delhi</text>

              <circle cx="600" cy="100" r="4" fill="#67E8F9" className="pulse-dot" />
              <text x="610" y="95" fill="#B8C3D1" fontSize="12">Munt</text>

              <circle cx="600" cy="280" r="4" fill="#67E8F9" className="pulse-dot" />
              <text x="610" y="275" fill="#B8C3D1" fontSize="12">Goa</text>

              <circle cx="750" cy="200" r="4" fill="#67E8F9" className="pulse-dot" />
            </svg>
          </div>
        </div>

        <div className="hero-left-v2">
          <h1 className="hero-title-v2">
            Explore Premium with Custom Packages...
          </h1>

          <div className="hero-search-wrapper-v2">
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
      </div>
    </section>
  );
}

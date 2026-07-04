import { useState, useEffect } from 'react';
import '../FeaturedDestinationsCarousel.css';

const destinationsData = [
  {
    id: 1,
    title: "EXPLORE THE ALPS",
    country: "AUSTRIA",
    description: "Alpine Adventures, Austria. Immerse yourself in the breathtaking views of the snow-capped mountains and pristine valleys.",
    image: "/src/assets/hero.jpg",
    buttonText: "View Tour"
  },
  {
    id: 2,
    title: "COASTAL SERENITY",
    country: "ITALY",
    description: "Discover the beautiful coastal towns of Italy with perfect sunsets and local cuisine along the Amalfi Coast.",
    image: "/src/assets/boats.jpg",
    buttonText: "Discover"
  },
  {
    id: 3,
    title: "TROPICAL ESCAPE",
    country: "BALI",
    description: "Experience the lush green rice terraces and serene temples of Bali for the ultimate relaxation.",
    image: "/src/assets/forest.jpg",
    buttonText: "Discover"
  },
  {
    id: 4,
    title: "NORTHERN LIGHTS",
    country: "ICELAND",
    description: "Witness the spectacular aurora borealis across the dark skies of Iceland's dramatic volcanic landscape.",
    image: "/src/assets/sunset.jpg",
    buttonText: "Discover"
  },
  {
    id: 5,
    title: "AMAZON RAINFOREST",
    country: "BRAZIL",
    description: "Journey deep into the world's most diverse rainforest and river system in South America.",
    image: "/src/assets/church.jpg",
    buttonText: "Discover"
  },
  {
    id: 6,
    title: "DESERT SAFARI",
    country: "DUBAI",
    description: "Experience the thrill of dune bashing in the majestic Arabian desert and enjoy traditional camps.",
    image: "/src/assets/heron.jpg",
    buttonText: "Discover"
  }
];

export default function FeaturedDestinationsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll every 5 seconds, but pause if hovered
  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % destinationsData.length);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % destinationsData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + destinationsData.length) % destinationsData.length);
  };

  const getCardStyle = (index) => {
    const total = destinationsData.length;
    let offset = index - activeIndex;

    // Circular array calculation for endless loop feel
    if (offset > Math.floor(total / 2)) {
      offset -= total;
    } else if (offset < -Math.floor(total / 2)) {
      offset += total;
    }

    const absOffset = Math.abs(offset);
    const isMobile = windowWidth <= 768;
    const baseTranslate = isMobile ? 105 : 120; // Distance between cards

    const translateX = offset * baseTranslate;
    const scale = absOffset === 0 ? 1.15 : (1 - (absOffset * 0.15));
    const zIndex = 10 - absOffset;

    // Ensure all visible cards have full 100% opacity, only hide the ones completely off-screen
    const opacity = absOffset > 2 ? 0 : 1;

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      zIndex,
      opacity,
      pointerEvents: absOffset === 0 ? 'auto' : 'none'
    };
  };

  return (
    <section className="featured-destinations-section">

      <div 
        className="fd-carousel-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button className="fd-nav-btn fd-nav-prev" onClick={handlePrev} aria-label="Previous destination">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="fd-track">
          {destinationsData.map((dest, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={dest.id}
                className={`fd-card-wrapper ${isActive ? 'active' : ''}`}
                style={getCardStyle(index)}
                onClick={() => !isActive && setActiveIndex(index)}
              >
                <div className="fd-card">
                  <img src={dest.image} alt={dest.title} className="fd-image" loading="lazy" />
                  <div className="fd-overlay">
                    <div className="fd-content-inner">
                      <h3 className="fd-card-title">
                        <span className="fd-card-number">{dest.id}.</span> {dest.title} - {dest.country}
                      </h3>
                      <p className="fd-card-desc">{dest.description}</p>
                      <button className="fd-btn">
                        {dest.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="fd-nav-btn fd-nav-next" onClick={handleNext} aria-label="Next destination">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="fd-pagination">
        {destinationsData.map((_, index) => (
          <button
            key={index}
            className={`fd-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

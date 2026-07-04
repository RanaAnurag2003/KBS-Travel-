import { useState, useEffect } from 'react';
import './SidebarOfferCard.css';

export default function SidebarOfferCard({
  offers,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [offers.length, isHovered]);

  return (
    <div 
      className="sidebar-offer-card bg-image-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-scene">
        {offers.map((offer, index) => {
          const isActive = index === currentIndex;
          return (
            <div 
              key={index} 
              className={`card-slide ${isActive ? 'active' : 'inactive'}`}
              style={{
                backgroundImage: `url(${offer.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark overlay for text readability */}
              <div className="card-overlay"></div>
              
              <div className="offer-content-rich">
                <span className="badge" style={{ backgroundColor: offer.badgeColor }}>
                  {offer.badge}
                </span>
                <h3 className="offer-title-rich">{offer.title}</h3>
                <h4 className="offer-subtitle-rich">{offer.subtitle}</h4>
                <p className="offer-desc-rich">{offer.desc}</p>
                <button className="primary-btn-rich">{offer.buttonText}</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pagination-dots">
        {offers.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

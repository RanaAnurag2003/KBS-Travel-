import { useState, useEffect } from 'react';
import './SidebarOfferCard.css';

export default function SidebarOfferCard({
  offers,
  onCta,
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
      onClick={onCta}
      style={{ cursor: 'pointer' }}
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

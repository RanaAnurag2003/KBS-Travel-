import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sectionVariants, childVariants, viewportSettings, usePrefersReducedMotion } from "../utils/motionVariants";
import { fetchOffers } from "../api";
import OfferCard from "./OfferCard";
import "../OfferSection.css";

export default function OfferSection({ onCtaClick, searchQuery }) {
  const reducedMotion = usePrefersReducedMotion();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers()
      .then((data) => setOffers(data))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || offers.length === 0) return null;

  // Filter based on searchQuery (destination)
  const filteredOffers = offers.filter((offer) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (offer.title && offer.title.toLowerCase().includes(q)) ||
      (offer.subtitle && offer.subtitle.toLowerCase().includes(q)) ||
      (offer.description && offer.description.toLowerCase().includes(q))
    );
  });

  // Show filtered offers, or fallback to default offers if none match
  const displayOffers = filteredOffers.length > 0 ? filteredOffers.slice(0, 3) : offers.slice(0, 3);

  return (
    <motion.section
      className="offer-section"
      aria-label="Promotional offers"
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      variants={sectionVariants(reducedMotion)}
    >
      {displayOffers.map((offer, index) => {
        const slide = {
          title: offer.title,
          subtitle: offer.subtitle,
          description: offer.description,
          badge: offer.badge,
          badgeType: offer.badgeType || "default",
          image: offer.image,
          ctaLabel: offer.ctaLabel,
          onCta: () => onCtaClick?.(offer),
        };

        return (
          <motion.div key={index} variants={childVariants(reducedMotion)}>
            <OfferCard
              offers={[slide]}
              ariaLabel={offer.title || "Promotional offer"}
            />
          </motion.div>
        );
      })}
    </motion.section>
  );
}
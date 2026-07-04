import OfferCard from "./OfferCard";
import "../OfferSection.css";

const offerCardOneSlides = [
  {
    title: "Summer Sale",
    subtitle: "Up to 40% OFF",
    description: "Explore Beaches",
    badge: "40% OFF",
    badgeType: "discount",
    image: "/src/assets/heron.jpg",
    ctaLabel: "Book Now",
  },
  {
    title: "Honeymoon Special",
    subtitle: "Free Candle Light Dinner",
    description: "Romantic getaways for couples",
    badge: "Limited Time",
    badgeType: "limited",
    image: "/src/assets/sunset.jpg",
    ctaLabel: "View Deals",
  },
  {
    title: "Family Holiday",
    subtitle: "Kids Stay Free",
    description: "Perfect packages for the whole family",
    badge: "NEW",
    badgeType: "new",
    image: "/src/assets/boats.jpg",
    ctaLabel: "Explore",
  },
];

const offerCardTwoSlides = [
  {
    title: "Weekend Escape",
    subtitle: "Flat ₹3,000 OFF",
    description: "Quick breaks, big savings",
    badge: "₹3,000 OFF",
    badgeType: "discount",
    image: "/src/assets/forest.jpg",
    ctaLabel: "Grab Offer",
  },
  {
    title: "Early Bird Offer",
    subtitle: "Save 25%",
    description: "Book early and travel smarter",
    badge: "25% OFF",
    badgeType: "discount",
    image: "/src/assets/hero.jpg",
    ctaLabel: "Book Early",
  },
  {
    title: "Adventure Package",
    subtitle: "Buy 3 Get 1 Free",
    description: "Thrills for the bold explorer",
    badge: "Limited Time",
    badgeType: "limited",
    image: "/src/assets/church.jpg",
    ctaLabel: "Start Adventure",
  },
];

const offerCardThreeSlides = [
  {
    title: "Luxury Retreats",
    subtitle: "Premium Stays",
    description: "Indulge in 5-star experiences",
    badge: "LUXURY",
    badgeType: "default",
    image: "/src/assets/hero.jpg",
    ctaLabel: "Discover",
  },
  {
    title: "Group Tours",
    subtitle: "Travel Together",
    description: "Special discounts for groups of 4+",
    badge: "15% OFF",
    badgeType: "discount",
    image: "/src/assets/heron.jpg",
    ctaLabel: "Group Deals",
  },
  {
    title: "Mountain Treks",
    subtitle: "Reach the Peak",
    description: "Guided trekking experiences",
    badge: "POPULAR",
    badgeType: "limited",
    image: "/src/assets/forest.jpg",
    ctaLabel: "View Treks",
  },
];

export default function OfferSection({ onCtaClick }) {
  const attachCta = (slides) =>
    slides.map((slide) => ({
      ...slide,
      onCta: () => onCtaClick?.(slide),
    }));

  return (
    <section className="offer-section" aria-label="Promotional offers">
      <OfferCard
        title="Seasonal Deals"
        subtitle="Handpicked travel offers"
        offers={attachCta(offerCardOneSlides)}
        ariaLabel="Seasonal and holiday offers carousel"
      />
      <OfferCard
        title="Quick Getaways"
        subtitle="Limited-time savings"
        offers={attachCta(offerCardTwoSlides)}
        ariaLabel="Weekend and adventure offers carousel"
      />
      <OfferCard
        title="Premium Experiences"
        subtitle="Luxury and group tours"
        offers={attachCta(offerCardThreeSlides)}
        ariaLabel="Luxury and group offers carousel"
      />
    </section>
  );
}

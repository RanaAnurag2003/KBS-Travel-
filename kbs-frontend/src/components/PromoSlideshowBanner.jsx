import React from "react";
import goaPromoBanner from "../assets/goa-promo-banner.webp";

export default function PromoSlideshowBanner({ onAction }) {
  return (
    <div
      className="promo-banner-card"
      style={{
        padding: 0,
        border: "none",
        background: "transparent",
        borderRadius: "20px",
        overflow: "hidden",
        cursor: "pointer",
        display: "block",
        width: "100%",
        minHeight: "0px",
      }}
      onClick={onAction}
    >
      <img
        src={goaPromoBanner}
        alt="Goa Heritage & Beach Bliss - Special Travel Offer"
        className="promo-slideshow-img"
      />
    </div>
  );
}
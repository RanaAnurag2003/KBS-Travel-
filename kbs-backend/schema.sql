-- KBS Travels database schema
-- Run this once against the kbs_travels database to create all tables.

-- ============================================================
-- 1. packages — the tour package catalog (replaces mockData.js)
-- ============================================================
CREATE TABLE packages (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    slug              VARCHAR(255) UNIQUE NOT NULL,
    title             TEXT NOT NULL,
    destination       VARCHAR(255) NOT NULL,
    price             INT NOT NULL,
    duration          TEXT NOT NULL,
    image             TEXT NOT NULL,
    rating            DECIMAL(2,1) NOT NULL DEFAULT 0,
    rating_label      TEXT,
    reviews           INT NOT NULL DEFAULT 0,
    stars             INT NOT NULL DEFAULT 0,
    bullets           JSON NOT NULL,
    tags              JSON NOT NULL,
    categories        JSON NOT NULL,
    tour_types        JSON NOT NULL,
    popular_filters   JSON NOT NULL,
    highlights        JSON NOT NULL,
    inclusions        JSON NOT NULL,
    exclusions        JSON NOT NULL,
    stay_transfers    TEXT,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_packages_destination ON packages (destination);
CREATE INDEX idx_packages_price       ON packages (price);
CREATE INDEX idx_packages_stars       ON packages (stars);

-- ============================================================
-- 2. enquiries — every "Get Quote" / "Book Online" / search submission
-- ============================================================
CREATE TABLE enquiries (
    id                     INT AUTO_INCREMENT PRIMARY KEY,
    type                   VARCHAR(50) NOT NULL,
    name                   TEXT NOT NULL,
    phone                  TEXT NOT NULL,
    package_id             INT,
    package_title_snapshot TEXT,
    source                 VARCHAR(255) NOT NULL DEFAULT 'unknown',
    message                TEXT,
    status                 VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
    CHECK (type IN ('enquiry', 'quote', 'book')),
    CHECK (status IN ('new', 'contacted', 'converted', 'lost'))
);

CREATE INDEX idx_enquiries_created_at ON enquiries (created_at DESC);
CREATE INDEX idx_enquiries_status     ON enquiries (status);

-- ============================================================
-- 3. subscribers — newsletter signups
-- ============================================================
CREATE TABLE subscribers (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 4. offers — dynamic promo/offer cards
-- ============================================================
CREATE TABLE offers (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    title         TEXT NOT NULL,
    subtitle      TEXT,
    description   TEXT,
    badge         TEXT,
    badge_color   TEXT,
    image         TEXT,
    cta_label     VARCHAR(255) NOT NULL DEFAULT 'Book Now',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_sort_order ON offers (sort_order);

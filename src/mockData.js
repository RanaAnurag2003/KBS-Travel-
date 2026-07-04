const basePackages = [
  {
    id: 1,
    title: "Goa Family Vacation Package with Water Fun",
    destination: "Goa",
    rating: 3.5,
    ratingLabel: "Good",
    reviews: 2534,
    duration: "5D/4N",
    price: 5400,
    image: "/src/assets/heron.jpg",
    bullets: [
      "Exotic Wildlife",
      "Adventure Activities",
      "Vibrant Markets",
      "Yoga Retreats"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Beach", "Group", "Honeymoon"],
    tourTypes: ["Group Tour", "Family Tour"],
    popularFilters: ["Sightseeing Tours", "Adventure Activities"],
    stars: 3,
    highlights: [
      "Fun-filled beach activities with family",
      "Exotic wildlife safari in Bhagwan Mahavir Sanctuary",
      "Exciting water sports like jet ski, banana ride and parasailing",
      "Authentic Goan cuisine tastings at local shacks",
      "Visit to the bubbling spice plantation with lunch"
    ],
    inclusions: [
      "Meal Plan (Breakfast & Dinner)",
      "Services (24/7 Guide Support)",
      "Inter-city Transfers",
      "Charges (Driver & Tolls)",
      "Lunch on the Coach",
      "Station/Airport Pick & Drop",
      "Sightseeing Tours"
    ],
    exclusions: [
      "Flights/Train Fare",
      "Personal Expenses (Shopping/Laundry)",
      "Water Sports Extra Charges",
      "Entry Tickets to monuments",
      "GST & TCS Charges"
    ],
    stayTransfers: "4 Nights stay in a premium 3-star family resort close to Calangute Beach, including private AC sedan airport transfers and daily sightseeing coach."
  },
  {
    id: 2,
    title: "Goa Budget Trip Package Under 10,000",
    destination: "Goa",
    rating: 4.5,
    ratingLabel: "Exceptional",
    reviews: 2751,
    duration: "3D/2N",
    price: 8800,
    image: "/src/assets/church.jpg",
    bullets: [
      "Historic Churches",
      "Exotic Wildlife",
      "Adventure Activities",
      "Vibrant Markets"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Beach", "Weekend"],
    tourTypes: ["Solo Tour", "Couple Friendly", "Honeymoon Tour"],
    popularFilters: ["Sightseeing Tours", "Historical Site Visits", "Shopping at Local Markets"],
    stars: 4,
    highlights: [
      "Explore historical Portuguese-era churches in Old Goa",
      "Sunset boat cruise on Mandovi River",
      "Flea market shopping at Anjuna & Baga beaches",
      "Budget friendly yet comfortable hotel stay",
      "Sightseeing of Fort Aguada and lighthouse"
    ],
    inclusions: [
      "Daily Breakfast",
      "Airport/Station Pick and Drop",
      "North Goa & South Goa Sightseeing",
      "Toll, Parking, Driver allowances",
      "Free Wi-Fi at hotel"
    ],
    exclusions: [
      "Lunch and Dinner",
      "Camera fees at monuments",
      "Insurance of any kind",
      "Water sports activities"
    ],
    stayTransfers: "2 Nights stay in a highly-rated budget hotel in Candolim. Shared AC vehicle for South and North Goa tours. Airport pick-drop in private Hatchback."
  },
  {
    id: 3,
    title: "Goa Adventure Tour with Watersports",
    destination: "Goa",
    rating: 4.5,
    ratingLabel: "Exceptional",
    reviews: 826,
    duration: "4D/3N",
    price: 6500,
    image: "/src/assets/boats.jpg",
    bullets: [
      "Portuguese Heritage",
      "Water Sports",
      "Seafood Cuisine",
      "Sunset Cruises"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Adventure", "Beach"],
    tourTypes: ["Solo Tour", "Group Tour", "Corporate Tour"],
    popularFilters: ["Adventure Activities", "Local Cuisine Tasting", "Sightseeing Tours"],
    stars: 5,
    highlights: [
      "Full day adventure at Grand Island with Scuba Diving",
      "Water sports package: Jet Ski, Parasailing, Banana Ride, Bumper Ride",
      "Dolphin spotting cruise",
      "Traditional fish curry lunch on the beach",
      "Explore old Portuguese houses in Fontainhas (Latin Quarter)"
    ],
    inclusions: [
      "Scuba Diving training & equipment",
      "Underwater Video",
      "Breakfast & Lunch on diving day",
      "Premium hotel stay with pool",
      "Private AC Cab for local commutes",
      "Sightseeing charges"
    ],
    exclusions: [
      "Dinner and optional snacks",
      "Tips and gratuities",
      "Flight tickets"
    ],
    stayTransfers: "3 Nights stay in an adventure-themed resort in Baga. Private SUV transfer for activities and airport pick-up/drop-off."
  },
  {
    id: 4,
    title: "Goa Honeymoon Package with Private Beach",
    destination: "Goa",
    rating: 3.9,
    ratingLabel: "Good",
    reviews: 2002,
    duration: "3D/2N",
    price: 4900,
    image: "/src/assets/forest.jpg",
    bullets: [
      "Sunset Cruises",
      "Historic Churches",
      "Exotic Wildlife",
      "Adventure Activities",
      "Vibrant Markets",
      "Yoga Retreats",
      "Scenic Hills",
      "Cultural Events"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Honeymoon", "Beach"],
    tourTypes: ["Couple Friendly", "Honeymoon Tour"],
    popularFilters: ["Sightseeing Tours", "Cultural Shows", "Local Cuisine Tasting"],
    stars: 4,
    highlights: [
      "Romantic candle-light dinner on a private beach stretch",
      "Couple spa session with wellness consultation",
      "Sunset cruise with champagne toast",
      "Visit to romantic viewpoints and quiet South Goa beaches",
      "Beautiful flower bed decoration and cake on arrival"
    ],
    inclusions: [
      "Welcome Drinks on arrival",
      "Daily Buffet Breakfast & Dinner",
      "One candle-light dinner",
      "Bed decoration & Honeymoon Cake",
      "Private Luxury Sedan for sightseeing",
      "Airport pickup and drop"
    ],
    exclusions: [
      "Lunch meals",
      "Personal shopping and water sports",
      "Any entry tickets to clubs/parks"
    ],
    stayTransfers: "2 Nights stay in a premium beachfront cottage in Varca. Private AC luxury sedan for all pick-ups, drops, and personalized couple tours."
  },
  {
    id: 5,
    title: "Maldives Luxury Overwater Bungalow Escape",
    destination: "Maldives",
    rating: 4.9,
    ratingLabel: "Exceptional",
    reviews: 1450,
    duration: "5D/4N",
    price: 45000,
    image: "/src/assets/hero.jpg",
    bullets: [
      "Overwater Villa",
      "All-Inclusive Dining",
      "Snorkeling Reefs",
      "Ocean Sunset views"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Honeymoon", "Beach"],
    tourTypes: ["Couple Friendly", "Honeymoon Tour"],
    popularFilters: ["Sightseeing Tours", "Adventure Activities"],
    stars: 5,
    highlights: [
      "Stay in a luxurious overwater villa with direct lagoon access",
      "All-inclusive food, spirits, and soft beverages across 4 restaurants",
      "Guided snorkeling tour with turtles and reef sharks",
      "Romantic sunset catamaran cruise",
      "Complimentary non-motorized water sports (kayaking, paddleboarding)"
    ],
    inclusions: [
      "4 Nights in Luxury Overwater Villa",
      "Full Board Meals (Breakfast, Lunch, Dinner)",
      "Unlimited beverages (selected premium brands)",
      "Round-trip Speedboat/Seaplane airport transfers",
      "Snorkeling gear hire"
    ],
    exclusions: [
      "International flights",
      "Spa treatments and diving certifications",
      "Green tax of $6 per person per night (if applicable)"
    ],
    stayTransfers: "4 Nights stay in a premium 5-star island resort. Airport transfers via speed boat or seaplane included in the package."
  },
  {
    id: 6,
    title: "Srinagar & Gulmarg Paradise Tour",
    destination: "Srinagar",
    rating: 4.7,
    ratingLabel: "Exceptional",
    reviews: 1890,
    duration: "6D/5N",
    price: 18900,
    image: "/src/assets/sunset.jpg",
    bullets: [
      "Dal Lake Houseboat",
      "Shikara Ride",
      "Gulmarg Gondola",
      "Mughal Gardens"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Weekend", "Group"],
    tourTypes: ["Family Tour", "Group Tour", "Couple Friendly"],
    popularFilters: ["Sightseeing Tours", "Historical Site Visits", "Cultural Shows"],
    stars: 4,
    highlights: [
      "1 Night stay in an authentic wooden Houseboat on Dal Lake",
      "2-hour Shikara ride visiting floating markets",
      "Gondola cable car ride in Gulmarg up to Phase 2 (snow level)",
      "Day excursion to the breathtaking Betaab Valley in Pahalgam",
      "Stroll through the historical Shalimar and Nishat Mughal Gardens"
    ],
    inclusions: [
      "Daily Breakfast & Dinner at hotel/houseboat",
      "AC Vehicle for all transfers & sightseeing",
      "1 Hour Shikara ride on Dal Lake",
      "Pahalgam local union taxi fare included",
      "Tolls & Driver Allowances"
    ],
    exclusions: [
      "Flights or Train tickets to Srinagar",
      "Gondola ride tickets (need to book in advance)",
      "Pony rides and personal activities",
      "Lunch meals"
    ],
    stayTransfers: "1 Night in Dal Lake Houseboat, 2 Nights in Srinagar Hotel, 2 Nights in Pahalgam Hotel. Dedicated AC sedan for the entire tour."
  },
  {
    id: 7,
    title: "Bali Couples Romantic Wellness Retreat",
    destination: "Bali",
    rating: 4.8,
    ratingLabel: "Exceptional",
    reviews: 1205,
    duration: "6D/5N",
    price: 24500,
    image: "/src/assets/forest.jpg",
    bullets: [
      "Ubud Jungle Villa",
      "Infinity Pool",
      "Balinese Massage",
      "Volcano Sunrise Trek"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Honeymoon", "Adventure"],
    tourTypes: ["Couple Friendly", "Honeymoon Tour"],
    popularFilters: ["Cultural Shows", "Adventure Activities", "Local Cuisine Tasting"],
    stars: 4,
    highlights: [
      "Private pool villa stay surrounded by Ubud's rainforest",
      "Sunrise hike up Mount Batur with breakfast at the summit",
      "Traditional 90-minute Balinese couple massage and spa treatment",
      "Visit to Sacred Monkey Forest and Tegallalang Rice Terraces",
      "Romantic dinner overlooking the Ayung River"
    ],
    inclusions: [
      "5 Nights in Ubud Jungle Resort with private pool",
      "Daily gourmet breakfast",
      "1 Romantic Ayung River dinner",
      "Guided Mount Batur Sunrise Trek",
      "Private AC vehicle with English-speaking driver-guide",
      "Airport pick-up & drop"
    ],
    exclusions: [
      "Flight tickets",
      "Visa on Arrival fee",
      "Tipping, personal shopping, and lunches"
    ],
    stayTransfers: "5 Nights stay in Ubud Luxury Pool Villa. Private tour guide with air-conditioned sedan throughout the stay."
  },
  {
    id: 8,
    title: "Rajasthan Heritage Group Expedition",
    destination: "Jaipur",
    rating: 4.4,
    ratingLabel: "Very Good",
    reviews: 955,
    duration: "7D/6N",
    price: 15400,
    image: "/src/assets/church.jpg",
    bullets: [
      "Royal Forts Tour",
      "Camel Desert Safari",
      "Traditional Folk Dance",
      "Heritage Palace Stay"
    ],
    tags: ["Stay", "Food", "Transfer", "Sightseeing"],
    categories: ["Group", "Weekend"],
    tourTypes: ["Group Tour", "Family Tour", "Corporate Tour"],
    popularFilters: ["Historical Site Visits", "Cultural Shows", "Sightseeing Tours"],
    stars: 4,
    highlights: [
      "Visit the magnificent Amber Fort, City Palace, and Hawa Mahal in Jaipur",
      "Overnight Swiss tent stay in Jaisalmer dunes with Camel Safari",
      "Folk dance and fire dance performances under the desert stars",
      "Explore the romantic lakeside city of Udaipur and take a boat ride",
      "Shop for local handicrafts, textiles, and blue pottery in Jaipur bazaars"
    ],
    inclusions: [
      "6 Nights stay (Heritage Hotels & Desert Camps)",
      "Daily breakfast & Jaisalmer dinner",
      "AC Tourist Coach for the entire group",
      "Local tour guides in Jaipur, Jodhpur, and Udaipur",
      "Traditional welcome ceremony at Jaisalmer"
    ],
    exclusions: [
      "Monument entrance fees",
      "Lunch meals and optional boating tickets",
      "Train/Air travel fares"
    ],
    stayTransfers: "2 Nights Jaipur, 1 Night Jodhpur, 1 Night Jaisalmer Tent, 2 Nights Udaipur. Travel in a comfortable AC Tempo Traveller for the group."
  }
];

export const mockPackages = [
  ...basePackages,
  ...basePackages.map(p => ({ ...p, id: p.id + 100 })),
  ...basePackages.map(p => ({ ...p, id: p.id + 200 })),
  ...basePackages.map(p => ({ ...p, id: p.id + 300 })),
  ...basePackages.map(p => ({ ...p, id: p.id + 400 })),
];

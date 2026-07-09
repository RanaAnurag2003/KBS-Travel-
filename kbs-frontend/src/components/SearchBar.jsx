import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fromLocation] = useState("Kewr (Numbug)");
  const [toLocation, setToLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("Select Filters");
  const [departureDate] = useState("2026-07-24");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [prefixOpen, setPrefixOpen] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState("+91");

  const popularDestinations = [
    "Goa", "Maldives", "Swiss Alps", "Bali", "Paris",
    "Dubai", "Singapore", "New York", "Tokyo", "London",
    "Rome", "Sydney", "Barcelona", "Amsterdam"
  ];

  const handleFilterSelect = (val) => {
    setSearchCategory(val);
    setFilterOpen(false);
  };

  const handleSearchClick = () => {
    if (!name || !phone) {
      alert("Please fill in Name and Phone number");
      return;
    }
    if (onSearch) {
      onSearch({
        fromCity: fromLocation,
        toDestination: toLocation,
        category: searchCategory,
        departureDate,
        name,
        phone: `${phonePrefix} ${phone}`
      });
    }
  };

  const getPrefixLabel = (prefix) => {
    switch (prefix) {
      case "+91": return "🇮🇳 +91";
      case "+1": return "🇺🇸 +1";
      case "+44": return "🇬🇧 +44";
      case "+61": return "🇦🇺 +61";
      case "+971": return "🇦🇪 +971";
      default: return "🇮🇳 +91";
    }
  };

  return (
    <div className="search-bar-v2" onClick={() => { setFilterOpen(false); setPrefixOpen(false); }}>
      <div className="search-row-v2" onClick={(e) => e.stopPropagation()}>
        {/* Destination Field */}
        <div className="input-group-v2 dest-group-v2">
          <label>Destination</label>
          <div className="input-wrapper-v2" style={{ position: "relative" }}>
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Where are you planning?"
              value={toLocation}
              onChange={(e) => {
                setToLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && toLocation && (
              <div
                className="filters-list-v2 open"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  zIndex: 20,
                  marginTop: "8px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)"
                }}
              >
                {popularDestinations
                  .filter(d => d.toLowerCase().includes(toLocation.toLowerCase()))
                  .map(dest => (
                    <div
                      key={dest}
                      className="filter-item-v2"
                      onClick={() => {
                        setToLocation(dest);
                        setShowSuggestions(false);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>{dest}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Name Field */}
        <div className="input-group-v2 name-group-v2">
          <label>Name</label>
          <div className="input-wrapper-v2">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Phone Number Field */}
        <div className="input-group-v2 phone-group-v2">
          <label>Phone Number</label>
          <div className="input-wrapper-v2 phone-input-wrapper">
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="phone-select-container">
              <div 
                className="phone-prefix-trigger" 
                onClick={(e) => {
                  e.stopPropagation();
                  setPrefixOpen(!prefixOpen);
                  setFilterOpen(false);
                }}
              >
                <span>{getPrefixLabel(phonePrefix)}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="dropdown-arrow-mini">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {prefixOpen && (
                <div className="phone-prefix-dropdown-list">
                  <div className={`phone-prefix-item ${phonePrefix === "+91" ? "active" : ""}`} onClick={() => { setPhonePrefix("+91"); setPrefixOpen(false); }}>
                    <span>🇮🇳</span> <span>+91</span>
                  </div>
                  <div className={`phone-prefix-item ${phonePrefix === "+1" ? "active" : ""}`} onClick={() => { setPhonePrefix("+1"); setPrefixOpen(false); }}>
                    <span>🇺🇸</span> <span>+1</span>
                  </div>
                  <div className={`phone-prefix-item ${phonePrefix === "+44" ? "active" : ""}`} onClick={() => { setPhonePrefix("+44"); setPrefixOpen(false); }}>
                    <span>🇬🇧</span> <span>+44</span>
                  </div>
                  <div className={`phone-prefix-item ${phonePrefix === "+61" ? "active" : ""}`} onClick={() => { setPhonePrefix("+61"); setPrefixOpen(false); }}>
                    <span>🇦🇺</span> <span>+61</span>
                  </div>
                  <div className={`phone-prefix-item ${phonePrefix === "+971" ? "active" : ""}`} onClick={() => { setPhonePrefix("+971"); setPrefixOpen(false); }}>
                    <span>🇦🇪</span> <span>+971</span>
                  </div>
                </div>
              )}
            </div>
            <div className="phone-divider-line"></div>
            <input
              type="tel"
              placeholder="Your Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="phone-main-input"
            />
          </div>
        </div>

        {/* Filters Field */}
        <div className="input-group-v2 half-width">
          <label>Filters</label>
          <div className="input-wrapper-v2 dropdown" onClick={() => setFilterOpen(!filterOpen)} style={{ cursor: "pointer", position: "relative" }}>
            <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <div className="dropdown-value-text">
              {searchCategory}
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="dropdown-arrow-icon" style={{ transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            <div className={`filters-list-v2 ${filterOpen ? "open" : ""}`} style={{ position: "absolute", bottom: "100%", left: 0, width: "100%", zIndex: 10, marginBottom: "8px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: "1px solid var(--border-color)" }}>
              <div className="filter-item-v2" onClick={(e) => { e.stopPropagation(); handleFilterSelect("Couple"); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span>Couple</span>
              </div>
              <div className="filter-item-v2" onClick={(e) => { e.stopPropagation(); handleFilterSelect("Family"); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <span>Family</span>
              </div>
              <div className="filter-item-v2" onClick={(e) => { e.stopPropagation(); handleFilterSelect("Adventure"); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                <span>Adventure</span>
              </div>
              <div className="filter-item-v2" onClick={(e) => { e.stopPropagation(); handleFilterSelect("Relaxation"); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span>Relaxation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-group-v2">
          <button type="button" className="btn-search-v2" onClick={handleSearchClick}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
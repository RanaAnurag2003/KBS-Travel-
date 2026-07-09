import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useAuth from "../hooks/useAuth";
import "./HeaderAuth.css";

export default function Header({ currentSection, onNavigate, onSearch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "overview", label: "Overview" },
    { id: "packages", label: "Packages" },
    { id: "inclusion", label: "Inclusion" },
    { id: "faq", label: "FAQ" }
  ];


  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 30;
      setIsScrolled((prev) => {
        if (prev !== shouldBeScrolled) {
          return shouldBeScrolled;
        }
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  const submitSearch = () => {
    const query = searchValue.trim();
    if (!query) return;
    if (onSearch) onSearch(query);
  };

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const drawer = (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="nav-drawer-overlay-v2"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`nav-drawer-v2 ${mobileMenuOpen ? "open" : ""}`}>
        <div className="nav-drawer-header-v2">
          <span className="nav-drawer-title-v2">Menu</span>
          <button
            type="button"
            className="nav-drawer-close-v2"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {isAuthenticated && (
          <div className="mobile-auth-section-v2">
            <div className="mobile-user-info-v2">
              <div className="mobile-avatar-v2">
                <img
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mobile-user-details-v2">
                <span className="mobile-name-v2">{user.name}</span>
                <span className="mobile-email-v2">{user.email}</span>
              </div>
            </div>
            <div className="mobile-auth-links-v2">
              <button
                type="button"
                className="mobile-auth-link-v2"
                onClick={() => {
                  alert("Profile section is under construction");
                  setMobileMenuOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
              <button
                type="button"
                className="mobile-auth-link-v2"
                onClick={() => {
                  alert("Bookings section is under construction");
                  setMobileMenuOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                My Bookings
              </button>
              <button
                type="button"
                className="mobile-auth-link-v2 mobile-logout-btn-v2"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}

        <nav className="nav-drawer-list-v2">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`nav-drawer-link-v2 ${isActive ? "active" : ""}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="nav-drawer-footer-v2">
          <a
            href="#packages"
            className="btn-explore-mobile-v2"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("packages");
            }}
          >
            Explore Packages
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <header
        className={`header-main-v2 ${isScrolled ? "scrolled" : ""}`}
      >
        <div className="header-container-v2">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("home");
            }}
            className="logo-link-v2 group"
          >
            <div className="logo-icon-v2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M4.5 8h15M4.5 16h15" strokeOpacity="0.3" />
                <path d="M10 3l-2 5M14 21l2-5" />
              </svg>
            </div>
            <span className="logo-text-v2">KBS Travels</span>
          </a>

          {/* Navigation */}
          <nav className="nav-desktop-v2">
            {navItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`nav-link-v2 ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="header-actions-v2">
            {isAuthenticated && (
              <div className="header-auth-container-v2" ref={dropdownRef}>
                <button
                  type="button"
                  className="header-user-btn-v2"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="header-avatar-container-v2">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="header-avatar-img-v2"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <svg
                    className="header-dropdown-icon-v2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="header-auth-dropdown-v2">
                    <button
                      type="button"
                      className="header-dropdown-item-v2"
                      onClick={() => {
                        alert("Profile section is under construction");
                        setDropdownOpen(false);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>
                    <button
                      type="button"
                      className="header-dropdown-item-v2"
                      onClick={() => {
                        alert("Bookings section is under construction");
                        setDropdownOpen(false);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      My Bookings
                    </button>
                    <div className="header-dropdown-divider-v2" />
                    <button
                      type="button"
                      className="header-dropdown-item-v2"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <a
              href="https://wa.me/917042111141"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-v2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              +91 7042111141
            </a>

            <button
              type="button"
              className="hamburger-btn-v2"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Rendered via portal so it's never affected by the header's own
          transform/stacking context - fixes it being mis-positioned/visible
          before opening. */}
      {typeof document !== "undefined" && createPortal(drawer, document.body)}
    </>
  );
}
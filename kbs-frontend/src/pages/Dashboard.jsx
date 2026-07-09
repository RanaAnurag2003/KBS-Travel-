import React, { useContext, useState } from "react";
import { CMSContext } from "../context/CMSContext";
import { LogOut, ArrowRight, ShieldCheck, Database, HelpCircle } from "lucide-react";
import UploadCard from "../components/UploadCard";
import FaqManagement from "./FaqManagement";
import "./Dashboard.css";

import palmSuitcase from "../assets/palm_suitcase.webp";
import compassTag from "../assets/compass_tag.webp";
import cameraBrush from "../assets/camera_brush.webp";
import earthGlobe from "../assets/earth_globe.webp";

export default function Dashboard() {
  const { adminRole, logout, packages, offers } = useContext(CMSContext);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" or "faq"

  const handleImportSuccess = () => {
    setRefreshHistory(prev => prev + 1);
  };

  const handleLaunchEditor = () => {
    // Navigate to visual editor
    window.history.pushState({}, "", "/admin/editor");
    // Dispatch popstate event so App.jsx handles the route change
    window.dispatchEvent(new Event("popstate"));
  };

  // Stats computation
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.isActive !== false).length;
  const totalOffers = offers.length;

  return (
    <div className="dashboard-page">
      {/* Decorative travel-outline illustrations */}
      <div className="dashboard-decor" aria-hidden="true">
        <svg className="dash-deco-icon dash-deco-compass" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="42" />
          <circle cx="50" cy="50" r="38" />
          <path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" />
          <path d="M23.2 23.2 L28.9 28.9 M71.1 71.1 L76.8 76.8 M71.1 23.2 L76.8 28.9 M23.2 71.1 L28.9 76.8" />
          <path d="M50 50 L68 32 M50 50 L32 68" />
          <polygon points="50,50 63,33 67,37" fill="currentColor" opacity="0.2" />
          <polygon points="50,50 37,67 33,63" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
        </svg>

        <svg className="dash-deco-icon dash-deco-plane-top" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
        </svg>

        <svg className="dash-deco-icon dash-deco-plane-bottom" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
        </svg>

        <svg className="dash-deco-icon dash-deco-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
        </svg>

        <svg className="dash-deco-icon dash-deco-star" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
        </svg>

        <svg className="dash-deco-icon dash-deco-flightpath" viewBox="0 0 220 120" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6">
          <path d="M4 100 C 60 20, 140 20, 216 60" />
          <circle cx="4" cy="100" r="3" fill="currentColor" stroke="none" />
          <circle cx="216" cy="60" r="3" fill="currentColor" stroke="none" />
        </svg>

        <svg className="dash-deco-icon dash-deco-luggage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9">
          <rect x="4" y="8" width="16" height="12" rx="2" />
          <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M4 13h16" />
        </svg>
      </div>

      <div className="dashboard-container">

        {/* Header Block */}
        <div className="dashboard-glass-panel dashboard-header">
          <div className="dashboard-header-content" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="brand-icon-box">
              <ShieldCheck size={24} style={{ color: "#fff" }} />
            </div>
            <div>
              <div className="dashboard-header-title-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 300, letterSpacing: "-0.01em", color: "#ffffff" }}>CMS Control Center</h1>
                <span className="dashboard-admin-badge" style={{
                  background: "rgba(255, 106, 0, 0.15)",
                  border: "1px solid rgba(255, 106, 0, 0.3)",
                  color: "#ff8a3d",
                  fontSize: "10px",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  letterSpacing: "0.05em"
                }}>
                  {adminRole}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#cbd5e1" }}>
                Manage holiday packages catalog, FAQs and visual website content.
              </p>
            </div>
          </div>

          <button onClick={logout} className="dashboard-btn-danger">
            <LogOut size={16} /> Sign Out CMS
          </button>
        </div>

        {/* Tab Buttons Navigation */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "4px" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              background: activeTab === "overview" ? "rgba(255, 106, 0, 0.1)" : "transparent",
              border: "none",
              borderBottom: activeTab === "overview" ? "3px solid #ff6a00" : "3px solid transparent",
              color: activeTab === "overview" ? "#ff8a3d" : "#94a3b8",
              padding: "12px 24px",
              fontWeight: "400",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <Database size={16} /> Overview & Data Import
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            style={{
              background: activeTab === "faq" ? "rgba(255, 106, 0, 0.1)" : "transparent",
              border: "none",
              borderBottom: activeTab === "faq" ? "3px solid #ff6a00" : "3px solid transparent",
              color: activeTab === "faq" ? "#ff8a3d" : "#94a3b8",
              padding: "12px 24px",
              fontWeight: "400",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
              borderRadius: "8px 8px 0 0",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <HelpCircle size={16} /> Destination FAQ Management
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">

              <div className="stitched-panel card-total-packages stat-card" style={{ padding: "16px 20px" }}>
                <div className="stat-card-inner">
                  <div className="stat-icon-circle">
                    <img src={palmSuitcase} alt="Palm Suitcase" className="stat-card-icon" />
                  </div>
                  <div>
                    <p className="stat-label">Total Packages</p>
                    <h3>{totalPackages}</h3>
                    <p style={{ fontSize: "11px", fontWeight: 400 }}>{activePackages} active on site</p>
                  </div>
                </div>
              </div>

              <div className="stitched-panel card-active-offers stat-card" style={{ padding: "16px 20px" }}>
                <div className="stat-card-inner">
                  <div className="stat-icon-circle">
                    <img src={compassTag} alt="Compass Tag" className="stat-card-icon" />
                  </div>
                  <div>
                    <p className="stat-label">Active Promo Offers</p>
                    <h3>{totalOffers}</h3>
                    <p style={{ fontSize: "11px", color: "#a1a1aa" }}>Slideshow promo banners</p>
                  </div>
                </div>
              </div>

              <div className="stitched-panel card-visual-editing stat-card" style={{ padding: "16px 20px" }}>
                <div className="stat-card-inner">
                  <div className="stat-icon-circle">
                    <img src={cameraBrush} alt="Camera Brush" className="stat-card-icon" />
                  </div>
                  <div>
                    <p className="stat-label">Visual Editing</p>
                    <h3>WYSIWYG Mode</h3>
                    <p style={{ fontSize: "11px", color: "#f43f5e", fontWeight: 400 }}>Design Your Own Adventure</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Launch Visual Editor Card */}
            <div className="launch-editor-banner">
              <div className="launch-editor-content">
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 300, color: "#ff8a3d", letterSpacing: "-0.01em" }}>Visual Website Editor</h2>
                <ul className="launch-editor-list">
                  <li>Launch the interactive, live WYSIWYG editor to customize banners, text content, and image cards.</li>
                  <li>Edit package prices directly on the front-end layout.</li>
                </ul>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", flexShrink: 0 }}>
                <button onClick={handleLaunchEditor} className="launch-editor-btn">
                  Launch Visual Editor <ArrowRight size={16} />
                </button>
                <img src={earthGlobe} alt="Globe" style={{ width: "44px", height: "44px", objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }} />
              </div>
            </div>

            {/* Excel Import Section */}
            <div className="import-section-grid">
              <UploadCard onImportSuccess={handleImportSuccess} />
            </div>
          </>
        ) : (
          <FaqManagement />
        )}

        <p className="dashboard-footer">© 2026 KBS Travels CMS · Version 2.4.0</p>

      </div>
    </div>
  );
}
import React, { useContext, useState, useEffect, useLayoutEffect, useRef } from "react";
import { CMSContext } from "../context/CMSContext";
import { Settings, History, Layers, CheckCircle2, LogOut, Plus, Undo2, Redo2, EyeOff, LayoutGrid, X } from "lucide-react";

export default function AdminToolbar() {
  const {
    isAdmin,
    adminRole,
    editMode,
    setEditMode,
    previewMode,
    setPreviewMode,
    saveStatus,
    historyList,
    logout,
    publishAll,
    restoreHistory,
    undo,
    redo,
    hasUndo,
    hasRedo,
    addPackage,
    addOffer
  } = useContext(CMSContext);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("build");
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Floating Panel Drag State
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const PANEL_W = 360;

  useLayoutEffect(() => {
    if (!isCollapsed && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setPosition({
        x: Math.max(10, (window.innerWidth - rect.width) / 2),
        y: Math.max(10, (window.innerHeight - rect.height) / 2),
      });
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - PANEL_W - 10),
        y: Math.min(prev.y, window.innerHeight - 300)
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e) => {
    const handle = e.target.closest(".drag-handle");
    if (!handle) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const nextX = Math.max(10, Math.min(e.clientX - dragStart.current.x, window.innerWidth - PANEL_W - 10));
      const nextY = Math.max(10, Math.min(e.clientY - dragStart.current.y, window.innerHeight - 300));
      setPosition({ x: nextX, y: nextY });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handlePublishClick = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    await publishAll();
    setIsPublishing(false);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  if (!isAdmin) return null;

  // ── Design tokens (orange theme matching reference) ──────────
  const orange = "#F04A23";
  const orangeLight = "#ffa333";
  const panelBg = "#1a1a1a";
  const borderCol = "rgba(255,255,255,0.1)";
  const rowBg = "#242424";

  // Tab button styles
  const tabBtn = (active, fullWidth = false) => ({
    flex: fullWidth ? "1 1 100%" : 1,
    padding: "10px 0",
    border: "1px solid " + (active ? orange : "rgba(255,255,255,0.07)"),
    borderRadius: 24,
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    cursor: "pointer",
    transition: "all 0.15s",
    background: active ? `linear-gradient(135deg, ${orange}, #cc6f00)` : rowBg,
    color: active ? "#fff" : "#888",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  });

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 99999,
          width: 52, height: 52,
          background: `linear-gradient(135deg, ${orange}, #cc6f00)`,
          border: "none", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(255,140,0,0.4)", cursor: "pointer",
          color: "#fff",
        }}
        title="Open Visual CMS Panel"
      >
        <LayoutGrid style={{ width: 20, height: 20 }} />
      </button>
    );
  }

  return (
    <>
      {/* Global keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .atb-publish-btn:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
        .atb-row-btn:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,140,0,0.35) !important; }
      `}</style>

      {/* ── Admin Panel ── */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 99999,
          width: Math.min(PANEL_W, window.innerWidth - 20) + "px",
          maxWidth: "calc(100vw - 20px)",
          fontFamily: "'Inter', sans-serif",
          background: panelBg,
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,140,0,0.08)",
          color: "#e0e0e0",
          userSelect: "none",
          overflow: "hidden",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* ── Header / Drag Handle ── */}
        <div
          className="drag-handle"
          style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${borderCol}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "move",
            background: "#202020",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexShrink: 1 }}>
            <span style={{
              width: 9, height: 9, borderRadius: "50%",
              background: orange,
              display: "inline-block",
              flexShrink: 0,
              animation: "pulseDot 2s infinite",
            }} />
            <span style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ccc", WebkitTextFillColor: "#ccc", background: "none", whiteSpace: "nowrap" }}>
              {adminRole} Panel
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {/* Dashboard button */}
            <button
              onClick={() => {
                window.history.pushState({}, "", "/admin/dashboard");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              style={{
                background: "transparent",
                border: `1px solid rgba(255,255,255,0.15)`,
                borderRadius: 8,
                color: "#ccc",
                padding: "4px 10px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 10, fontWeight: 700,
                whiteSpace: "nowrap",
                textTransform: "uppercase", letterSpacing: "0.05em",
                transition: "all 0.15s",
              }}
              title="Return to CMS Dashboard"
              onMouseEnter={e => { e.currentTarget.style.borderColor = orange; e.currentTarget.style.color = orange; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#ccc"; }}
            >
              <LayoutGrid style={{ width: 10, height: 10 }} /> Dashboard
            </button>
            {/* Collapse */}
            <button
              onClick={() => setIsCollapsed(true)}
              style={{ padding: "4px 2px", background: "transparent", border: "none", color: "#666", cursor: "pointer", borderRadius: 6, display: "flex", fontSize: 14, lineHeight: 1, flexShrink: 0 }}
              title="Minimize"
            >
              ›
            </button>
          </div>
        </div>

        {/* ── Tab Buttons ── */}
        <div style={{ padding: "14px 14px 0" }}>
          {/* BUILD + EDIT — side by side top row */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActiveTab("build")}
              style={tabBtn(activeTab === "build")}
            >
              <LayoutGrid style={{ width: 13, height: 13 }} />
              Build
            </button>
            <button onClick={() => setActiveTab("edit")} style={tabBtn(activeTab === "edit")}>
              <Layers style={{ width: 13, height: 13 }} />
              Edit
            </button>
          </div>
          {/* SETUP — centered below */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <button
              onClick={() => setActiveTab("setup")}
              style={{
                ...tabBtn(activeTab === "setup"),
                flex: "0 0 auto",
                padding: "10px 28px",
                minWidth: "60%",
              }}
            >
              <Settings style={{ width: 13, height: 13 }} />
              Setup
            </button>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div style={{ padding: "14px 14px 0" }}>

          {/* ══ Tab: Build ══ */}
          {activeTab === "build" && (
            <>
              {/* Save Status + Version History row */}
              <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginBottom: 10 }}>
                {/* Save Status */}
                <div style={{
                  flex: 1, background: rowBg, border: `1px solid ${borderCol}`,
                  borderRadius: 10, padding: "9px 10px", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12,
                  whiteSpace: "nowrap", overflow: "hidden",
                }}>
                  <span style={{ color: "#777" }}>Save Status:</span>
                  <span style={{
                    fontWeight: 700,
                    color: saveStatus === "Saving..." ? "#f59e0b"
                      : saveStatus.includes("Saved") ? "#10b981"
                        : orange
                  }}>
                    {saveStatus === "Idle" ? "Ready" : saveStatus}
                  </span>
                </div>

                {/* View Version History */}
                <button
                  className="atb-row-btn"
                  onClick={() => setShowHistoryDrawer(true)}
                  style={{
                    flex: 1, background: rowBg, border: `1px solid ${borderCol}`,
                    borderRadius: 10, padding: "9px 10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 6, fontSize: 11, fontWeight: 600,
                    color: "#ccc", cursor: "pointer", textAlign: "center",
                    lineHeight: 1.3, transition: "all 0.15s",
                  }}
                >
                  <History style={{ width: 14, height: 14, color: orange, flexShrink: 0 }} />
                  View Version History
                </button>
              </div>

              {/* Publish Button */}
              {adminRole !== "Viewer" && (
                <button
                  className="atb-publish-btn"
                  onClick={handlePublishClick}
                  disabled={isPublishing}
                  style={{
                    width: "100%", padding: "13px 0",
                    borderRadius: 10, border: "none",
                    fontWeight: 800, fontSize: 12,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    cursor: isPublishing ? "not-allowed" : "pointer",
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: publishSuccess
                      ? "linear-gradient(135deg, #10b981, #14b8a6)"
                      : `linear-gradient(135deg, ${orange} 0%, #ff5500 100%)`,
                    transition: "all 0.2s",
                  }}
                >
                  {isPublishing ? (
                    <>
                      <svg style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Publishing...
                    </>
                  ) : publishSuccess ? (
                    <><CheckCircle2 style={{ width: 14, height: 14 }} /> Published!</>
                  ) : (
                    "Publish Live Changes"
                  )}
                </button>
              )}
            </>
          )}

          {/* ══ Tab: Edit ══ */}
          {activeTab === "edit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Edit Mode */}
              <div style={{ background: rowBg, border: `1px solid ${borderCol}`, borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#ddd" }}>Edit Mode</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Modify cards directly</div>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    width: 42, height: 24, borderRadius: 12, border: "none", padding: 2,
                    background: editMode ? orange : "#333", cursor: "pointer",
                    display: "flex", alignItems: "center", transition: "background 0.25s", flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    transform: editMode ? "translateX(18px)" : "translateX(0)",
                    transition: "transform 0.25s",
                  }} />
                </button>
              </div>

              {/* Preview Drafts */}
              <div style={{ background: rowBg, border: `1px solid ${borderCol}`, borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#ddd" }}>Preview Drafts</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>View unpublished work</div>
                </div>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  style={{
                    width: 42, height: 24, borderRadius: 12, border: "none", padding: 2,
                    background: previewMode ? "#f59e0b" : "#333", cursor: "pointer",
                    display: "flex", alignItems: "center", transition: "background 0.25s", flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    transform: previewMode ? "translateX(18px)" : "translateX(0)",
                    transition: "transform 0.25s",
                  }} />
                </button>
              </div>

              {/* Undo / Redo */}
              {adminRole !== "Viewer" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={undo} disabled={!hasUndo}
                    style={{
                      flex: 1, padding: "9px 0",
                      border: `1px solid ${hasUndo ? "rgba(255,140,0,0.3)" : "#2a2a2a"}`,
                      borderRadius: 10, fontSize: 12, fontWeight: 600,
                      cursor: hasUndo ? "pointer" : "not-allowed",
                      background: hasUndo ? "rgba(255,140,0,0.08)" : "transparent",
                      color: hasUndo ? orange : "#444",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    <Undo2 style={{ width: 13, height: 13 }} /> Undo
                  </button>
                  <button
                    onClick={redo} disabled={!hasRedo}
                    style={{
                      flex: 1, padding: "9px 0",
                      border: `1px solid ${hasRedo ? "rgba(255,140,0,0.3)" : "#2a2a2a"}`,
                      borderRadius: 10, fontSize: 12, fontWeight: 600,
                      cursor: hasRedo ? "pointer" : "not-allowed",
                      background: hasRedo ? "rgba(255,140,0,0.08)" : "transparent",
                      color: hasRedo ? orange : "#444",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    <Redo2 style={{ width: 13, height: 13 }} /> Redo
                  </button>
                </div>
              )}

              {/* Add Package / Offer */}
              {adminRole !== "Viewer" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={addPackage}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: "1px solid rgba(255,140,0,0.2)",
                      background: "rgba(255,140,0,0.08)", color: orangeLight,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,140,0,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,140,0,0.08)"}
                  >
                    <Plus style={{ width: 13, height: 13 }} /> Package
                  </button>
                  <button
                    onClick={addOffer}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 10,
                      border: "1px solid rgba(255,140,0,0.2)",
                      background: "rgba(255,140,0,0.08)", color: orangeLight,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,140,0,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,140,0,0.08)"}
                  >
                    <Plus style={{ width: 13, height: 13 }} /> Offer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ Tab: Setup ══ */}
          {activeTab === "setup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Role card */}
              <div style={{ background: rowBg, border: `1px solid ${borderCol}`, borderRadius: 10, padding: "12px 14px", fontSize: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#777" }}>Admin Role</span>
                  <span style={{ fontWeight: 700, color: orange }}>{adminRole}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#777" }}>Environment</span>
                  <span style={{ fontWeight: 600, color: "#999" }}>Production</span>
                </div>
              </div>

              {/* Go to Dashboard */}
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/admin/dashboard");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                style={{
                  padding: "11px 0", borderRadius: 10,
                  border: "1px solid rgba(255,140,0,0.3)",
                  background: "rgba(255,140,0,0.08)", color: orangeLight,
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,140,0,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,140,0,0.08)"}
              >
                <LayoutGrid style={{ width: 13, height: 13 }} /> Go to Dashboard
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                style={{
                  padding: "11px 0", borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "rgba(239,68,68,0.08)", color: "#f87171",
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
              >
                <LogOut style={{ width: 13, height: 13 }} /> Sign Out CMS
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "10px 14px 12px",
          textAlign: "center",
          fontSize: 10,
          color: "#555",
          marginTop: 12,
          borderTop: `1px solid rgba(255,255,255,0.05)`,
        }}>
          © 2026 KBS Travels
        </div>
      </div>

      {/* ── History Drawer ── */}
      {showHistoryDrawer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", justifyContent: "flex-end", fontFamily: "'Inter', sans-serif" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowHistoryDrawer(false)} />
          <div style={{
            position: "relative", width: 360, background: "#111",
            borderLeft: "1px solid rgba(255,255,255,0.08)", height: "100%",
            padding: "24px", boxSizing: "border-box",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
            display: "flex", flexDirection: "column", gap: 20, color: "#e2e8f0",
            animation: "slideIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <History style={{ width: 16, height: 16, color: orange }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>CMS Version Logs</h3>
              </div>
              <button onClick={() => setShowHistoryDrawer(false)} style={{ padding: 4, background: "transparent", border: "none", color: "#64748b", cursor: "pointer", borderRadius: 6, display: "flex" }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {historyList.length === 0 ? (
                <div style={{ textAlign: "center", color: "#555", paddingTop: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <EyeOff style={{ width: 28, height: 28, color: "#333" }} />
                  No visual edits saved yet.<br />Make changes inline to record history.
                </div>
              ) : (
                historyList.map(h => (
                  <div
                    key={h.id}
                    style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: orange, textTransform: "capitalize" }}>
                        {h.entityType === "site_content" ? "Page Layout" : h.entityType} ({h.entityId})
                      </span>
                      <span style={{ fontSize: 10, color: "#666" }}>By {h.editorName || "Editor"}</span>
                      <span style={{ fontSize: 9, color: "#444" }}>{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    {adminRole === "Super Admin" && (
                      <button
                        onClick={() => { restoreHistory(h.id); setShowHistoryDrawer(false); }}
                        style={{
                          background: `linear-gradient(135deg, ${orange}, #cc6f00)`,
                          border: "none", color: "#fff",
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                        }}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
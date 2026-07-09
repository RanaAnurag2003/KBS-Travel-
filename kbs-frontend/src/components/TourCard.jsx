import { useRef, useState, memo, useContext, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import LazyImage from "./LazyImage";
import { EditableText, EditableImage } from "./CMSWrappers";
import { CMSContext } from "../context/CMSContext";
import { Settings, X, Plus, Trash2 } from "lucide-react";

const TourCard = memo(function TourCard({ pkg, onSelect, onGetQuote, isActive, isNew }) {
  const cardRef = useRef(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [inspectorTab, setInspectorTab] = useState("content"); // "content" | "lists"
  const { editMode, previewMode, deletePackage, adminRole, updatePackageDraft, activeInspectorId, setActiveInspectorId } = useContext(CMSContext);

  const canEdit = editMode && !previewMode && adminRole !== "Viewer";
  const showInspector = activeInspectorId === pkg.id;

  const handleCardClick = (e) => {
    if (
      e.target.closest(".tcv-footer") ||
      e.target.closest(".cms-card-settings")
    ) {
      return;
    }
    onSelect(pkg.id);
  };

  const isHoneymoon = pkg.categories && pkg.categories.includes("Honeymoon");

  const bullets = pkg.tags && pkg.tags.length > 0
    ? pkg.tags
    : ["5 Star Hotel", "Selected Meals", "2 Activities", "Airport Pickup & Drop"];

  const highlights = pkg.highlights && pkg.highlights.length > 0
    ? pkg.highlights.slice(0, 2)
    : ["Sunset Cruise, Snorkeling & Aromatherapy Massage", "Snorkeling Equipment"];

  const customProps = pkg.customProperties || {};
  const subtitle = customProps.subtitle || "";
  const discountPrice = customProps.discountPrice || "";
  const discountPercentage = customProps.discountPercentage || "";
  const rating = customProps.rating || pkg.rating || 5.0;
  const reviewsCount = customProps.reviewsCount || pkg.reviews || 120;
  const availableSeats = customProps.availableSeats || "";
  const buttonText = customProps.buttonText || "GET QUOTE";
  const footerLeftText = customProps.footerLeftText || (isHoneymoon ? "This price is lower than the<br />average price in July" : "No Cost EMI at<br />₹58,943/month");

  const handleUpdateProps = (updatedFields) => {
    updatePackageDraft(pkg.id, {
      customProperties: {
        ...customProps,
        ...updatedFields
      }
    });
  };

  const handleFieldChange = (field, val) => {
    updatePackageDraft(pkg.id, { [field]: val });
  };

  // Card Inspector Movable / Draggable State
  const [inspectorPos, setInspectorPos] = useState({ x: window.innerWidth - 440, y: 60 });
  const [isDraggingInspector, setIsDraggingInspector] = useState(false);
  const inspectorDragStart = useRef({ x: 0, y: 0 });
  const inspectorRef = useRef(null);

  // Re-center the inspector every time it's opened for this card, measuring
  // its actual rendered size. Runs before paint so there's no visible jump.
  useLayoutEffect(() => {
    if (showInspector && inspectorRef.current) {
      const rect = inspectorRef.current.getBoundingClientRect();
      const x = Math.max(10, (window.innerWidth - rect.width) / 2);
      const y = Math.max(10, (window.innerHeight - rect.height) / 2);
      setInspectorPos({ x, y });
    }
  }, [showInspector]);

  const handleInspectorMouseDown = (e) => {
    const handle = e.target.closest(".inspector-drag-handle");
    if (!handle) return;
    setIsDraggingInspector(true);
    inspectorDragStart.current = {
      x: e.clientX - inspectorPos.x,
      y: e.clientY - inspectorPos.y
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingInspector) return;
      const nextX = Math.max(10, Math.min(e.clientX - inspectorDragStart.current.x, window.innerWidth - 430));
      const nextY = Math.max(10, Math.min(e.clientY - inspectorDragStart.current.y, window.innerHeight - 260));
      setInspectorPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      setIsDraggingInspector(false);
    };

    if (isDraggingInspector) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingInspector]);

  // Keep inspector in bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setInspectorPos(prev => ({
        x: Math.min(prev.x, window.innerWidth - 440),
        y: Math.min(prev.y, window.innerHeight - 260)
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------------------------------------------------------------------------
  // 1. Visitor Mode (Exact Original Presentation)
  // ---------------------------------------------------------------------------
  if (!canEdit) {
    return (
      <div
        ref={cardRef}
        className={`tcv-card fade-in-up ${isActive ? "card-active" : ""}`}
        onClick={handleCardClick}
      >
        <div className="tcv-img-wrapper">
          <LazyImage src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
          {isNew && <span className="tcv-badge tcv-badge-best">New</span>}
          <button
            type="button"
            className="tcv-wishlist-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted((prev) => !prev);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWishlisted}
          >
            <svg
              className="tcv-wishlist-icon"
              viewBox="0 0 24 24"
              fill={isWishlisted ? "#dc2626" : "none"}
              stroke={isWishlisted ? "#dc2626" : "currentColor"}
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.727c-.4 0-.8-.15-1.1-.44L3.9 13.24c-2.1-2.1-2.1-5.5 0-7.6 2-2.02 5.28-2.06 7.33-.1l.77.73.77-.73c2.05-1.96 5.33-1.92 7.33.1 2.1 2.1 2.1 5.5 0 7.6l-7 7.05c-.3.29-.7.44-1.1.44z" />
            </svg>
          </button>
        </div>

        <div className="tcv-body">
          <div className="tcv-head">
            <h3 className="tcv-title">{pkg.title}</h3>
            <span className="tcv-duration">{pkg.duration}</span>
          </div>

          <ul className="tcv-grey-bullets">
            {bullets.map((b, i) => (
              <li key={i}>
                <span className="tcv-dot">•</span> {b}
              </li>
            ))}
          </ul>

          <ul className="tcv-green-bullets">
            {highlights.map((h, i) => (
              <li key={i}>
                <svg className="tcv-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="tcv-footer">
          <button className="tcv-pill-btn" onClick={(e) => {
            e.stopPropagation();
            onGetQuote(pkg);
          }}>
            <span className="tcv-cta-heading">{buttonText}</span>
          </button>
          <div className="tcv-footer-content">
            <div className="tcv-footer-left">
              <div dangerouslySetInnerHTML={{ __html: footerLeftText }} />
            </div>
            <div className="tcv-footer-right">
              <div className="tcv-price-large">
                ₹<b>{pkg.price.toLocaleString()}</b> <span>/Person</span>
              </div>
              <div className="tcv-price-total">Total Price ₹{(pkg.price * 2).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Editor Mode (Outlined Settings Controls & Inline Visual Editing Elements)
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={cardRef}
      className={`tcv-card h-full fade-in-up relative group/card-premium ${isActive ? "card-active" : ""} ring-2 ring-transparent hover:ring-sky-400`}
      onClick={handleCardClick}
    >
      {/* CMS Visual Settings Control Bar Overlay */}
      <div className="absolute top-4 right-2 z-30 flex gap-2 opacity-0 group-hover/card-premium:opacity-100 transition-opacity duration-200 pointer-events-auto cms-card-settings">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveInspectorId(pkg.id);
          }}
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          title="Inspect Card Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            deletePackage(pkg.id);
          }}
          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          title="Delete Package"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="tcv-img-wrapper">
        <EditableImage pkgId={pkg.id} pkgField="image" fallback={pkg.image} className="w-full h-full object-cover" />
        {isNew && <span className="tcv-badge tcv-badge-best">New</span>}

        <button
          type="button"
          className="tcv-wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted((prev) => !prev);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
        >
          <svg
            className="tcv-wishlist-icon"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#dc2626" : "none"}
            stroke={isWishlisted ? "#dc2626" : "currentColor"}
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.727c-.4 0-.8-.15-1.1-.44L3.9 13.24c-2.1-2.1-2.1-5.5 0-7.6 2-2.02 5.28-2.06 7.33-.1l.77.73.77-.73c2.05-1.96 5.33-1.92 7.33.1 2.1 2.1 2.1 5.5 0 7.6l-7 7.05c-.3.29-.7.44-1.1.44z" />
          </svg>
        </button>
      </div>

      <div className="tcv-body">
        <div className="tcv-head">
          <EditableText pkgId={pkg.id} pkgField="title" fallback={pkg.title} className="tcv-title" as="h3" />
          <EditableText pkgId={pkg.id} pkgField="duration" fallback={pkg.duration} className="tcv-duration" as="span" />
        </div>

        <ul className="tcv-grey-bullets">
          {bullets.map((b, i) => (
            <li key={i} style={{ overflow: "visible" }}>
              <span className="tcv-dot">•</span>
              <EditableText
                value={b}
                onSave={(val) => {
                  const newBullets = [...bullets];
                  newBullets[i] = val;
                  updatePackageDraft(pkg.id, { tags: newBullets });
                }}
                as="span"
              />
            </li>
          ))}
        </ul>

        <ul className="tcv-green-bullets">
          {highlights.map((h, i) => (
            <li key={i} style={{ overflow: "visible" }}>
              <svg className="tcv-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <EditableText
                value={h}
                onSave={(val) => {
                  const newHighlights = [...highlights];
                  newHighlights[i] = val;
                  updatePackageDraft(pkg.id, { highlights: newHighlights });
                }}
                as="span"
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="tcv-footer">
        <button className="tcv-pill-btn" onClick={(e) => {
          e.stopPropagation();
          if (canEdit) return;
          onGetQuote(pkg);
        }}>
          <span className="tcv-cta-heading">
            <EditableText
              value={buttonText}
              onSave={(val) => handleUpdateProps({ buttonText: val })}
              as="span"
            />
          </span>
        </button>
        <div className="tcv-footer-content">
          <div className="tcv-footer-left">
            <EditableText
              value={footerLeftText}
              onSave={(val) => handleUpdateProps({ footerLeftText: val })}
              as="div"
              isParagraph={true}
            />
          </div>
          <div className="tcv-footer-right">
            <div className="tcv-price-large">
              ₹<b><EditableText pkgId={pkg.id} pkgField="price" fallback={pkg.price.toString()} as="span" /></b> <span>/Person</span>
            </div>
            <div className="tcv-price-total">Total Price ₹{(pkg.price * 2).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Card Inspector — Portal rendered directly to document.body */}
      {showInspector && createPortal(
        <div
          ref={inspectorRef}
          style={{
            position: "fixed",
            left: `${inspectorPos.x}px`,
            top: `${inspectorPos.y}px`,
            zIndex: 100000,
            width: "760px",
            maxWidth: "calc(100vw - 20px)",
            fontFamily: "'Inter', sans-serif",
            background: "#1a1a1a",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
            color: "#e2e8f0",
            display: "flex",
            flexDirection: "column",
            userSelect: "none",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle Header */}
          <div
            onMouseDown={handleInspectorMouseDown}
            className="inspector-drag-handle"
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "move",
              background: "rgba(255,255,255,0.04)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Settings style={{ width: 15, height: 15, color: "#F04A23" }} />
              <span style={{ fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>
                Card Inspector
              </span>
            </div>
            <button
              onClick={() => setActiveInspectorId(null)}
              style={{ padding: 4, background: "transparent", border: "none", color: "#64748b", cursor: "pointer", borderRadius: 6, display: "flex" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Tab Switcher */}
          <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, width: 220 }}>
              {["content", "lists"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setInspectorTab(tab)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 24,
                    border: "1px solid " + (inspectorTab === tab ? "#F04A23" : "rgba(255,255,255,0.07)"),
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: inspectorTab === tab ? "#F04A23" : "#242424",
                    color: inspectorTab === tab ? "#ffffff" : "#888",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content — no scroll, 2-column grid */}
          <div style={{ padding: "14px 20px 20px 20px", boxSizing: "border-box" }}>

            {/* ── Content Tab ── */}
            {inspectorTab === "content" && (() => {
              const fieldStyle = { display: "flex", flexDirection: "column", gap: 5, boxSizing: "border-box" };
              const labelStyle = { color: "#888", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" };
              const inputStyle = {
                width: "100%", padding: "7px 10px",
                background: "#242424", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#f1f5f9", fontSize: 12,
                outline: "none", boxSizing: "border-box",
              };
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                  {/* Left column */}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Package Title</label>
                    <input type="text" value={pkg.title} onChange={e => handleFieldChange("title", e.target.value)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Duration</label>
                    <input type="text" value={pkg.duration} onChange={e => handleFieldChange("duration", e.target.value)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Price (₹)</label>
                    <input type="number" value={pkg.price} onChange={e => handleFieldChange("price", parseInt(e.target.value) || 0)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Image URL</label>
                    <input type="text" value={pkg.image} onChange={e => handleFieldChange("image", e.target.value)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Stay &amp; Transfers</label>
                    <input type="text" value={pkg.stayTransfers || ""} placeholder="Stay and transfers..." onChange={e => handleFieldChange("stayTransfers", e.target.value)} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Button Label</label>
                    <input type="text" value={buttonText} onChange={e => handleUpdateProps({ buttonText: e.target.value })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Subtitle</label>
                    <input type="text" value={subtitle} onChange={e => handleUpdateProps({ subtitle: e.target.value })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Available Seats</label>
                    <input type="text" placeholder="e.g. 5" value={availableSeats} onChange={e => handleUpdateProps({ availableSeats: e.target.value })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Rating</label>
                    <input type="number" step="0.1" value={rating} onChange={e => handleUpdateProps({ rating: parseFloat(e.target.value) || 5.0 })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Reviews Count</label>
                    <input type="number" value={reviewsCount} onChange={e => handleUpdateProps({ reviewsCount: parseInt(e.target.value) || 0 })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>

                  <div style={fieldStyle}>
                    <label style={labelStyle}>Discount Price</label>
                    <input type="number" value={discountPrice} onChange={e => handleUpdateProps({ discountPrice: parseInt(e.target.value) || "" })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Discount Label</label>
                    <input type="text" placeholder="15% OFF" value={discountPercentage} onChange={e => handleUpdateProps({ discountPercentage: e.target.value })} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#F04A23"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                  </div>
                </div>
              );
            })()}

            {/* ── Lists Tab ── */}
            {inspectorTab === "lists" && (() => {
              const labelStyle = { color: "#888", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" };
              const inputStyle = { flex: 1, minWidth: 0, padding: "7px 10px", background: "#242424", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9", fontSize: 12, outline: "none", boxSizing: "border-box" };
              const addBtnStyle = { display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "#F04A23", fontWeight: 700, fontSize: 11, cursor: "pointer" };
              const trashBtnStyle = { flexShrink: 0, padding: 5, background: "none", border: "none", color: "#f43f5e", cursor: "pointer", borderRadius: 6, display: "flex" };
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                  {/* Bullets Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={labelStyle}>Bullet Features</span>
                      <button onClick={() => { const v = prompt("Add feature bullet:"); if (v) updatePackageDraft(pkg.id, { tags: [...bullets, v] }); }} style={addBtnStyle}>
                        <Plus style={{ width: 12, height: 12 }} /> Add
                      </button>
                    </div>
                    {bullets.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="text" value={b} onChange={e => { const nb = [...bullets]; nb[i] = e.target.value; updatePackageDraft(pkg.id, { tags: nb }); }} style={inputStyle} />
                        <button onClick={() => updatePackageDraft(pkg.id, { tags: bullets.filter((_, idx) => idx !== i) })} style={trashBtnStyle}>
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Highlights Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={labelStyle}>Card Highlights</span>
                      <button onClick={() => { const v = prompt("Add highlight:"); if (v) updatePackageDraft(pkg.id, { highlights: [...highlights, v] }); }} style={addBtnStyle}>
                        <Plus style={{ width: 12, height: 12 }} /> Add
                      </button>
                    </div>
                    {highlights.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="text" value={h} onChange={e => { const nh = [...highlights]; nh[i] = e.target.value; updatePackageDraft(pkg.id, { highlights: nh }); }} style={inputStyle} />
                        <button onClick={() => updatePackageDraft(pkg.id, { highlights: highlights.filter((_, idx) => idx !== i) })} style={trashBtnStyle}>
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

export default TourCard;
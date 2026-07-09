import React, { useContext, useState, useRef, useEffect } from "react";
import { CMSContext } from "../context/CMSContext";
import LazyImage from "./LazyImage";
import { Bold, Italic, Link2, Palette, AlignLeft, AlignCenter, List, Undo2, Redo2, Heading3, Text, Trash2, Eye, Crop, RefreshCw, AlertTriangle, Copy } from "lucide-react";

// Utility to apply inline rich text formatting (Notion-like bold/italic/lists)
const execCommand = (cmd, val = null) => {
  document.execCommand(cmd, false, val);
};

// ---------------------------------------------------------------------------
// 1. EditableText Component
// ---------------------------------------------------------------------------
export const EditableText = ({
  keyName,
  fallback = "",
  pkgId = null,
  pkgField = null,
  offerId = null,
  offerField = null,
  className = "",
  isParagraph = false,
  as: Element = "div",
  value = null,
  onSave = null
}) => {
  const { editMode, previewMode, siteContent, packages, offers, updateSiteContentDraft, updatePackageDraft, updateOfferDraft, adminRole } = useContext(CMSContext);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef(null);
  const [textColor, setTextColor] = useState("#ffffff");

  const canEdit = editMode && !previewMode && adminRole !== "Viewer";

  // Determine current value to show (fall back from draft to published)
  let currentValue = value !== null ? value : fallback;
  if (value === null) {
    if (pkgId && pkgField) {
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg) {
        const draftKey = `draft${pkgField.charAt(0).toUpperCase() + pkgField.slice(1)}`;
        currentValue = pkg[draftKey] !== null && pkg[draftKey] !== undefined ? pkg[draftKey] : pkg[pkgField];
      }
    } else if (offerId && offerField) {
      const offer = offers.find(o => o.id === offerId);
      if (offer) {
        const draftKey = `draft${offerField.charAt(0).toUpperCase() + offerField.slice(1)}`;
        currentValue = offer[draftKey] !== null && offer[draftKey] !== undefined ? offer[draftKey] : offer[offerField];
      }
    } else if (keyName) {
      const siteObj = siteContent[keyName];
      if (siteObj) {
        currentValue = siteObj.draftValue !== null && siteObj.draftValue !== undefined ? siteObj.draftValue : siteObj.value;
      }
    }
  }

  // Format price if applicable
  let displayValue = currentValue || fallback;
  if (pkgField === "price" && !isEditing) {
    const numericValue = Number(currentValue || fallback);
    displayValue = isNaN(numericValue) ? (currentValue || fallback) : numericValue.toLocaleString();
  }

  // Handle saving the value back to the CMS context
  const handleSaveText = () => {
    if (!textRef.current) return;
    const nextValue = textRef.current.innerHTML.replace(/,/g, ""); // Strip commas for integer fields
    if (nextValue === currentValue) return;

    if (onSave) {
      onSave(nextValue);
      return;
    }

    if (pkgId && pkgField) {
      updatePackageDraft(pkgId, { [pkgField]: pkgField === "price" ? parseInt(nextValue) || 0 : nextValue });
    } else if (offerId && offerField) {
      updateOfferDraft(offerId, { [offerField]: nextValue });
    } else if (keyName) {
      updateSiteContentDraft(keyName, nextValue);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleSaveText();
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault();
      execCommand("bold");
    } else if (e.ctrlKey && e.key === "i") {
      e.preventDefault();
      execCommand("italic");
    } else if (e.key === "Enter" && !isParagraph) {
      e.preventDefault();
      textRef.current.blur();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (textRef.current) {
        textRef.current.innerHTML = displayValue;
      }
      setIsEditing(false);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (!canEdit) return;
    setIsEditing(true);
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(textRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 50);
  };

  const renderContent = () => (
    <Element
      ref={textRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} ${isEditing ? "outline-none ring-2 ring-blue-500/80 bg-blue-500/5 rounded px-1 min-w-[20px] transition-all relative z-10" : ""}`}
      dangerouslySetInnerHTML={{ __html: displayValue }}
    />
  );

  if (!canEdit) {
    return renderContent();
  }

  const isInline = ["span", "b", "strong", "i", "em"].includes(Element);
  const Wrapper = isInline ? Element : "div";

  return (
    <Wrapper className={`relative group/editable ${isInline ? "inline-block" : "inline-block w-full"}`}>
      {renderContent()}

      {/* Figma Selection Ring Overlay */}
      <span 
        className={`absolute -inset-1.5 border border-transparent group-hover/editable:border-blue-500/50 rounded-lg pointer-events-none transition-all duration-150 flex items-start justify-end ${
          isEditing ? "border-blue-500/80 ring-1 ring-blue-500/40" : ""
        }`}
        style={{ zIndex: 10 }}
      >
        {/* Figma Corner Handles */}
        {isEditing && (
          <>
            <span className="absolute top-0 left-0 w-1.5 h-1.5 bg-white border border-blue-500 rounded-sm -translate-x-1/2 -translate-y-1/2" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-white border border-blue-500 rounded-sm translate-x-1/2 -translate-y-1/2" />
            <span className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-white border border-blue-500 rounded-sm -translate-x-1/2 translate-y-1/2" />
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white border border-blue-500 rounded-sm translate-x-1/2 translate-y-1/2" />
          </>
        )}

        {/* Small Floating Figma edit button (shown only on hover, hidden when editing) */}
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="hidden group-hover/editable:flex items-center justify-center bg-blue-500 text-white rounded-full p-2 shadow-lg absolute -top-4 -right-4 pointer-events-auto hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all z-20 border border-white/20"
            title="Edit Text Inline"
            style={{ width: "30px", height: "30px" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </span>

      {/* Notion-like Floating formatting toolbar when editing */}
      {isEditing && (
        <div 
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-white/10 px-2 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5 z-[99999] text-xs text-white"
          onMouseDown={(e) => e.preventDefault()} // Prevent blurring text element
        >
          <button onClick={() => execCommand("bold")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Bold"><Bold className="w-4.5 h-4.5" /></button>
          <button onClick={() => execCommand("italic")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Italic"><Italic className="w-4.5 h-4.5" /></button>
          <button onClick={() => {
            const url = prompt("Enter URL Link:");
            if (url) execCommand("createLink", url);
          }} className="p-1 hover:bg-white/10 rounded transition-colors" title="Insert Link"><Link2 className="w-4.5 h-4.5" /></button>
          
          <button onClick={() => execCommand("insertUnorderedList")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Unordered List"><List className="w-4.5 h-4.5" /></button>
          <button onClick={() => execCommand("formatBlock", "h3")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Heading 3"><Heading3 className="w-4.5 h-4.5" /></button>
          <button onClick={() => execCommand("formatBlock", "p")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Paragraph"><Text className="w-4.5 h-4.5" /></button>

          <span className="w-[1px] h-4 bg-white/10 mx-1" />

          <button onClick={() => execCommand("undo")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Undo"><Undo2 className="w-4.5 h-4.5" /></button>
          <button onClick={() => execCommand("redo")} className="p-1 hover:bg-white/10 rounded transition-colors" title="Redo"><Redo2 className="w-4.5 h-4.5" /></button>
        </div>
      )}
    </Wrapper>
  );
};

// ---------------------------------------------------------------------------
// 2. EditableImage Component
// ---------------------------------------------------------------------------
export const EditableImage = ({
  keyName,
  fallback = "",
  pkgId = null,
  pkgField = null,
  offerId = null,
  offerField = null,
  className = "",
  alt = "Site image"
}) => {
  const { editMode, previewMode, siteContent, packages, offers, updateSiteContentDraft, updatePackageDraft, updateOfferDraft, adminRole } = useContext(CMSContext);
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const canEdit = editMode && !previewMode && adminRole !== "Viewer";

  let currentValue = fallback;
  if (pkgId && pkgField) {
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      const draftKey = `draft${pkgField.charAt(0).toUpperCase() + pkgField.slice(1)}`;
      currentValue = pkg[draftKey] !== null && pkg[draftKey] !== undefined ? pkg[draftKey] : pkg[pkgField];
    }
  } else if (offerId && offerField) {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      const draftKey = `draft${offerField.charAt(0).toUpperCase() + offerField.slice(1)}`;
      currentValue = offer[draftKey] !== null && offer[draftKey] !== undefined ? offer[draftKey] : offer[offerField];
    }
  } else if (keyName) {
    const siteObj = siteContent[keyName];
    if (siteObj) {
      currentValue = siteObj.draftValue !== null && siteObj.draftValue !== undefined ? siteObj.draftValue : siteObj.value;
    }
  }

  useEffect(() => {
    setImageUrl(currentValue || fallback);
  }, [currentValue, fallback]);

  const handleSave = (url = imageUrl) => {
    if (pkgId && pkgField) {
      updatePackageDraft(pkgId, { [pkgField]: url });
    } else if (offerId && offerField) {
      updateOfferDraft(offerId, { [offerField]: url });
    } else if (keyName) {
      updateSiteContentDraft(keyName, url);
    }
    setShowModal(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
      handleSave(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    if (window.confirm("Reset this image to fallback/empty?")) {
      handleSave("");
    }
  };

  if (!canEdit) {
    return <LazyImage src={currentValue || fallback} alt={alt} className={className} />;
  }

  return (
    <div 
      className="relative group/editable-img block w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LazyImage src={currentValue || fallback} alt={alt} className={`${className} transition-all group-hover/editable-img:brightness-95`} />

      {/* Figma style border highlight */}
      <div className={`absolute -inset-1 border border-transparent group-hover/editable-img:border-blue-500 rounded-lg pointer-events-none transition-all flex items-center justify-center ${isHovered ? "border-blue-500" : ""}`} />

      {/* Floating premium toolbar above image on hover */}
      {isHovered && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-2.5 z-20 text-white border border-white/10 animate-fade-in text-xs">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 hover:bg-white/10 px-2.5 py-1.5 rounded transition-colors font-bold cursor-pointer"
            title="Replace Image Asset"
          >
            <RefreshCw className="w-4.5 h-4.5" />
            Replace
          </button>
          
          <button
            onClick={() => {
              // Mock crop visualization filter toggle
              const canvas = document.createElement("canvas");
              alert("Launch simple visual visual editor tools (crop parameters saved to custom metadata).");
            }}
            className="flex items-center gap-1.5 hover:bg-white/10 px-2.5 py-1.5 rounded transition-colors font-bold cursor-pointer"
            title="Crop Image"
          >
            <Crop className="w-4.5 h-4.5" />
            Crop
          </button>

          <button
            onClick={() => window.open(currentValue || fallback, "_blank")}
            className="p-1.5 hover:bg-white/10 rounded transition-colors cursor-pointer flex items-center justify-center"
            title="Preview Asset"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={handleDeleteImage}
            className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer flex items-center justify-center"
            title="Delete/Reset Image"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {/* Upload/Replace Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] font-sans">
          <div className="bg-[#0b0f19] text-white p-6 rounded-[24px] shadow-2xl max-w-md w-full border border-white/10 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-base font-extrabold">Edit Image Asset</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Image Asset URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-950 border-white/10 text-xs focus:outline-none focus:border-cyan-500 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
              />
            </div>

            {imageUrl && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Preview Image</span>
                <img src={imageUrl} alt="Preview" className="max-h-36 rounded-xl w-full object-cover border border-white/5 bg-slate-950" />
              </div>
            )}

            <div className="flex justify-end gap-2.5 border-t border-white/5 pt-4 mt-1">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave()}
                className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                Apply Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. EditableCard Component
// ---------------------------------------------------------------------------
export const EditableCard = ({
  pkgId = null,
  offerId = null,
  children
}) => {
  const { editMode, previewMode, deletePackage, deleteOffer, adminRole } = useContext(CMSContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const canEdit = editMode && !previewMode && adminRole !== "Viewer";

  if (!canEdit) {
    return <>{children}</>;
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    if (pkgId) {
      deletePackage(pkgId);
    } else if (offerId) {
      deleteOffer(offerId);
    }
  };

  return (
    <div 
      className="relative group/editable-card w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Blue visual glow outlines */}
      <div className={`absolute -inset-1 border-2 border-transparent group-hover/editable-card:border-blue-500/40 rounded-[18px] pointer-events-none transition-all duration-200 flex items-start justify-end p-2 ${isHovered ? "border-blue-500/40" : ""}`} />

      {/* Floating delete button shown only on card hover */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-30 flex gap-2 pointer-events-auto">
          <button
            onClick={handleDeleteClick}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/10"
            title="Delete Content Card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fade-in font-sans">
          <div className="bg-[#0b0f19] border border-white/10 p-6 rounded-[28px] max-w-sm w-full text-white shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg">Remove Card?</h3>
            <p className="text-sm text-slate-400">Are you sure you want to delete this {pkgId ? "tour package" : "promo offer"}? This action will save a rollback state in Version History.</p>
            <div className="flex gap-3 mt-2 border-t border-white/5 pt-4">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Re-export X icon for inner modals
const X = ({ className, ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// kbs-frontend/src/pages/FaqManagement.jsx

import React, { useState, useEffect, useContext, useMemo } from "react";
import { CMSContext } from "../context/CMSContext";
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Move,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Check,
  HelpCircle,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import {
  fetchFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
  copyFAQs,
  validateFAQExcel,
  confirmFAQExcelImport
} from "../api";
import "./FaqManagement.css";

export default function FaqManagement() {
  const { packages } = useContext(CMSContext);

  // States
  const [destinations, setDestinations] = useState(["default", "global"]);
  const [selectedDest, setSelectedDest] = useState("default");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Copy from states
  const [copySource, setCopySource] = useState("");

  // Excel Import states
  const fileInputRef = React.useRef(null);
  const [importing, setImporting] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [currentFaq, setCurrentFaq] = useState(null); // FAQ being edited
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    displayOrder: 0,
    isActive: true
  });

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Extract unique destinations from existing packages catalog
  useEffect(() => {
    if (packages && packages.length > 0) {
      const destSet = new Set(["default", "global"]);
      packages.forEach(p => {
        if (p.destination) {
          destSet.add(p.destination.trim());
        }
      });
      setDestinations(Array.from(destSet));
    }
  }, [packages]);

  // Load FAQs for selected destination
  const loadFAQs = async () => {
    setLoading(true);
    try {
      // Fetch FAQs for the selected destination
      // Using query param version to list ALL FAQs (active and inactive) for admin management
      const data = await fetchFAQs();
      // Filter client-side by destination to manage ALL (active + inactive)
      const filtered = data.filter(
        faq => faq.destinationName.toLowerCase() === selectedDest.toLowerCase()
      );
      setFaqs(filtered.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error) {
      console.error("Failed to load FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, [selectedDest]);

  // Search Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faqs, searchQuery]);

  // Expand/Collapse toggling
  const toggleExpand = (id) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setModalType("add");
    setFormData({
      question: "",
      answer: "",
      displayOrder: faqs.length > 0 ? Math.max(...faqs.map(f => f.displayOrder)) + 1 : 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (faq) => {
    setModalType("edit");
    setCurrentFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
      isActive: faq.isActive
    });
    setIsModalOpen(true);
  };

  // Save Modal (Create/Edit)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        destinationName: selectedDest,
        question: formData.question,
        answer: formData.answer,
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive
      };

      if (modalType === "add") {
        await createFAQ(payload);
      } else {
        await updateFAQ(currentFaq.id, payload);
      }
      setIsModalOpen(false);
      loadFAQs();
    } catch (error) {
      alert("Error saving FAQ: " + error.message);
    }
  };

  // Toggle Active/Inactive status directly from dashboard
  const handleToggleActive = async (faq) => {
    try {
      await updateFAQ(faq.id, {
        isActive: !faq.isActive
      });
      loadFAQs();
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  // Delete FAQ
  const handleDelete = async (id) => {
    try {
      await deleteFAQ(id);
      setDeleteConfirmId(null);
      loadFAQs();
    } catch (error) {
      alert("Error deleting FAQ: " + error.message);
    }
  };

  // Duplicate FAQ
  const handleDuplicate = async (faq) => {
    try {
      const payload = {
        destinationName: selectedDest,
        question: `${faq.question} (Copy)`,
        answer: faq.answer,
        displayOrder: faq.displayOrder + 1,
        isActive: faq.isActive
      };
      await createFAQ(payload);
      loadFAQs();
    } catch (error) {
      alert("Error duplicating FAQ: " + error.message);
    }
  };

  // Copy from another destination
  const handleCopyFromDestination = async () => {
    if (!copySource) {
      alert("Please select a source destination to copy from.");
      return;
    }
    if (copySource.toLowerCase() === selectedDest.toLowerCase()) {
      alert("Source and target destinations cannot be the same.");
      return;
    }
    if (!window.confirm(`Are you sure you want to copy all FAQs from '${copySource}' to '${selectedDest}'?`)) {
      return;
    }
    setLoading(true);
    try {
      await copyFAQs(copySource, selectedDest);
      loadFAQs();
      setCopySource("");
      alert("FAQs copied successfully!");
    } catch (error) {
      alert("Failed to copy FAQs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Excel Import Handler
  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await validateFAQExcel(file);
      if (data.valid) {
        if (window.confirm(`Found ${data.preview_rows.length} valid FAQs. Confirm import?`)) {
          const res = await confirmFAQExcelImport({ preview_rows: data.preview_rows });
          alert(res.message);
          loadFAQs();
        }
      } else {
        alert("Excel Validation Failed:\n" + data.errors.join("\n"));
      }
    } catch (error) {
      alert("Error importing Excel: " + error.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Drag and drop sorting mechanics
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...faqs];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    // Re-assign display orders sequentially
    const updatedFaqs = reordered.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));

    setFaqs(updatedFaqs);
    setDraggedIndex(null);

    // Save order changes in backend
    try {
      const reorderPayload = updatedFaqs.map(item => ({
        id: item.id,
        displayOrder: item.displayOrder
      }));
      await reorderFAQs(reorderPayload);
    } catch (error) {
      console.error("Failed to save reordered FAQs:", error);
      loadFAQs(); // Reset on error
    }
  };

  return (
    <div className="faq-mgmt-page">
      <div className="faq-glass-panel">

        <div className="faq-header-row">
          <div>
            <h2 className="faq-header-title">Destination FAQ Management</h2>
            <p className="faq-header-subtitle">Create, edit, reorder and copy custom FAQs per destination package.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleExcelImport}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="faq-btn faq-btn-secondary"
              disabled={importing}
            >
              <FolderOpen size={16} /> {importing ? "Importing..." : "Import Excel"}
            </button>
            <button onClick={handleOpenAdd} className="faq-btn faq-btn-primary">
              <Plus size={16} /> Add FAQ Item
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="faq-filter-bar">

          {/* Destination Selector (searchable dropdown) */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#8e8e8e", textTransform: "uppercase" }}>Destination:</span>
            <div className="dest-select-wrapper">
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="dest-select"
              >
                {destinations.map(dest => (
                  <option key={dest} value={dest}>
                    {dest === "default" ? "⚙️ default" : dest === "global" ? "🌍 global" : `📍 ${dest}`}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={loadFAQs} className="action-icon-btn" title="Refresh list" style={{ color: "#ff8a3d" }}>
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Search Question Bar */}
          <div className="faq-search-box">
            <Search size={16} className="faq-search-icon" />
            <input
              type="text"
              placeholder="Search loaded questions/answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input"
            />
          </div>

        </div>

        {/* Copy-from layout */}
        <div className="faq-filter-bar" style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
          <div className="copy-faq-panel">
            <span className="copy-label">Copy FAQs From:</span>
            <select
              value={copySource}
              onChange={(e) => setCopySource(e.target.value)}
              className="dest-select"
              style={{ padding: "6px 30px 6px 12px", minWidth: "150px" }}
            >
              <option value="">-- Choose Source --</option>
              {destinations
                .filter(dest => dest.toLowerCase() !== selectedDest.toLowerCase())
                .map(dest => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
            </select>
            <button
              onClick={handleCopyFromDestination}
              className="faq-btn faq-btn-secondary"
              style={{ padding: "6px 14px", fontSize: "12px" }}
              disabled={!copySource}
            >
              <Copy size={12} /> Copy All
            </button>
          </div>
        </div>

      </div>

      {/* Accordion FAQ management listing */}
      <div className="faq-mgmt-list">
        {loading ? (
          <div className="faq-empty-state">
            <RefreshCw size={24} className="animate-spin" />
            <p className="faq-empty-title">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => {
            const isOpen = expandedFaqId === faq.id;
            const isDeleting = deleteConfirmId === faq.id;

            return (
              <div
                key={faq.id}
                className={`faq-item-card ${draggedIndex === index ? "dragging" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Header view */}
                <div className="faq-card-header" onClick={() => toggleExpand(faq.id)}>

                  <div className="faq-header-content">
                    {/* Drag Handle */}
                    <div
                      className="drag-handle"
                      onClick={(e) => e.stopPropagation()}
                      title="Drag to reorder"
                    >
                      <Move size={16} />
                    </div>

                    <span className="faq-question-text">{faq.question}</span>

                    {/* Active Toggle badge */}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(faq);
                      }}
                      className={`faq-status-badge cursor-pointer ${faq.isActive ? "status-active" : "status-inactive"}`}
                      title="Click to toggle status"
                    >
                      {faq.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions Column */}
                  <div className="faq-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="action-icon-btn"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(faq)}
                      className="action-icon-btn"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>

                    {isDeleting ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="faq-btn faq-btn-danger"
                          style={{ padding: "4px 8px", fontSize: "10px", borderRadius: "6px" }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="faq-btn faq-btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "10px", borderRadius: "6px" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(faq.id)}
                        className="action-icon-btn btn-delete"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    <div className="action-icon-btn" onClick={() => toggleExpand(faq.id)}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                </div>

                {/* Expanded Answer Content */}
                {isOpen && (
                  <div className="faq-card-body">
                    <div className="faq-answer-content">{faq.answer}</div>

                    <div className="faq-meta-info">
                      <span>Order Index: <strong>{faq.displayOrder}</strong></span>
                      <span>Created By: <strong>{faq.createdBy || "Admin"}</strong></span>
                      <span>Last Updated: <strong>{faq.updatedAt ? new Date(faq.updatedAt).toLocaleString() : "N/A"}</strong></span>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="faq-empty-state">
            <HelpCircle size={32} />
            <p className="faq-empty-title">No FAQs found</p>
            <p className="faq-empty-desc">
              {searchQuery
                ? "No items match your search filter."
                : `There are currently no FAQ items defined for '${selectedDest}'. Create one above or copy FAQs from another destination.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="faq-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="faq-modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="faq-modal-header">
              <h3 className="faq-modal-title">
                {modalType === "add" ? "Create New FAQ" : "Modify FAQ Item"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="action-icon-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="faq-modal-body">

                <div className="faq-form-group">
                  <label>Destination (Target)</label>
                  <input
                    type="text"
                    value={selectedDest}
                    disabled
                    className="faq-form-input"
                    style={{ opacity: 0.7, background: "#1e1e1e", cursor: "not-allowed" }}
                  />
                </div>

                <div className="faq-form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Is flight tickets included in package price?"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="faq-form-input"
                  />
                </div>

                <div className="faq-form-group">
                  <label>Answer</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a clear, helpful answer to this question..."
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="faq-form-textarea"
                  />
                </div>

                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>

                  <div className="faq-form-group" style={{ flex: 1 }}>
                    <label>Display Order</label>
                    <input
                      type="number"
                      required
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      className="faq-form-input"
                    />
                  </div>

                  <div className="faq-form-group" style={{ flex: 1, justifyContent: "flex-end", height: "100%" }}>
                    <label className="toggle-switch-label">
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </div>
                      Active Item
                    </label>
                  </div>

                </div>

              </div>

              <div className="faq-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="faq-btn faq-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="faq-btn faq-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
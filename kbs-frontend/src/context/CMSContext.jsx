import React, { createContext, useState, useEffect, useRef, useCallback } from "react";

export const CMSContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const CMSProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState("Viewer");
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [siteContent, setSiteContent] = useState({});
  const [packages, setPackages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [saveStatus, setSaveStatus] = useState("Idle"); // "Idle" | "Saving..." | "Saved ✓"
  const [historyList, setHistoryList] = useState([]);
  const [activeInspectorId, setActiveInspectorId] = useState(null);

  // Client-side Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const debounceTimers = useRef({});

  // Get Admin token/key
  const getApiKey = useCallback(() => {
    return localStorage.getItem("kbs_admin_key") || "";
  }, []);

  const getHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
      "X-Editor-Name": `Admin (${adminRole})`
    };
  }, [getApiKey, adminRole]);

  // Load auth state from local storage
  useEffect(() => {
    const key = localStorage.getItem("kbs_admin_key");
    const role = localStorage.getItem("kbs_admin_role");
    if (key && role) {
      setIsAdmin(true);
      setAdminRole(role);
      setEditMode(true);
    }
  }, []);

  // Fetch all site content and CMS states
  const fetchCMSData = useCallback(async () => {
    try {
      // General Site Content
      const contentRes = await fetch(`${API_BASE_URL}/api/cms/content`);
      if (contentRes.ok) {
        const contentList = await contentRes.json();
        const contentMap = {};
        contentList.forEach(item => {
          contentMap[item.key] = item;
        });
        setSiteContent(contentMap);
      }

      // Packages (including drafts)
      const pkgsRes = await fetch(`${API_BASE_URL}/api/packages?pageSize=100`);
      if (pkgsRes.ok) {
        const pkgsData = await pkgsRes.json();
        setPackages(pkgsData.items || []);
      }

      // Offers (including drafts)
      const offersRes = await fetch(`${API_BASE_URL}/api/offers`);
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData || []);
      }

      // Load History if authenticated
      if (localStorage.getItem("kbs_admin_key")) {
        const historyRes = await fetch(`${API_BASE_URL}/api/cms/history`, {
          headers: getHeaders()
        });
        if (historyRes.ok) {
          const hist = await historyRes.json();
          setHistoryList(hist);
        }
      }
    } catch (error) {
      console.error("Error loading CMS data:", error);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchCMSData();
  }, [fetchCMSData]);

  // Admin Login
  const login = async (key, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, role })
      });
      if (!res.ok) {
        throw new Error("Invalid admin key");
      }
      localStorage.setItem("kbs_admin_key", key);
      localStorage.setItem("kbs_admin_role", role);
      setIsAdmin(true);
      setAdminRole(role);
      setEditMode(true);
      fetchCMSData();
      return true;
    } catch (e) {
      alert("Authentication failed: Invalid key.");
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("kbs_admin_key");
    localStorage.removeItem("kbs_admin_role");
    setIsAdmin(false);
    setAdminRole("Viewer");
    setEditMode(false);
    setPreviewMode(false);
  };

  // Debounced auto-save triggers
  const triggerAutoSave = useCallback((callback) => {
    setSaveStatus("Saving...");
    // Local state updates instantly, server call is debounced
    const timerId = setTimeout(async () => {
      try {
        await callback();
        setSaveStatus("Saved ✓");
        setTimeout(() => setSaveStatus("Idle"), 2000);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("Idle");
      }
    }, 2000);
    return timerId;
  }, []);

  // Update Generic Site Content (Debounced)
  const updateSiteContentDraft = useCallback((key, newTextValue) => {
    // 1. Instant React State Update
    setSiteContent(prev => {
      const existing = prev[key] || { key, value: "", draftValue: "" };
      const updated = { ...existing, draftValue: newTextValue };
      
      // Save client side history for undo
      setUndoStack(u => [...u, { type: "site_content", key, oldValue: existing.draftValue || existing.value, newValue: newTextValue }]);
      setRedoStack([]);

      return { ...prev, [key]: updated };
    });

    // 2. Debounce Save to DB
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }

    debounceTimers.current[key] = triggerAutoSave(async () => {
      await fetch(`${API_BASE_URL}/api/cms/content`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ key, draftValue: newTextValue })
      });
    });
  }, [getHeaders, triggerAutoSave]);

  // Update Package Draft (Debounced or Immediate)
  const updatePackageDraft = useCallback((pkgId, fields) => {
    // Update local React state instantly
    setPackages(prev => {
      return prev.map(p => {
        if (p.id === pkgId) {
          const updatedPkg = { ...p, hasDraft: true };
          Object.keys(fields).forEach(k => {
            const draftKey = `draft${k.charAt(0).toUpperCase() + k.slice(1)}`;
            updatedPkg[draftKey] = fields[k];
          });
          return updatedPkg;
        }
        return p;
      });
    });

    const key = `pkg_${pkgId}`;
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }

    debounceTimers.current[key] = triggerAutoSave(async () => {
      await fetch(`${API_BASE_URL}/api/cms/packages/${pkgId}/draft`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
    });
  }, [getHeaders, triggerAutoSave]);

  // Update Offer Draft (Debounced or Immediate)
  const updateOfferDraft = useCallback((offerId, fields) => {
    setOffers(prev => {
      return prev.map(o => {
        if (o.id === offerId) {
          const updatedOffer = { ...o, hasDraft: true };
          Object.keys(fields).forEach(k => {
            const draftKey = `draft${k.charAt(0).toUpperCase() + k.slice(1)}`;
            updatedOffer[draftKey] = fields[k];
          });
          return updatedOffer;
        }
        return o;
      });
    });

    const key = `offer_${offerId}`;
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }

    debounceTimers.current[key] = triggerAutoSave(async () => {
      await fetch(`${API_BASE_URL}/api/cms/offers/${offerId}/draft`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(fields)
      });
    });
  }, [getHeaders, triggerAutoSave]);

  // Add Package
  const addPackage = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/packages/new`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        const newPkg = await res.json();
        setPackages(prev => [newPkg, ...prev]);
        fetchCMSData();
      }
    } catch (err) {
      console.error("Failed to add package:", err);
    }
  };

  // Delete Package
  const deletePackage = async (pkgId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/packages/${pkgId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setPackages(prev => prev.filter(p => p.id !== pkgId));
      }
    } catch (err) {
      console.error("Failed to delete package:", err);
    }
  };

  // Add Offer
  const addOffer = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/offers/new`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        const newOffer = await res.json();
        setOffers(prev => [...prev, newOffer]);
        fetchCMSData();
      }
    } catch (err) {
      console.error("Failed to add offer:", err);
    }
  };

  // Delete Offer
  const deleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/offers/${offerId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.id !== offerId));
      }
    } catch (err) {
      console.error("Failed to delete offer:", err);
    }
  };

  // Publish workflow
  const publishAll = async () => {
    setSaveStatus("Saving...");
    try {
      // 1. Publish site contents
      await fetch(`${API_BASE_URL}/api/cms/content/publish`, {
        method: "POST",
        headers: getHeaders()
      });

      // 2. Publish all packages that have drafts
      const pkgPublishPromises = packages
        .filter(p => p.hasDraft || !p.isPublished)
        .map(p =>
          fetch(`${API_BASE_URL}/api/cms/packages/${p.id}/publish`, {
            method: "POST",
            headers: getHeaders()
          })
        );
      await Promise.all(pkgPublishPromises);

      // 3. Publish all offers that have drafts
      const offerPublishPromises = offers
        .filter(o => o.hasDraft || !o.isPublished)
        .map(o =>
          fetch(`${API_BASE_URL}/api/cms/offers/${o.id}/publish`, {
            method: "POST",
            headers: getHeaders()
          })
        );
      await Promise.all(offerPublishPromises);

      setSaveStatus("Saved ✓");
      setTimeout(() => setSaveStatus("Idle"), 2000);
      fetchCMSData();
      alert("Successfully published all drafts to the live website!");
    } catch (err) {
      console.error("Failed to publish content:", err);
      setSaveStatus("Idle");
    }
  };

  // Restore history item
  const restoreHistory = async (historyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cms/history/restore?history_id=${historyId}`, {
        method: "POST",
        headers: getHeaders()
      });
      if (res.ok) {
        alert("Restored version successfully!");
        fetchCMSData();
      } else {
        alert("Failed to restore history.");
      }
    } catch (err) {
      console.error("Error restoring history:", err);
    }
  };

  // Client-side Undo
  const undo = () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, action]);

    if (action.type === "site_content") {
      updateSiteContentDraft(action.key, action.oldValue);
    }
  };

  // Client-side Redo
  const redo = () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, action]);

    if (action.type === "site_content") {
      updateSiteContentDraft(action.key, action.newValue);
    }
  };

  return (
    <CMSContext.Provider
      value={{
        isAdmin,
        adminRole,
        editMode,
        setEditMode,
        previewMode,
        setPreviewMode,
        siteContent,
        packages,
        offers,
        saveStatus,
        historyList,
        login,
        logout,
        updateSiteContentDraft,
        updatePackageDraft,
        updateOfferDraft,
        addPackage,
        deletePackage,
        addOffer,
        deleteOffer,
        publishAll,
        restoreHistory,
        undo,
        redo,
        hasUndo: undoStack.length > 0,
        hasRedo: redoStack.length > 0,
        activeInspectorId,
        setActiveInspectorId
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

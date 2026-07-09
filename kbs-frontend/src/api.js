const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchPackages() {
  // pageSize=100 is a temporary shortcut so all packages load at once and
  // your existing client-side filtering keeps working unchanged. Once the
  // catalog grows large, this is the point where filtering would move
  // server-side instead (the API already supports it).
  const res = await fetch(`${API_BASE_URL}/api/packages?pageSize=100`);
  if (!res.ok) throw new Error("Failed to load packages");
  return res.json(); // { items, total, page, pageSize, totalPages }
}

export async function fetchOffers() {
  const res = await fetch(`${API_BASE_URL}/api/offers`);
  if (!res.ok) throw new Error("Failed to load offers");
  return res.json();
}

export async function submitEnquiry(payload) {
  const res = await fetch(`${API_BASE_URL}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit enquiry");
  return res.json();
}

export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_BASE_URL}/api/subscribers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}

export async function validateExcel(file) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/cms/excel/validate`, {
    method: "POST",
    headers: {
      "X-API-Key": key,
    },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Validation failed");
  }
  return res.json();
}

export async function confirmExcelImport(payload) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const role = localStorage.getItem("kbs_admin_role") || "Admin";
  const res = await fetch(`${API_BASE_URL}/api/cms/excel/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "X-Editor-Name": `Admin (${role})`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Confirmation failed");
  return res.json();
}

export async function fetchImportHistory() {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const res = await fetch(`${API_BASE_URL}/api/cms/excel/history`, {
    method: "GET",
    headers: {
      "X-API-Key": key,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function downloadFailedExcel(importId) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const res = await fetch(`${API_BASE_URL}/api/cms/excel/history/${importId}/failed-excel`, {
    method: "GET",
    headers: {
      "X-API-Key": key,
    },
  });
  if (!res.ok) throw new Error("Failed to download Excel file");
  return res.blob();
}

// ---------------------------------------------------------------------------
// FAQs API Helpers
// ---------------------------------------------------------------------------
export async function fetchFAQs(destination = "") {
  const url = destination 
    ? `${API_BASE_URL}/api/faqs/${encodeURIComponent(destination)}`
    : `${API_BASE_URL}/api/faqs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch FAQs");
  return res.json();
}

export async function createFAQ(payload) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const role = localStorage.getItem("kbs_admin_role") || "Admin";
  const res = await fetch(`${API_BASE_URL}/api/faqs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "X-Editor-Name": `Admin (${role})`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to create FAQ");
  return res.json();
}

export async function updateFAQ(faqId, payload) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const role = localStorage.getItem("kbs_admin_role") || "Admin";
  const res = await fetch(`${API_BASE_URL}/api/faqs/${faqId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "X-Editor-Name": `Admin (${role})`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update FAQ");
  return res.json();
}

export async function deleteFAQ(faqId) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const res = await fetch(`${API_BASE_URL}/api/faqs/${faqId}`, {
    method: "DELETE",
    headers: {
      "X-API-Key": key
    }
  });
  if (!res.ok) throw new Error("Failed to delete FAQ");
  return res.json();
}

export async function reorderFAQs(items) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const res = await fetch(`${API_BASE_URL}/api/faqs/reorder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key
    },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error("Failed to reorder FAQs");
  return res.json();
}

export async function copyFAQs(fromDestination, toDestination) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const role = localStorage.getItem("kbs_admin_role") || "Admin";
  const res = await fetch(`${API_BASE_URL}/api/faqs/copy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "X-Editor-Name": `Admin (${role})`
    },
    body: JSON.stringify({ fromDestination, toDestination })
  });
  if (!res.ok) throw new Error("Failed to copy FAQs");
  return res.json();
}

export async function validateFAQExcel(file) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/faqs/excel/validate`, {
    method: "POST",
    headers: {
      "X-API-Key": key
    },
    body: formData
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Validation failed");
  }
  return res.json();
}

export async function confirmFAQExcelImport(payload) {
  const key = localStorage.getItem("kbs_admin_key") || "";
  const role = localStorage.getItem("kbs_admin_role") || "Admin";
  const res = await fetch(`${API_BASE_URL}/api/faqs/excel/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
      "X-Editor-Name": `Admin (${role})`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("FAQ Import confirmation failed");
  return res.json();
}
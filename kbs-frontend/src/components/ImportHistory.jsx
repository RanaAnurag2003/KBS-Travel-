import React, { useState, useEffect } from "react";
import { History, Calendar, User, FileSpreadsheet, AlertTriangle, Download, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { fetchImportHistory, downloadFailedExcel } from "../api";

export default function ImportHistory({ refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchImportHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load import history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const handleDownloadFailed = async (importId, fileName) => {
    try {
      const blob = await downloadFailedExcel(importId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `failed_rows_${importId}_${fileName || 'import.xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download failed rows: " + err.message);
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="stitched-panel history-card-panel" style={{ color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      <div className="history-metallic-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <History style={{ color: "#111827" }} className={loading ? "animate-spin" : ""} />
          <h3>Import Log History</h3>
        </div>
        <button onClick={loadHistory} disabled={loading} style={{
          background: "rgba(17, 24, 39, 0.15)",
          border: "1px solid rgba(17, 24, 39, 0.25)",
          color: "#111827",
          padding: "6px 12px",
          borderRadius: "8px",
          fontSize: "11px",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          {loading ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh Logs"
          )}
        </button>
      </div>

      <div className="history-card-content" style={{ minHeight: "100px", position: "relative" }}>

      {loading && history.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
          <RefreshCw size={24} className="animate-spin" style={{ color: "#38bdf8" }} />
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: "32px 0", fontSize: "13px" }}>
          No Excel bulk imports recorded yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <th style={{ padding: "12px" }}>File Name</th>
                <th style={{ padding: "12px" }}>Uploaded By</th>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Stats</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <React.Fragment key={item.id}>
                  <tr style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                    background: expandedRow === item.id ? "rgba(255, 255, 255, 0.02)" : "transparent"
                  }}>
                    <td style={{ padding: "14px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                        <FileSpreadsheet size={15} style={{ color: "#38bdf8" }} />
                        {item.file_name}
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", color: "#cbd5e1" }}>{item.uploaded_by}</td>
                    <td style={{ padding: "14px 12px", color: "#64748b" }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        background: item.status === "success" 
                          ? "rgba(16, 185, 129, 0.15)" 
                          : item.status === "partial_success" 
                            ? "rgba(245, 158, 11, 0.15)" 
                            : "rgba(239, 68, 68, 0.15)",
                        color: item.status === "success" 
                          ? "#34d399" 
                          : item.status === "partial_success" 
                            ? "#fbbf24" 
                            : "#f87171"
                      }}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px", color: "#94a3b8" }}>
                      {item.imported} imports, {item.updated} updates, {item.failed} failed
                    </td>
                    <td style={{ padding: "14px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        {item.failed > 0 && (
                          <button
                            onClick={() => handleDownloadFailed(item.id, item.file_name)}
                            title="Download failed rows Excel sheet"
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              color: "#f87171",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "10px",
                              fontWeight: 700
                            }}
                          >
                            <Download size={12} /> Errors
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpandRow(item.id)}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "none",
                            color: "#cbd5e1",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          {expandedRow === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Transaction Log Details */}
                  {expandedRow === item.id && (
                    <tr style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                      <td colSpan={6} style={{ padding: "16px 20px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
                          Transaction Audit Logs
                        </h4>
                        <div style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "10px",
                          padding: "12px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          color: "#94a3b8",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px"
                        }}>
                          {item.logs && item.logs.length > 0 ? (
                            item.logs.map((log, lIdx) => (
                              <div key={lIdx} style={{
                                borderLeft: log.includes("Failed") ? "3px solid #ef4444" : "3px solid #10b981",
                                paddingLeft: "8px"
                              }}>
                                {log}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "#475569" }}>No log entries recorded.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}

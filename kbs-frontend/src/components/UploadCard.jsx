import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, RefreshCw, Play, X, Trash2 } from "lucide-react";
import { validateExcel, confirmExcelImport, downloadFailedExcel } from "../api";

import passportPen from "../assets/passport_pen.webp";

export default function UploadCard({ onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Validation stages: "idle" | "validated" | "success" | "partial_success" | "failed"
  const [stage, setStage] = useState("idle");
  const [valResults, setValResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [importStats, setImportStats] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls")) {
        handleFileSelect(droppedFile);
      } else {
        setErrorMsg("Please upload a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setErrorMsg("");
    setLoading(true);
    setStage("idle");
    setValResults(null);
    setImportStats(null);

    try {
      const data = await validateExcel(selectedFile);
      setValResults(data);
      setStage("validated");
    } catch (err) {
      setErrorMsg(err.message || "Failed to validate Excel file.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!valResults) return;
    setLoading(true);

    try {
      const payload = {
        preview_rows: valResults.preview_rows,
        failed_rows: valResults.failed_rows_json,
        file_name: file.name
      };
      const res = await confirmExcelImport(payload);
      setImportStats(res);
      setStage(res.status);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to confirm Excel import.");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleReset = () => {
    setFile(null);
    setValResults(null);
    setErrorMsg("");
    setStage("idle");
    setImportStats(null);
  };

  return (
    <div className="stitched-panel upload-card-panel" style={{ padding: "28px", color: "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", position: "relative" }}>
        <div style={{ paddingRight: "100px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, background: "linear-gradient(135deg, #38bdf8, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Excel Bulk Import
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
            Import and update holiday package listings using an Excel spreadsheet.
          </p>
        </div>
        <div style={{ width: "70px", height: "70px", borderRadius: "12px", overflow: "hidden", background: "#ffffff", position: "absolute", top: "-20px", right: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}>
          <img src={passportPen} alt="Passport & Pen" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      {file && (
          <button onClick={handleReset} style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#f87171",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s",
            position: "relative",
            zIndex: 10
          }}>
            <Trash2 size={13} /> Clear Upload
          </button>
        )}

      {/* Loading state */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <RefreshCw size={40} className="animate-spin" style={{ color: "#38bdf8", marginBottom: "16px" }} />
          <p style={{ fontSize: "14px", fontWeight: 700 }}>Processing spreadsheet...</p>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Parsing rows and validating columns</p>
        </div>
      )}

      {/* Upload Dropzone */}
      {!file && !loading && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          style={{
            border: dragActive ? "2px dashed #38bdf8" : "2px dashed rgba(255, 255, 255, 0.1)",
            background: dragActive ? "rgba(56, 189, 248, 0.05)" : "rgba(15, 23, 42, 0.3)",
            borderRadius: "16px",
            padding: "48px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.25s",
            boxSizing: "border-box"
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
          <UploadCloud size={48} style={{ color: dragActive ? "#38bdf8" : "#64748b", marginBottom: "16px" }} />
          <p style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>
            Drag & drop your Excel file here, or <span style={{ color: "#38bdf8", textDecoration: "underline" }}>browse</span>
          </p>
          <p style={{ fontSize: "11px", color: "#64748b" }}>
            Supports standard Excel files (.xlsx, .xls). First row must be headers.
          </p>
          {errorMsg && (
            <div style={{ marginTop: "16px", padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", borderRadius: "8px", color: "#f87171", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={14} /> {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Validation Report & Preview */}
      {file && !loading && stage === "validated" && valResults && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Summary Banner */}
          <div style={{
            background: valResults.valid ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
            border: valResults.valid ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {valResults.valid ? (
                <CheckCircle2 size={24} style={{ color: "#10b981" }} />
              ) : (
                <AlertTriangle size={24} style={{ color: "#f59e0b" }} />
              )}
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: valResults.valid ? "#34d399" : "#fbbf24" }}>
                  {valResults.valid ? "Validation Successful" : "Validation Complete (with errors)"}
                </p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                  File: {file.name} ({valResults.total_rows} rows found)
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", fontSize: "12px", fontWeight: 700 }}>
              <span style={{ color: "#34d399" }}>{valResults.preview_rows.length} valid</span>
              {!valResults.valid && <span style={{ color: "#f87171" }}>{valResults.failed_rows_json.length} invalid</span>}
            </div>
          </div>

          {/* Validation Warnings/Errors list */}
          {!valResults.valid && (
            <div style={{
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              borderRadius: "12px",
              padding: "16px",
              maxHeight: "150px",
              overflowY: "auto"
            }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#f87171", fontWeight: 800 }}>Validation Errors</h4>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "6px" }}>
                {valResults.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Table Preview */}
          {valResults.preview_rows.length > 0 && (
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: 700, color: "#94a3b8" }}>Parsed Preview (First 5 Rows)</h4>
              <div style={{ overflowX: "auto", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <th style={{ padding: "10px 12px", color: "#64748b" }}>Action</th>
                      <th style={{ padding: "10px 12px", color: "#64748b" }}>Title</th>
                      <th style={{ padding: "10px 12px", color: "#64748b" }}>Destination</th>
                      <th style={{ padding: "10px 12px", color: "#64748b" }}>Price</th>
                      <th style={{ padding: "10px 12px", color: "#64748b" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valResults.preview_rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "9px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            background: row.action === "insert" ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)",
                            color: row.action === "insert" ? "#34d399" : "#60a5fa"
                          }}>
                            {row.action}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 700 }}>{row.title}</td>
                        <td style={{ padding: "10px 12px" }}>{row.destination}</td>
                        <td style={{ padding: "10px 12px", color: "#38bdf8" }}>₹{row.price}</td>
                        <td style={{ padding: "10px 12px" }}>{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Confirm Button & Options */}
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              onClick={handleConfirmImport}
              disabled={valResults.preview_rows.length === 0}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                padding: "12px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: valResults.preview_rows.length === 0 ? "not-allowed" : "pointer",
                opacity: valResults.preview_rows.length === 0 ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
                transition: "all 0.2s"
              }}
            >
              <Play size={15} /> Confirm & Import {valResults.preview_rows.length} Packages
            </button>
            <button onClick={handleReset} style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              color: "#94a3b8",
              padding: "12px 20px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Post-Import Status Result */}
      {file && !loading && stage !== "idle" && stage !== "validated" && importStats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "center", padding: "10px 0" }}>
          <div style={{ display: "inline-flex", alignSelf: "center", padding: "16px", borderRadius: "50%", background: stage === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", color: stage === "success" ? "#10b981" : "#f59e0b" }}>
            {stage === "success" ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: stage === "success" ? "#34d399" : "#fbbf24" }}>
              {stage === "success" ? "Import Success" : "Import Completed with failures"}
            </h4>
            <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#94a3b8" }}>
              Bulk transaction successfully completed. Database has been updated.
            </p>
          </div>

          {/* Status Breakdown Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", maxWidth: "400px", margin: "0 auto", width: "100%" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "10px", padding: "12px" }}>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: "#34d399" }}>{importStats.imported}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Imported</p>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "10px", padding: "12px" }}>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: "#60a5fa" }}>{importStats.updated}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Updated</p>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "10px", padding: "12px" }}>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: 900, color: "#f87171" }}>{importStats.failed}</p>
              <p style={{ margin: "2px 0 0 0", fontSize: "10px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Failed</p>
            </div>
          </div>

          {/* Action links */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "10px" }}>
            <button onClick={handleReset} style={{
              background: "linear-gradient(135deg, #334155, #1e293b)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "10px",
              color: "#fff",
              padding: "10px 20px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecruitmentFormTitle, isDepartmentField, isYearField } from "@/app/lib/recruitment";
import {
  FaWhatsapp,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaFilePdf,
  FaUpload,
  FaTrash,
  FaEye,
  FaSpinner,
  FaDownload,
  FaPhoneAlt,
  FaUserTie,
} from "react-icons/fa";

const defaultFormState = {};

function formatBytes(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "";
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function PdfUploadField({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileData = typeof value === "object" && value !== null ? value : null;
  const fileUrl = fileData?.url || (typeof value === "string" ? value : "");
  const fileName = fileData?.filename || fileData?.name || (fileUrl ? "Uploaded Resume.pdf" : "");
  const fileSize = fileData?.size ? formatBytes(fileData.size) : "";

  const handleFileUpload = async (file) => {
    if (!file) return;

    const originalName = file.name || "";
    const isPdf =
      (file.type || "").toLowerCase().includes("pdf") ||
      originalName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setUploadError("Only PDF documents (.pdf) are allowed.");
      return;
    }

    if (file.size > 500 * 1024) {
      setUploadError("File size exceeds 500 KB limit. Please upload a PDF under 500 KB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/recruitment/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setUploadError(result.message || "Failed to upload file.");
        return;
      }

      onChange({
        fileId: result.fileId,
        filename: result.filename,
        url: result.url,
        size: result.size,
      });
    } catch (err) {
      console.error("PDF upload error:", err);
      setUploadError("An error occurred while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (fileUrl) {
    return (
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 font-mono">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
              <FaFilePdf className="text-xl" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-xs block" title={fileName}>
                  {fileName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase font-semibold">
                  Uploaded
                </span>
              </div>
              {fileSize && (
                <span className="text-[11px] text-gray-400 block mt-0.5">{fileSize}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded border border-white/20 bg-white/5 hover:bg-white/10 text-gray-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Preview PDF in new tab"
            >
              <FaEye className="text-xs" />
              <span>Preview</span>
            </a>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 rounded border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Remove or replace this file"
            >
              <FaTrash className="text-xs" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          isDragOver
            ? "border-emerald-400 bg-emerald-950/20"
            : "border-white/20 bg-black/40 hover:border-white/40 hover:bg-white/5"
        }`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="sr-only"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-center py-2">
            <FaSpinner className="text-2xl text-white animate-spin" />
            <span className="font-mono text-xs text-gray-300">Uploading PDF document...</span>
            <span className="font-mono text-[10px] text-gray-500">Please wait while the file is saved</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 group-hover:text-white">
              <FaFilePdf className="text-2xl text-rose-400" />
            </div>
            <div>
              <p className="font-mono text-xs sm:text-sm font-semibold text-white">
                <span className="text-emerald-400 underline underline-offset-4">Click to upload</span> or drag &amp; drop PDF
              </p>
              <p className="font-mono text-xs text-gray-300 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                <span>PDF format only</span>
                <span className="text-gray-500">•</span>
                <span className="px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
                  Max file size: 500 KB
                </span>
              </p>
            </div>
          </div>
        )}
      </label>

      {uploadError && (
        <p className="font-mono text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded p-2">
          {uploadError}
        </p>
      )}
    </div>
  );
}

function renderFieldInput(field, value, onChange) {
  const commonClassName =
    "w-full rounded-lg border border-white/20 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-gray-500 focus:border-white focus:outline-none transition-colors";

  if (field.type === "file" || field.type === "pdf") {
    return <PdfUploadField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className={commonClassName}
        placeholder={field.label}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={commonClassName}
      >
        <option value="" className="bg-black text-gray-400">Select an option</option>
        {(field.options || []).map((option) => (
          <option key={option} value={option} className="bg-black text-white">
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="space-y-2">
        {(field.options || []).map((option) => (
          <label key={option} className="flex items-center gap-2 font-mono text-sm text-gray-200 cursor-pointer">
            <input
              type="radio"
              name={field.name}
              checked={String(value || "") === String(option)}
              onChange={() => onChange(option)}
              className="accent-white cursor-pointer"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 font-mono text-sm text-gray-200 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-white cursor-pointer"
        />
        <span>{field.label}</span>
      </label>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={commonClassName}
      placeholder={field.label}
    />
  );
}

export default function RecruitmentPage() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);
  const [formValues, setFormValues] = useState(defaultFormState);
  const [departments, setDepartments] = useState([]);
  const [year, setYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Registration success state for showing anti-copy WhatsApp group invite
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedDept, setSubmittedDept] = useState("");
  const [submittedYear, setSubmittedYear] = useState("");
  const [whatsappGroupLink, setWhatsappGroupLink] = useState(
    process.env.NEXT_PUBLIC_RECRUITMENT_WHATSAPP_LINK || ""
  );

  const handleJoinWhatsApp = (e) => {
    e.preventDefault();
    try {
      // Dynamic WhatsApp invite link from env / API without exposing raw plaintext in DOM
      const targetUrl =
        whatsappGroupLink ||
        selectedForm?.whatsappLink ||
        process.env.NEXT_PUBLIC_RECRUITMENT_WHATSAPP_LINK ||
        "https://chat.whatsapp.com/FoMYMW3X0DnK4EpoeSO9Em?s=sw&p=a&mlu=4&ilr=4";

      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Open WhatsApp error:", err);
    }
  };

  useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch("/api/recruitment", {
          cache: "no-store",
          headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
        });
        const result = await response.json();

        if (result.success) {
          setForms(result.data || []);
          if (result.data?.length) {
            const firstForm = result.data[0];
            setSelectedFormId(firstForm._id);
            setSelectedForm(firstForm);
            setDepartments([]);
            setYear("");
            if (firstForm.whatsappLink) {
              setWhatsappGroupLink(firstForm.whatsappLink);
            }
          }
        }
      } catch (error) {
        console.error("Fetch recruitment forms error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchForms();
  }, []);

  const formOptions = useMemo(() => {
    return (selectedForm?.departments || []).map((item) => ({ label: item, value: item }));
  }, [selectedForm]);

  const allowedYears = useMemo(() => {
    return Array.isArray(selectedForm?.years) && selectedForm.years.length
      ? selectedForm.years
      : ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  }, [selectedForm]);

  const yearOptions = useMemo(() => {
    return allowedYears.map((item) => ({ label: item, value: item }));
  }, [allowedYears]);

  useEffect(() => {
    if (!selectedForm) return;
    setDepartments([]);
    setYear("");
    setFormValues({});
  }, [selectedForm]);

  const handleFieldChange = (fieldName, value) => {
    setFormValues((previous) => ({
      ...previous,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedForm) return;

    if (!departments || departments.length === 0) {
      setMessage("Please select at least one department.");
      return;
    }

    if (departments.length > 2) {
      setMessage("You can select a maximum of 2 departments.");
      return;
    }

    if (!year) {
      setMessage("Year of study is a mandatory field. Please select your year of study.");
      return;
    }

    const allowedYears = Array.isArray(selectedForm.years) && selectedForm.years.length
      ? selectedForm.years
      : ["1st Year", "2nd Year", "3rd Year", "4th Year"];

    if (!allowedYears.includes(year)) {
      setMessage(`Year "${year}" is not eligible for this recruitment. Allowed years: ${allowedYears.join(", ")}`);
      return;
    }

    for (const field of selectedForm.fields || []) {
      if (field.type === "file" || field.type === "pdf") {
        if (field.required) {
          const val = formValues[field.name];
          const hasVal = val && (typeof val === "object" ? Boolean(val.url || val.fileId) : Boolean(String(val).trim()));
          if (!hasVal) {
            setMessage(`Please upload your ${field.label || "Resume / PDF file"}.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/recruitment/${selectedForm._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departments,
          year,
          responses: {
            ...formValues,
            year,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage(result.message || "Failed to submit application.");
        return;
      }

      setSubmittedSuccess(true);
      setSubmittedDept(result.department || departments.join(" & "));
      setSubmittedYear(result.year || year);
      if (result.whatsappLink) {
        setWhatsappGroupLink(result.whatsappLink);
      }
      setMessage("Application submitted successfully.");
      setFormValues({});
      setDepartments([]);
      setYear("");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Submit recruitment application error:", error);
      setMessage("Something went wrong while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-mono text-gray-300">Loading recruitment forms...</p>
      </div>
    );
  }

  if (!forms.length) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-32 flex items-center justify-center">
        <div className="glass-panel max-w-2xl w-full p-8 text-center border border-white/20">
          <p className="font-mono text-xs uppercase tracking-widest text-gray-400 mb-3">[ RECRUITMENT STATUS ]</p>
          <h1
            className="text-3xl md:text-5xl font-black mb-4 uppercase text-white title-glow tracking-tighter"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            Recruitment Closed
          </h1>
          <p className="font-mono text-gray-300 leading-relaxed text-sm md:text-base">
            No active recruitment forms are currently open. Please check back later or contact the club for updates.
          </p>
        </div>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="min-h-[100dvh] bg-black text-white px-3 sm:px-6 pt-16 sm:pt-20 pb-4 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {/* Header Section */}
          <div className="flex flex-col items-center justify-center text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <FaCheckCircle className="text-sm text-emerald-400" />
              <span>Application Submitted</span>
            </div>
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider mt-1"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              Application Received!
            </h2>
            <p className="font-mono text-gray-300 text-xs sm:text-sm max-w-md mx-auto leading-tight">
              Your application for <strong className="text-white">{submittedDept || "Robotics Club"}</strong> {submittedYear ? `(${submittedYear})` : ""} has been submitted.
            </p>
          </div>

          {/* Action Cards Grid - 2 columns on laptop/desktop, 1 column on phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch relative z-20">
            {/* WhatsApp Group Card */}
            <div
              className="p-4 sm:p-5 rounded-xl border border-emerald-500/50 bg-[#0c120e] flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden"
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <FaWhatsapp className="text-xl sm:text-2xl text-emerald-400 shrink-0" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Official WhatsApp Group
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shrink-0">
                    MANDATORY JOIN
                  </span>
                </div>

                <p className="font-mono text-[11px] sm:text-xs text-gray-200 leading-snug mb-2.5">
                  All interview slots, schedule updates, assignment tasks, and announcements will be shared exclusively inside the official applicants WhatsApp group.
                </p>

                <div className="p-2 sm:p-2.5 rounded-lg bg-black/80 border border-white/15 flex items-center gap-2 text-gray-300 font-mono text-[10px] sm:text-[11px] leading-tight mb-3">
                  <FaShieldAlt className="text-amber-400 text-xs shrink-0" />
                  <span>Security protocol: Direct link for applicants only. Forwarding disabled.</span>
                </div>
              </div>

              {/* Anti-copy WhatsApp Button */}
              <button
                type="button"
                onClick={handleJoinWhatsApp}
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                className="w-full py-2.5 sm:py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] cursor-pointer select-none active:scale-[0.98]"
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                <FaWhatsapp className="text-xl text-black shrink-0" />
                <span>[ JOIN WHATSAPP GROUP ]</span>
                <FaArrowRight className="text-xs shrink-0" />
              </button>
            </div>

            {/* Interview Syllabus Download Card */}
            <div className="p-4 sm:p-5 rounded-xl border border-cyan-500/40 bg-[#0d1117] flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-cyan-500/30 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <FaFilePdf className="text-lg sm:text-xl text-rose-400 shrink-0" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      Interview Syllabus
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                    PDF DOWNLOADS
                  </span>
                </div>

                <p className="font-mono text-[11px] sm:text-xs text-gray-200 leading-snug mb-3">
                  Please download the interview syllabus according to your team and year of study to prepare for the upcoming recruitment process:
                </p>
              </div>

              {/* 3 Download Buttons - Solid, Sharp, High Contrast */}
              <div className="flex flex-col gap-2">
                <a
                  href="/recruitment_docs/1st year.pdf"
                  download="1st_Year_Tech_Team_Syllabus.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#141b24] hover:bg-[#1a2432] border border-cyan-500/50 hover:border-cyan-300 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-md hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2.5">
                    <FaDownload className="text-xs text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="text-white font-semibold">1st Year Tech Team Syllabus</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 shrink-0">
                    PDF
                  </span>
                </a>

                <a
                  href="/recruitment_docs/2nd years.pdf"
                  download="2nd_Year_Tech_Team_Syllabus.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#141b24] hover:bg-[#1a2432] border border-cyan-500/50 hover:border-cyan-300 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-md hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2.5">
                    <FaDownload className="text-xs text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="text-white font-semibold">2nd Year Tech Team Syllabus</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 shrink-0">
                    PDF
                  </span>
                </a>

                <a
                  href="/recruitment_docs/PR_syllabus_1st,2nd,3rd year.pdf"
                  download="PR_syllabus_1st,2nd,3rd year.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#1b1424] hover:bg-[#251a32] border border-fuchsia-500/50 hover:border-fuchsia-300 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-md hover:shadow-[0_0_15px_rgba(217,70,239,0.3)] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2.5">
                    <FaDownload className="text-xs text-fuchsia-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="text-white font-semibold">PR Syllabus (1st, 2nd, 3rd) Year</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-500/40 shrink-0">
                    PDF
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* POC Contacts Bar on Submission Success */}
          {Array.isArray(selectedForm?.pocs) && selectedForm.pocs.some((p) => p?.name || p?.phone) && (
            <div className="p-3 sm:p-3.5 rounded-xl border border-cyan-500/30 bg-[#0c131a] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left font-mono text-xs">
              <div className="flex items-center gap-2">
                <FaUserTie className="text-cyan-400 text-sm shrink-0" />
                <span className="text-gray-300">Drive Inquiries? Contact Official POCs:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {selectedForm.pocs.map((poc, idx) => (
                  (poc?.name || poc?.phone) && (
                    <div key={idx} className="bg-black/80 px-2.5 py-1 rounded border border-white/10 flex items-center gap-1.5">
                      <span className="text-white font-bold">{poc.name || `POC ${idx + 1}`}:</span>
                      {poc.phone && (
                        <a href={`tel:${poc.phone}`} className="text-cyan-300 hover:text-white font-semibold">
                          {poc.phone}
                        </a>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Back to Drives Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setSubmittedSuccess(false);
                setMessage("");
              }}
              className="font-mono text-[11px] sm:text-xs text-gray-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              ← Back to application drives
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative z-40 mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">
            [ ROBOTICS CLUB NITW ]
          </p>
          <h1
            className="text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase mb-4"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            JOIN RC
          </h1>
          <p className="text-gray-300 font-mono text-sm md:text-base max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-3.5 rounded-lg border border-white/10">
            Select a recruitment drive below and submit your application to join the team.
          </p>
        </div>

        {/* Recruitment Syllabus Section - On top after heading */}
        <div className="relative z-30 mb-10 glass-panel p-5 sm:p-6 md:p-8 rounded-2xl border border-white/20 bg-black/70 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/15 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <FaFilePdf className="text-xl text-rose-400 shrink-0" />
                <h2
                  className="font-mono text-lg sm:text-xl font-bold uppercase tracking-wider text-white"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  Recruitment Syllabus
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Official Guides
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-gray-300 mt-1">
                Download the official syllabus for your target team and year of study to prepare for the recruitment tasks and interviews:
              </p>
            </div>
            <span className="hidden sm:inline-block font-mono text-[11px] text-cyan-400/90 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30 whitespace-nowrap">
              3 Guides Available
            </span>
          </div>

          {/* 3 Download Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1st Year Tech Team Syllabus */}
            <a
              href="/recruitment_docs/1st year.pdf"
              download="1st_Year_Tech_Team_Syllabus.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#101720] hover:bg-[#15202d] border border-cyan-500/40 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group shadow-md hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    1st Year
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">PDF • Tech Team</span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  1st Year Tech Team Syllabus
                </h3>
                <p className="font-mono text-xs text-gray-400 mt-1 leading-relaxed">
                  Fundamental robotics concepts, basic programming, hardware basics, and task guidelines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <FaDownload className="text-xs group-hover:scale-110 transition-transform" />
                  <span>Download PDF</span>
                </span>
                <span className="text-cyan-300/80 bg-cyan-950/80 text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30">
                  PDF
                </span>
              </div>
            </a>

            {/* 2nd Year Tech Team Syllabus */}
            <a
              href="/recruitment_docs/2nd years.pdf"
              download="2nd_Year_Tech_Team_Syllabus.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#101720] hover:bg-[#15202d] border border-cyan-500/40 hover:border-cyan-300 transition-all duration-300 flex flex-col justify-between group shadow-md hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:-translate-y-0.5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    2nd Year
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">PDF • Tech Team</span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  2nd Year Tech Team Syllabus
                </h3>
                <p className="font-mono text-xs text-gray-400 mt-1 leading-relaxed">
                  Advanced software, ROS, embedded systems, mechanical design, and circuit architecture.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <FaDownload className="text-xs group-hover:scale-110 transition-transform" />
                  <span>Download PDF</span>
                </span>
                <span className="text-cyan-300/80 bg-cyan-950/80 text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30">
                  PDF
                </span>
              </div>
            </a>

            {/* PR Syllabus (1st, 2nd, 3rd) Year */}
            <a
              href="/recruitment_docs/PR_syllabus_1st,2nd,3rd year.pdf"
              download="PR_syllabus_1st,2nd,3rd year.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-[#17101f] hover:bg-[#20152c] border border-fuchsia-500/40 hover:border-fuchsia-300 transition-all duration-300 flex flex-col justify-between group shadow-md hover:shadow-[0_0_20px_rgba(217,70,239,0.25)] hover:-translate-y-0.5 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-500/30">
                    1st, 2nd & 3rd Year
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">PDF • PR Team</span>
                </div>
                <h3 className="font-mono text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                  PR Syllabus (1st, 2nd, 3rd) Year
                </h3>
                <p className="font-mono text-xs text-gray-400 mt-1 leading-relaxed">
                  Public relations, content, graphic design, sponsorship outreach, and event operations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-xs font-bold text-fuchsia-400 group-hover:text-fuchsia-300">
                <span className="flex items-center gap-1.5">
                  <FaDownload className="text-xs group-hover:scale-110 transition-transform" />
                  <span>Download PDF</span>
                </span>
                <span className="text-fuchsia-300/80 bg-fuchsia-950/80 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-500/30">
                  PDF
                </span>
              </div>
            </a>
          </div>
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Left Side: Forms List */}
          <div className="relative z-20 space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-400 px-1">
              Active Drives ({forms.length})
            </p>
            {forms.map((form) => {
              const formYears = Array.isArray(form.years) && form.years.length
                ? form.years
                : DEFAULT_YEAR_OPTIONS;
              const isSelected = selectedFormId === form._id;
              return (
                <button
                  key={form._id}
                  type="button"
                  onClick={() => {
                    setSelectedFormId(form._id);
                    setSelectedForm(form);
                    setDepartments([]);
                    setYear("");
                    setSubmittedSuccess(false);
                    setMessage("");
                    if (form.whatsappLink) {
                      setWhatsappGroupLink(form.whatsappLink);
                    }
                  }}
                  className={`w-full text-left rounded-xl border p-5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                      : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 border border-white/10 px-2 py-0.5 rounded">
                    OPEN FORM
                  </span>
                  <p
                    className="mt-3 text-lg font-bold text-white uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    {getRecruitmentFormTitle(form)}
                  </p>
                  <p className="mt-2 text-xs text-gray-300 font-mono">
                    Eligible: <span className="text-white font-semibold">{formYears.join(", ")}</span>
                  </p>
                  <p className="mt-1.5 text-xs text-gray-400 font-mono">
                    {form.deadline ? `Deadline: ${new Date(form.deadline).toLocaleDateString()}` : "No deadline"}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Side: Form Panel */}
          <div className="glass-panel relative z-10 p-6 md:p-8 border border-white/20">
            {selectedForm ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-5">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-400">
                      [ APPLICATION FORM ]
                    </span>
                    <h2
                      className="mt-2 text-2xl md:text-3xl font-black text-white uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                      {getRecruitmentFormTitle(selectedForm)}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">Eligible Years:</span>
                      {allowedYears.map((yr) => (
                        <span
                          key={yr}
                          className="rounded border border-white/20 bg-white/5 px-2.5 py-0.5 font-mono text-xs font-semibold text-white"
                        >
                          {yr}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedForm.deadline && (
                    <p className="font-mono text-xs md:text-sm text-gray-400">
                      Deadline: {new Date(selectedForm.deadline).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Points of Contact (POCs) for selected drive */}
                {Array.isArray(selectedForm.pocs) && selectedForm.pocs.some((p) => p?.name || p?.phone) && (
                  <div className="p-3.5 sm:p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 font-mono text-xs space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
                      <FaPhoneAlt className="text-xs shrink-0" />
                      <span>Have Doubts? Contact Drive POCs:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {selectedForm.pocs.map((poc, idx) => (
                        (poc?.name || poc?.phone) && (
                          <div key={idx} className="bg-black/60 p-2.5 rounded-lg border border-white/10 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-gray-400 block truncate">Point of Contact {idx + 1}</span>
                              <span className="text-white font-bold block truncate">{poc.name || "Club Executive"}</span>
                            </div>
                            {poc.phone && (
                              <a
                                href={`tel:${poc.phone}`}
                                className="text-cyan-300 hover:text-white px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                              >
                                <FaPhoneAlt className="text-[10px]" />
                                <span>{poc.phone}</span>
                              </a>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Department & Year of Study in 2 Columns */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-mono text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Department(s) <span className="text-red-400">*</span> <span className="text-gray-500 text-xs normal-case">(Max 2)</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      {formOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-3 font-mono text-sm text-gray-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={departments.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (departments.length < 2) {
                                  setDepartments([...departments, option.value]);
                                } else {
                                  setMessage("You can only select up to 2 departments.");
                                }
                              } else {
                                setDepartments(departments.filter((d) => d !== option.value));
                                setMessage(""); // Clear message if user deselects
                              }
                            }}
                            className="h-4 w-4 accent-white cursor-pointer"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Year of Study <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={year}
                      onChange={(event) => {
                        setYear(event.target.value);
                        if (message) setMessage("");
                      }}
                      className="w-full rounded-lg border border-white/20 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white focus:border-white focus:outline-none transition-colors"
                      required
                    >
                      <option value="" className="bg-black text-gray-400">Select year of study</option>
                      {yearOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-black text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 font-mono text-[11px] text-gray-400">
                      Eligible: <span className="text-white font-medium">{allowedYears.join(", ")}</span>
                    </p>
                  </div>
                </div>

                {/* Other Questions */}
                <div className="space-y-5 pt-2">
                  {selectedForm.fields
                    .filter((field) => !isDepartmentField(field) && !isYearField(field))
                    .map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="block font-mono text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          {field.label}
                          {field.required ? <span className="ml-1 text-red-400">*</span> : ""}
                        </label>
                        {renderFieldInput(field, formValues[field.name], (value) => handleFieldChange(field.name, value))}
                      </div>
                    ))}
                </div>

                {message && (
                  <div
                    className={`rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed ${
                      message.toLowerCase().includes("already") ||
                      message.toLowerCase().includes("cannot") ||
                      message.toLowerCase().includes("failed") ||
                      message.toLowerCase().includes("please") ||
                      message.toLowerCase().includes("error") ||
                      message.toLowerCase().includes("not allowed")
                        ? "border-rose-500/60 bg-rose-950/60 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                        : "border-emerald-500/60 bg-emerald-950/60 text-emerald-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg border border-white bg-white text-black px-6 py-3.5 font-mono text-sm font-bold uppercase tracking-widest transition-all hover:bg-transparent hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "[ SUBMIT APPLICATION ]"}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

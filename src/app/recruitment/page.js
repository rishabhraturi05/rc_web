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
  const [department, setDepartment] = useState("");
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
            setDepartment(firstForm.departments?.[0] || "");
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
    setDepartment(selectedForm.departments?.[0] || "");
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

    if (!department) {
      setMessage("Please select a department.");
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
          department,
          year,
          responses: {
            ...formValues,
            year,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.alreadyApplied || result.message?.toLowerCase().includes("already")) {
          setSubmittedSuccess(true);
          setSubmittedDept(result.department || department || "Robotics Club");
          setSubmittedYear(result.year || year || "");
          if (result.whatsappLink) {
            setWhatsappGroupLink(result.whatsappLink);
          }
          setMessage(result.message || "You are already registered. Join the WhatsApp group below.");
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 120, behavior: "smooth" });
          }
          return;
        }
        setMessage(result.message || "Failed to submit application.");
        return;
      }

      setSubmittedSuccess(true);
      setSubmittedDept(result.department || department);
      setSubmittedYear(result.year || year);
      if (result.whatsappLink) {
        setWhatsappGroupLink(result.whatsappLink);
      }
      setMessage("Application submitted successfully.");
      setFormValues({});
      setDepartment(selectedForm.departments?.[0] || "");
      setYear("");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 120, behavior: "smooth" });
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
                    setDepartment(form.departments?.[0] || "");
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
            {submittedSuccess ? (
              <div
                className="space-y-6 select-none py-4 sm:py-6"
                onContextMenu={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                {/* Glowing Green Success Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 pb-4 border-b border-white/10">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                    <FaCheckCircle className="text-3xl" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    [ REGISTRATION SUCCESSFUL ]
                  </span>
                  <h2
                    className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    Application Received!
                  </h2>
                  <p className="font-mono text-gray-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Your application for <strong className="text-white">{submittedDept} Department</strong> ({submittedYear}) has been submitted successfully.
                  </p>
                </div>

                {/* WhatsApp Group Dedicated Card */}
                <div
                  className="p-5 sm:p-6 rounded-xl border border-emerald-500/40 bg-emerald-950/25 space-y-4 text-left shadow-2xl relative overflow-hidden"
                  onContextMenu={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <FaWhatsapp className="text-2xl text-emerald-400" />
                      <span className="font-mono text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                        Official WhatsApp Group
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      MANDATORY JOIN
                    </span>
                  </div>

                  <p className="font-mono text-xs sm:text-sm text-gray-300 leading-relaxed">
                    All interview slots, schedule updates, assignment tasks, and announcements will be shared exclusively inside the official applicants WhatsApp group. Please join immediately:
                  </p>

                  <div className="p-3 rounded-lg bg-black/60 border border-white/10 flex items-center gap-2.5 text-gray-400 font-mono text-[11px] leading-relaxed">
                    <FaShieldAlt className="text-amber-400 text-sm flex-shrink-0" />
                    <span>
                      Security protocol: Direct access link for registered applicants only. Copying or forwarding the URL is disabled.
                    </span>
                  </div>

                  {/* Anti-copy WhatsApp Button */}
                  <div className="pt-2">
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
                      className="w-full py-4 px-6 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-black font-mono font-bold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_25px_rgba(37,211,102,0.35)] hover:shadow-[0_0_35px_rgba(37,211,102,0.5)] cursor-pointer select-none"
                      style={{ userSelect: "none", WebkitUserSelect: "none" }}
                    >
                      <FaWhatsapp className="text-2xl text-black" />
                      <span>[ JOIN WHATSAPP GROUP ]</span>
                      <FaArrowRight className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedForm && (
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

                {/* Department & Year of Study in 2 Columns */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-mono text-xs md:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Department <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(event) => setDepartment(event.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white focus:border-white focus:outline-none transition-colors"
                      required
                    >
                      <option value="" className="bg-black text-gray-400">Select department</option>
                      {formOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-black text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                  <div className="rounded-lg border border-white/30 bg-white/10 px-4 py-3 font-mono text-sm text-white">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

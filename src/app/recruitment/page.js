"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecruitmentFormTitle, isDepartmentField, isYearField } from "@/app/lib/recruitment";

const defaultFormState = {};

function renderFieldInput(field, value, onChange) {
  const commonClassName =
    "w-full rounded-lg border border-white/20 bg-black/40 px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-gray-500 focus:border-white focus:outline-none transition-colors";

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
        setMessage(result.message || "Failed to submit application.");
        return;
      }

      setMessage("Application submitted successfully.");
      setFormValues({});
      setDepartment(selectedForm.departments?.[0] || "");
      setYear("");
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
            {selectedForm && (
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

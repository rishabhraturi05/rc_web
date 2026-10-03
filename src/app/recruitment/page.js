"use client";

import { useEffect, useMemo, useState } from "react";

const defaultFormState = {};

function renderFieldInput(field, value, onChange) {
  const commonClassName =
    "w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none";

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
        <option value="">Select an option</option>
        {(field.options || []).map((option) => (
          <option key={option} value={option}>
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
          <label key={option} className="flex items-center gap-2 text-gray-200">
            <input
              type="radio"
              name={field.name}
              checked={String(value || "") === String(option)}
              onChange={() => onChange(option)}
              className="accent-cyan-400"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 text-gray-200">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-cyan-400"
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
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch("/api/recruitment");
        const result = await response.json();

        if (result.success) {
          setForms(result.data || []);
          if (result.data?.length) {
            const firstForm = result.data[0];
            setSelectedFormId(firstForm._id);
            setSelectedForm(firstForm);
            setDepartment(firstForm.departments?.[0] || "");
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

  useEffect(() => {
    if (!selectedForm) return;
    setDepartment(selectedForm.departments?.[0] || "");
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

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/recruitment/${selectedForm._id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          responses: formValues,
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
      <div className="min-h-screen bg-black text-white px-6 py-24 flex items-center justify-center">
        <div className="glass-panel max-w-2xl w-full p-8 text-center">
          <p className="text-cyber font-mono text-xl uppercase tracking-widest mb-3">[ Recruitment ]</p>
          <h1 className="text-3xl font-bold mb-4">Recruitment Closed</h1>
          <p className="font-mono text-gray-300 leading-relaxed">
            No active recruitment forms are currently open. Please check back later or contact the club for updates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="relative z-40 mb-8 text-center">
          <p className="text-cyber font-mono text-sm uppercase tracking-[0.3em]">[ RC Recruitment ]</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-black uppercase tracking-tight">Apply to RC</h1>
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="relative z-20 space-y-4">
            {forms.map((form) => (
              <button
                key={form._id}
                type="button"
                onClick={() => {
                  setSelectedFormId(form._id);
                  setSelectedForm(form);
                  setDepartment(form.departments?.[0] || "");
                }}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selectedFormId === form._id
                    ? "border-cyan-400 bg-[#06181d] shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "border-white/10 bg-black/40 hover:border-white/30"
                }`}
              >
                <p className="text-cyber font-mono text-xs uppercase tracking-[0.2em]">Open Form</p>
                <p className="mt-2 text-lg font-bold">{form.departments?.join(" + ") || "Recruitment"}</p>
                <p className="mt-2 text-sm text-gray-300 font-mono">
                  {form.deadline ? `Deadline: ${new Date(form.deadline).toLocaleDateString()}` : "No deadline"}
                </p>
              </button>
            ))}
          </div>

          <div className="glass-panel relative z-10 p-6 md:p-8">
            {selectedForm && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-cyber font-mono text-xs uppercase tracking-[0.2em]">[ Application ]</p>
                    <h2 className="mt-2 text-2xl font-bold">{selectedForm.departments?.join(" / ")}</h2>
                  </div>
                  {selectedForm.deadline && (
                    <p className="font-mono text-sm text-gray-300">
                      Deadline: {new Date(selectedForm.deadline).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200">Department</label>
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                    required
                  >
                    <option value="">Select department</option>
                    {formOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-6">
                  {selectedForm.fields
                    .filter((field) => String(field.name || "").trim().toLowerCase() !== "department")
                    .map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-200">
                          {field.label}
                          {field.required ? <span className="ml-1 text-red-400">*</span> : ""}
                        </label>
                        {renderFieldInput(field, formValues[field.name], (value) => handleFieldChange(field.name, value))}
                      </div>
                    ))}
                </div>

                {message && (
                  <div className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg border border-cyan-400 bg-cyan-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/pages/Settings/CompanyProfileTab.tsx

import { useState, useEffect } from "react";
import { Building2, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Input, Button } from "../../components/ui";
import { useSettingsStore } from "../../store/settingsStore";
import type { CompanySettings } from "../../services/settingsService";

export default function CompanyProfileTab() {
  const company = useSettingsStore((s) => s.company);
  const saveCompany = useSettingsStore((s) => s.saveCompany);

  const [form, setForm] = useState<CompanySettings>(company);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Sync form when store loads from backend
  useEffect(() => {
    setForm(company);
    setDirty(false);
  }, [company]);

  function update(key: keyof CompanySettings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Company name is required.");
      return;
    }
    setSaving(true);
    try {
      await saveCompany(form);
      toast.success("Company profile saved.");
      setDirty(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof CompanySettings; label: string; placeholder: string; type?: string }[] = [
    { key: "name",    label: "Company Name",    placeholder: "e.g. Daccess Systems Private Limited" },
    { key: "tagline", label: "Tagline / Sub-name", placeholder: "e.g. Daccess Security Systems Pvt. Ltd." },
    { key: "address", label: "Address",         placeholder: "Street, City, State, Country" },
    { key: "phone",   label: "Phone",           placeholder: "+91 9999999999" },
    { key: "email",   label: "Email",           placeholder: "sales@daccess.com", type: "email" },
    { key: "gst",     label: "GSTIN",           placeholder: "27ABCDE1234F1Z5" },
  ];

  return (
    <section
      className="rounded-(--radius-lg) overflow-hidden"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--color-border-light)" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--color-primary-light, #f0edff)" }}
        >
          <Building2 size={17} style={{ color: "var(--color-primary)" }} />
        </div>
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--color-text-main)" }}>
            Company Profile
          </h2>
          <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            This information appears on every generated quotation PDF.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-5">
          {fields.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              required={f.key === "name"}
              disabled={saving}
            />
          ))}
        </div>

        {/* Preview card */}
        <div
          className="rounded-lg px-5 py-4 flex items-start gap-4"
          style={{
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border-light)",
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[17px] font-bold text-white mt-0.5"
            style={{ background: "var(--color-primary)" }}
          >
            {form.name.charAt(0).toUpperCase() || "D"}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-main)" }}>
              {form.name || "Company Name"}
            </p>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {form.tagline}
            </p>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {form.address}
            </p>
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              {form.phone} · {form.email}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 flex justify-end"
        style={{
          borderTop: "1px solid var(--color-border-light)",
          background: "var(--color-bg-input)",
        }}
      >
        <Button variant="primary" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </section>
  );
}

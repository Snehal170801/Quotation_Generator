// src/pages/Settings/QuotationSettingsTab.tsx

import { useState, useEffect } from "react";
import { FileText, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Input, Button } from "../../components/ui";
import { useSettingsStore } from "../../store/settingsStore";
import type { QuotationSettings } from "../../services/settingsService";

export default function QuotationSettingsTab() {
  const quotation = useSettingsStore((s) => s.quotation);
  const saveQuotation = useSettingsStore((s) => s.saveQuotation);

  const [form, setForm] = useState<QuotationSettings>(quotation);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(quotation);
    setDirty(false);
  }, [quotation]);

  function update<K extends keyof QuotationSettings>(key: K, value: QuotationSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    if (form.gstRate < 0 || form.gstRate > 100) {
      toast.error("GST rate must be between 0 and 100.");
      return;
    }
    if (form.validityDays < 1) {
      toast.error("Validity must be at least 1 day.");
      return;
    }
    if (form.defaultDiscountPercent < 0 || form.defaultDiscountPercent > 100) {
      toast.error("Default discount must be between 0 and 100.");
      return;
    }
    if (!form.prefix.trim()) {
      toast.error("Quotation prefix is required.");
      return;
    }
    setSaving(true);
    try {
      await saveQuotation(form);
      toast.success("Quotation settings saved.");
      setDirty(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // const sampleNumber = `${form.prefix}-${Date.now()}`.slice(0, 20) + "…";

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
          style={{ background: "#e5f0ff" }}
        >
          <FileText size={17} style={{ color: "#1280f7" }} />
        </div>
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--color-text-main)" }}>
            Quotation Settings
          </h2>
          <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            Configure GST rate, validity, and numbering for all quotations.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* GST Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold" style={{ color: "#737380" }}>
              GST Rate <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div
              className="flex items-center gap-2 h-9 px-3 rounded-md border"
              style={{
                background: "var(--color-bg-input)",
                borderColor: "var(--color-border)",
              }}
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.gstRate}
                onChange={(e) => update("gstRate", Number(e.target.value))}
                disabled={saving}
                className="flex-1 text-[13px] outline-none border-none bg-transparent [appearance:textfield]
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ color: "var(--color-text-main)" }}
              />
              <span className="text-[13px] shrink-0" style={{ color: "var(--color-text-muted)" }}>%</span>
            </div>
          </div>

          {/* Validity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold" style={{ color: "#737380" }}>
              Validity Period <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <div
              className="flex items-center gap-2 h-9 px-3 rounded-md border"
              style={{
                background: "var(--color-bg-input)",
                borderColor: "var(--color-border)",
              }}
            >
              <input
                type="number"
                min="1"
                value={form.validityDays}
                onChange={(e) => update("validityDays", Number(e.target.value))}
                disabled={saving}
                className="flex-1 text-[13px] outline-none border-none bg-transparent [appearance:textfield]
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ color: "var(--color-text-main)" }}
              />
              <span className="text-[13px] shrink-0" style={{ color: "var(--color-text-muted)" }}>days</span>
            </div>
          </div>

          {/* Prefix */}
          <Input
            label="Quotation Prefix"
            value={form.prefix}
            onChange={(e) => update("prefix", e.target.value.toUpperCase())}
            placeholder="e.g. QT"
            disabled={saving}
            required
          />

          {/* Default Discount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold" style={{ color: "#737380" }}>
              Default Discount
            </label>
            <div
              className="flex items-center gap-2 h-9 px-3 rounded-md border"
              style={{
                background: "var(--color-bg-input)",
                borderColor: "var(--color-border)",
              }}
            >
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={form.defaultDiscountPercent}
                onChange={(e) => update("defaultDiscountPercent", Number(e.target.value))}
                disabled={saving}
                className="flex-1 text-[13px] outline-none border-none bg-transparent [appearance:textfield]
                           [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ color: "var(--color-text-main)" }}
              />
              <span className="text-[13px] shrink-0" style={{ color: "var(--color-text-muted)" }}>%</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div
          className="rounded-lg px-5 py-4 flex flex-col gap-2"
          style={{
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border-light)",
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Preview
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-[13px]" style={{ color: "var(--color-text-main)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Number format: </span>
              <strong>{form.prefix}-1735000000000</strong>
            </p>
            <p className="text-[13px]" style={{ color: "var(--color-text-main)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>GST applied: </span>
              <strong>{form.gstRate}%</strong> on subtotal
            </p>
            {form.defaultDiscountPercent > 0 && (
              <p className="text-[13px]" style={{ color: "var(--color-text-main)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Default discount: </span>
                <strong>{form.defaultDiscountPercent}%</strong> pre-filled in Sales Panel
              </p>
            )}
            <p className="text-[13px]" style={{ color: "var(--color-text-main)" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Footer note: </span>
              "Valid for <strong>{form.validityDays} days</strong> from date of issue."
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

// src/pages/SalesPanel/SummaryCard.tsx

import { useState } from "react";
import { FileText, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui";
import { useSalesStore } from "../../store/salesStore";
import type { SalesCategory } from "../../store/salesStore";
import { useSettingsStore } from "../../store/settingsStore";
import { orderService } from "../../services/orderService";
import PreviewPDFModal from "./PreviewPDFModal";
import type { QuotationLineItem, CustomerRow } from "./QuotationPDF";
import { usePermissions } from "../../hooks/usePermissions";

function SummaryColumn({ cat, selected }: { cat: SalesCategory; selected: Set<string> }) {
  const chosenItems = cat.items.filter((i) => selected.has(i.id));

  return (
    <div className="flex flex-col gap-3 pr-6">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.07em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {cat.label}
        </span>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: chosenItems.length > 0 ? cat.color + "15" : "var(--color-bg-input)",
            color: chosenItems.length > 0 ? cat.color : "var(--color-text-muted)",
          }}
        >
          {chosenItems.length}
        </span>
      </div>

      <div className="h-px" style={{ background: "var(--color-border-light)" }} />

      {chosenItems.length === 0 ? (
        <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
          None selected
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {chosenItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 flex items-center justify-center rounded text-[9px] font-bold text-white shrink-0"
                style={{ background: cat.color }}
              >
                ✓
              </span>
              <span className="text-[13px]" style={{ color: "var(--color-text-main)" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function generateQuotationNumber(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function generateQuotationDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SummaryCard() {
  const categories = useSalesStore((s) => s.categories);
  const fields = useSalesStore((s) => s.fields);
  const selected = useSalesStore((s) => s.selected);
  const formValues = useSalesStore((s) => s.formValues);
  const settingsCompany = useSettingsStore((s) => s.company);
  const settingsQuotation = useSettingsStore((s) => s.quotation);

  const perms = usePermissions();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [quoteMeta, setQuoteMeta] = useState<{ number: string; date: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const totalSelected = selected.size;

  function validateCustomerFields(): boolean {
    for (const field of fields) {
      const value = (formValues[String(field.id)] ?? "").trim();
      if (!value) continue;
      if (field.type === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        toast.error(`"${field.name}" has an invalid email address`);
        return false;
      }
      if (field.type === "Phone" && !/^[+]?[\d\s\-().]{7,15}$/.test(value)) {
        toast.error(`"${field.name}" has an invalid phone number`);
        return false;
      }
    }
    return true;
  }

  function handlePreview() {
    if (totalSelected === 0) {
      toast.error("Select at least one item before previewing the PDF");
      return;
    }
    if (!validateCustomerFields()) return;
    setQuoteMeta({ number: generateQuotationNumber(settingsQuotation.prefix), date: generateQuotationDate() });
    setPreviewOpen(true);
  }

  // Flatten selected items across all categories into PDF line items
  const lineItems: QuotationLineItem[] = categories.flatMap((cat) =>
    cat.items
      .filter((i) => selected.has(i.id))
      .map((i) => ({ category: cat.label, label: i.name, price: i.price, quantity: 1 }))
  );

  // Build customer rows from dynamic fields
  const customerRows: CustomerRow[] = fields.map((f) => ({
    label: f.name,
    value: formValues[String(f.id)] ?? "",
  }));

  const subtotal = lineItems.reduce((s, i) => s + i.price, 0);
  const gstAmount = subtotal * (settingsQuotation.gstRate / 100);
  const total = subtotal + gstAmount;

  async function handleSaveDraft() {
    if (totalSelected === 0) { toast.error("Select at least one item before saving."); return; }
    if (!validateCustomerFields()) return;
    setSaving(true);
    try {
      const qNum = generateQuotationNumber(settingsQuotation.prefix);
      await orderService.create({
        quotationNumber: qNum,
        customerDetails: customerRows,
        lineItems: lineItems.map((i) => ({ category: i.category, name: i.label, price: i.price, quantity: i.quantity })),
        subtotal,
        discountPercent: 0,
        discountAmount: 0,
        gstRate: settingsQuotation.gstRate,
        gstAmount,
        total,
        status: "draft",
      });
      toast.success(`Draft saved as ${qNum}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save draft.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  // Show max 4 columns in summary; if more categories, wrap
  const displayCats = categories.filter((c) => c.items.some((i) => selected.has(i.id)));

  return (
    <section
      className="rounded-(--radius-lg) overflow-hidden"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
      }}
    >
      {/* ── Header ── */}
      <div
        className="h-14 flex items-center justify-between px-6"
        style={{ borderBottom: "1px solid var(--color-border-light)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-5 rounded-sm shrink-0"
            style={{ background: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <h2 className="text-[15px] font-semibold" style={{ color: "var(--color-text-main)" }}>
            Summary
          </h2>
        </div>
        <span
          className="text-[12px] font-semibold px-3 py-1 rounded-full border"
          style={{
            background: totalSelected > 0 ? "var(--color-primary-light, #f0edff)" : "var(--color-bg-input)",
            borderColor: totalSelected > 0 ? "var(--color-primary)" : "var(--color-border-light)",
            color: totalSelected > 0 ? "var(--color-primary)" : "var(--color-text-muted)",
          }}
        >
          {totalSelected} items selected
        </span>
      </div>

      {/* ── Columns ── */}
      {displayCats.length === 0 ? (
        <p className="px-6 py-8 text-[13px]" style={{ color: "var(--color-text-muted)" }}>
          No items selected yet. Pick items above to see the summary.
        </p>
      ) : (
        <div className="grid px-6 py-6 gap-y-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayCats.map((cat) => (
            <SummaryColumn key={cat.id} cat={cat} selected={selected} />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-end gap-3 px-6 py-4"
        style={{
          background: "var(--color-bg-input)",
          borderTop: "1px solid var(--color-border-light)",
        }}
      >
        {perms.canCreateOrder && (
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Draft"}
          </Button>
        )}
        <Button variant="primary" onClick={handlePreview}>
          <FileText size={14} />
          Preview PDF
        </Button>
      </div>

      {previewOpen && quoteMeta && (
        <PreviewPDFModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          customerRows={customerRows}
          lineItems={lineItems}
          quotationNumber={quoteMeta.number}
          quotationDate={quoteMeta.date}
          settings={{ company: settingsCompany, quotation: settingsQuotation }}
        />
      )}
    </section>
  );
}

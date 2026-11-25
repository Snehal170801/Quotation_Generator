// src/pages/SalesPanel/SummaryBar.tsx
// Replaces SummaryCard.tsx — sticky bottom bar, all logic preserved.

import { useState } from "react";
import { FileText, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui";
import { useSalesStore } from "../../store/salesStore";
import { useSettingsStore } from "../../store/settingsStore";
import { orderService } from "../../services/orderService";
import PreviewPDFModal from "./PreviewPDFModal";
import type { QuotationLineItem, CustomerRow } from "./QuotationPDF";
import { usePermissions } from "../../hooks/usePermissions";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SummaryBar() {
  const categories = useSalesStore((s) => s.categories);
  const fields = useSalesStore((s) => s.fields);
  const selected = useSalesStore((s) => s.selected);
  const quantities = useSalesStore((s) => s.quantities);
  const formValues = useSalesStore((s) => s.formValues);
  const settingsCompany = useSettingsStore((s) => s.company);
  const settingsQuotation = useSettingsStore((s) => s.quotation);

  const perms = usePermissions();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [quoteMeta, setQuoteMeta] = useState<{
    number: string;
    date: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const discountPercent = settingsQuotation.defaultDiscountPercent;

  const totalSelected = selected.size;

  const lineItems: QuotationLineItem[] = categories.flatMap((cat) =>
    cat.items
      .filter((i) => selected.has(i.id))
      .map((i) => ({
        category: cat.label,
        label: i.name,
        price: i.price,
        quantity: quantities[i.id] ?? 1,
      })),
  );

  const customerRows: CustomerRow[] = fields.map((f) => ({
    label: f.name,
    value: formValues[String(f.id)] ?? "",
  }));

  const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * (settingsQuotation.gstRate / 100);
  const total = taxableAmount + gstAmount;

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
    setQuoteMeta({
      number: generateQuotationNumber(settingsQuotation.prefix),
      date: generateQuotationDate(),
    });
    setPreviewOpen(true);
  }

  async function handleSaveDraft() {
    if (totalSelected === 0) {
      toast.error("Select at least one item before saving.");
      return;
    }
    if (!validateCustomerFields()) return;
    setSaving(true);
    try {
      const qNum = generateQuotationNumber(settingsQuotation.prefix);
      await orderService.create({
        quotationNumber: qNum,
        customerDetails: customerRows,
        lineItems: lineItems.map((i) => ({
          category: i.category,
          name: i.label,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        discountPercent,
        discountAmount,
        gstRate: settingsQuotation.gstRate,
        gstAmount,
        total,
        status: "draft",
      });
      toast.success(`Draft saved as ${qNum}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save draft.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (categories.length === 0) return null;

  return (
    <>
      <div
        style={{
          position: "sticky",
          bottom: 0,
          zIndex: 50,
          marginLeft: "-4px",
          marginRight: "-4px",
          marginTop: 8,
        }}
      >
        <div
          style={{
            background: "var(--color-bg-card)",
            borderTop: "1px solid var(--color-border-light)",
            boxShadow: "0 -2px 16px rgba(0,0,0,0.06)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {totalSelected > 0 && subtotal > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 24,
                alignItems: "flex-start",
              }}
            >
              {/* Line items table */}
              <div
                style={{
                  flex: "1 1 320px",
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: 8,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--color-border-light)",
                          background: "var(--color-bg-card)",
                          position: "sticky",
                          top: 0,
                        }}
                      >
                        Item
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--color-border-light)",
                          background: "var(--color-bg-card)",
                          position: "sticky",
                          top: 0,
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={`${item.category}-${item.label}-${i}`}>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "var(--color-text-main)",
                            borderBottom: "1px solid var(--color-border-light)",
                          }}
                        >
                          {item.label}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            fontWeight: 600,
                            color: "var(--color-text-main)",
                            borderBottom: "1px solid var(--color-border-light)",
                          }}
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {[
                    { label: "Subtotal", value: formatCurrency(subtotal) },
                    ...(discountPercent > 0
                      ? [
                          {
                            label: `Discount ${discountPercent}%`,
                            value: `-${formatCurrency(discountAmount)}`,
                          },
                        ]
                      : []),
                    {
                      label: `GST ${settingsQuotation.gstRate}%`,
                      value: formatCurrency(gstAmount),
                    },
                    { label: "Total", value: formatCurrency(total), isTotal: true },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td
                        style={{
                          fontSize: row.isTotal ? 13 : 12,
                          fontWeight: row.isTotal ? 700 : 500,
                          color: row.isTotal
                            ? "var(--color-text-main)"
                            : "var(--color-text-muted)",
                          padding: "4px 20px 4px 0",
                          borderTop: row.isTotal
                            ? "1px solid var(--color-border-light)"
                            : "none",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          fontSize: row.isTotal ? 17 : 14,
                          fontWeight: 700,
                          color: row.isTotal
                            ? "var(--color-primary)"
                            : "var(--color-text-main)",
                          textAlign: "right",
                          padding: "4px 0",
                          borderTop: row.isTotal
                            ? "1px solid var(--color-border-light)"
                            : "none",
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Select items above to build your quotation
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
            {perms.canCreateOrder && (
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving…" : "Save Draft"}
              </Button>
            )}
            <Button variant="primary" onClick={handlePreview}>
              <FileText size={14} />
              Preview PDF
            </Button>
          </div>
        </div>
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
          discountPercent={discountPercent}
        />
      )}
    </>
  );
}

// src/pages/Orders/OrderDetailModal.tsx

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  User,
  ShoppingCart,
  IndianRupee,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "../../components/ui";
import QuotationPDF from "../SalesPanel/QuotationPDF";
import type { Order } from "../../services/orderService";
import type { AppSettings } from "../../services/settingsService";
import { orderService } from "../../services/orderService";
import toast from "react-hot-toast";
import { usePermissions } from "../../hooks/usePermissions";

interface Props {
  order: Order;
  settings: AppSettings;
  onClose: () => void;
  onStatusChanged: (updated: Order) => void;
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailModal({
  order,
  settings,
  onClose,
  onStatusChanged,
}: Props) {
  const [finalizing, setFinalizing] = useState(false);
  const perms = usePermissions();

  async function handleFinalize() {
    setFinalizing(true);
    try {
      const updated = await orderService.updateStatus(order._id, "saved");
      toast.success(`${order.quotationNumber} marked as Saved.`);
      onStatusChanged(updated);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setFinalizing(false);
    }
  }

  const customerRows = (order.customerDetails ?? []).map((d) => ({
    label: d.label,
    value: d.value,
  }));

  const lineItems = (order.lineItems ?? []).map((i) => ({
    category: i.category,
    label: i.name,
    price: i.price,
    quantity: i.quantity ?? 1,
  }));

  const quotationDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const pdfDoc = (
    <QuotationPDF
      customerRows={customerRows}
      lineItems={lineItems}
      quotationNumber={order.quotationNumber}
      quotationDate={quotationDate}
      settings={settings}
      discountPercent={order.discountPercent}
    />
  );

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.60)",
        backdropFilter: "blur(3px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
          width: "94%",
          maxWidth: "660px",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f0f0f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#1a1a1f",
                  margin: 0,
                }}
              >
                {order.quotationNumber}
              </h3>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 9px",
                  borderRadius: "999px",
                  background: order.status === "saved" ? "#e6f9f0" : "#fff3e0",
                  color: order.status === "saved" ? "#0f8050" : "#f28c1a",
                }}
              >
                {order.status === "saved" ? (
                  <CheckCircle2 size={10} />
                ) : (
                  <Clock size={10} />
                )}
                {order.status === "saved" ? "Saved" : "Draft"}
              </span>
            </div>
            <p
              style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}
            >
              Created {formatDate(order.createdAt)}
              {order.createdBy &&
                typeof order.createdBy === "object" &&
                ` · by ${order.createdBy.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              color: "#374151",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Customer Details */}
          {customerRows.length > 0 && (
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <User size={13} color="#9ca3af" />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Customer Details
                </span>
              </div>
              <div
                style={{
                  background: "#f7f7fa",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "10px 16px",
                }}
              >
                {customerRows.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1a1a1f",
                        wordBreak: "break-word",
                      }}
                    >
                      {row.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Line Items */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <ShoppingCart size={13} color="#9ca3af" />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Line Items ({lineItems.length})
              </span>
            </div>
            <div
              style={{
                border: "1px solid #f0f0f5",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {lineItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "10px 14px",
                    borderBottom:
                      i < lineItems.length - 1 ? "1px solid #f0f0f5" : "none",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#1a1a1f",
                        fontWeight: 500,
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        margin: "2px 0 0",
                      }}
                    >
                      {item.category}
                      {item.quantity > 1 ? ` · Qty ${item.quantity}` : ""}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#1a1a1f",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {item.price > 0
                      ? `₹${(item.price * item.quantity).toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
              ))}
              {lineItems.length === 0 && (
                <p
                  style={{
                    padding: "16px 14px",
                    fontSize: "13px",
                    color: "#9ca3af",
                    textAlign: "center",
                  }}
                >
                  No items
                </p>
              )}
            </div>
          </section>

          {/* Totals */}
          <section style={{ alignSelf: "flex-end", width: "min(100%, 280px)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
              }}
            >
              <IndianRupee size={13} color="#9ca3af" />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Summary
              </span>
            </div>
            <div
              style={{
                background: "#f7f7fa",
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  Subtotal
                </span>
                <span style={{ fontSize: "13px", color: "#1a1a1f" }}>
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {order.discountPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Discount ({order.discountPercent}%)
                  </span>
                  <span style={{ fontSize: "13px", color: "#1a1a1f" }}>
                    -{formatCurrency(order.discountAmount)}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  GST ({order.gstRate}%)
                </span>
                <span style={{ fontSize: "13px", color: "#1a1a1f" }}>
                  {formatCurrency(order.gstAmount)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid #e5e7eb",
                  marginTop: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#1a1a1f",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#7045f7",
                  }}
                >
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #f0f0f5",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          {perms.canDownloadPDF ? (
            <PDFDownloadLink
              document={pdfDoc}
              fileName={`Quotation-${order.quotationNumber}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline" disabled={loading}>
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {loading ? "Preparing…" : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          ) : (
            <span />
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            {order.status === "draft" && perms.canFinalizeOrder && (
              <Button
                variant="primary"
                onClick={handleFinalize}
                disabled={finalizing}
              >
                {finalizing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {finalizing ? "Saving…" : "Mark as Saved"}
              </Button>
            )}
            {order.status === "saved" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "#0f8050",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={14} />
                Finalized
              </div>
            )}
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// src/pages/SalesPanel/PreviewPDFModal.tsx

import { useEffect } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { X, Download, Loader2 } from "lucide-react";
import { Button } from "../../components/ui";
import QuotationPDF, {
  type QuotationLineItem,
  type CustomerRow,
} from "./QuotationPDF";
import type { AppSettings } from "../../services/settingsService";

interface PreviewPDFModalProps {
  open: boolean;
  onClose: () => void;
  customerRows: CustomerRow[];
  lineItems: QuotationLineItem[];
  quotationNumber: string;
  quotationDate: string;
  settings: AppSettings;
  discountPercent?: number;
}

export default function PreviewPDFModal({
  open,
  onClose,
  customerRows,
  lineItems,
  quotationNumber,
  quotationDate,
  settings,
  discountPercent,
}: PreviewPDFModalProps) {
  useEffect(() => {
    if (!open) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const fileName = `Quotation-${quotationNumber}.pdf`;
  const pdfDocument = (
    <QuotationPDF
      customerRows={customerRows}
      lineItems={lineItems}
      quotationNumber={quotationNumber}
      quotationDate={quotationDate}
      settings={settings}
      discountPercent={discountPercent}
    />
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(1px)",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.20)",
          width: "100%",
          maxWidth: "720px",
          height: "85vh",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — always pinned at top, never scrolls away */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #ebebf0",
            flexShrink: 0,
            background: "#fff",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#1a1a1f",
              margin: 0,
            }}
          >
            Quotation Preview — {quotationNumber}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <PDFDownloadLink document={pdfDocument} fileName={fileName}>
              {({ loading }) => (
                <Button variant="primary" disabled={loading}>
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  {loading ? "Preparing..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
            <button
              onClick={onClose}
              aria-label="Close preview"
              style={{
                background: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#374151",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e5e7eb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PDF viewer — takes remaining space, scrolls internally only */}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
            {pdfDocument}
          </PDFViewer>
        </div>

        {/* Footer with Cancel button — always visible at bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 20px",
            borderTop: "1px solid #ebebf0",
            flexShrink: 0,
            background: "#fafafa",
          }}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

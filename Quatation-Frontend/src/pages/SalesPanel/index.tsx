// src/pages/SalesPanel/index.tsx

import { useEffect } from "react";
import { Package, FileText } from "lucide-react";
import { useSalesStore } from "../../store/salesStore";
import { useSettingsStore } from "../../store/settingsStore";
import {
  PageHeader,
  StatPill,
  EmptyState,
  ErrorBanner,
} from "../../components/ui";
import CustomerDetailsCard from "./CustomerDetailsCard";
import ProductListCard from "./ProductListCard";
import CategoryCard from "./CategoryCard";
import SummaryBar from "./SummaryBar";

export default function SalesPanel() {
  const categories = useSalesStore((s) => s.categories);
  const selected = useSalesStore((s) => s.selected);
  const quantities = useSalesStore((s) => s.quantities);
  const setQuantity = useSalesStore((s) => s.setQuantity);
  const loading = useSalesStore((s) => s.loading);
  const error = useSalesStore((s) => s.error);
  const fetchData = useSalesStore((s) => s.fetchData);
  const toggle = useSalesStore((s) => s.toggle);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, [fetchData, fetchSettings]);

  const SOLUTION_LABELS = new Set(["EXTRACTO", "ANPR", "VISION IQ PRODUCT LIST"]);
  const isSolution = (label: string) => SOLUTION_LABELS.has(label.trim().toUpperCase());

  const QUANTITY_LABELS = ["GPU", "ADMIN PORTAL", "DEPLOYMENT", "AMC", "OTHER HARDWARE"];
  const hasQuantity = (label: string) => {
    const normalized = label.trim().toUpperCase();
    return QUANTITY_LABELS.some((l) => normalized.includes(l));
  };

  const solutionCats = categories.filter((c) => isSolution(c.label));
  const productCats = categories.filter(
    (c) => c.type === "Product" && !isSolution(c.label),
  );
  const otherCats = categories.filter(
    (c) => c.type !== "Product" && !isSolution(c.label),
  );
  const totalSelected = selected.size;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: "0 4px 96px",
      }}
    >
      {/* Page header */}
      <PageHeader
        title="New Quotation"
        subtitle="Fill in customer details, select products and services, then preview the PDF."
        actions={
          <>
            <StatPill icon={Package} label={`${totalSelected} Selected`} />
            <StatPill
              icon={FileText}
              label={`${categories.length} Categories`}
              accent="var(--color-info-500)"
            />
          </>
        }
      />

      {/* Customer details */}
      <CustomerDetailsCard />

      {/* Error */}
      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-light)",
              borderRadius: 12,
              overflow: "hidden",
              minHeight: 140,
            }}
          >
            <div
              style={{
                height: 52,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                background: "var(--color-bg-input)",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <div
                className="skeleton"
                style={{ height: 14, width: 120, borderRadius: 4 }}
              />
            </div>
            <div
              style={{
                padding: "16px 24px",
                display: "grid",
                gap: 8,
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 38, borderRadius: 8 }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border-light)",
                  borderRadius: 12,
                  overflow: "hidden",
                  minHeight: 160,
                }}
              >
                <div
                  style={{
                    height: 48,
                    padding: "0 18px",
                    display: "flex",
                    alignItems: "center",
                    background: "var(--color-bg-input)",
                    borderBottom: "1px solid var(--color-border-light)",
                  }}
                >
                  <div
                    className="skeleton"
                    style={{ height: 12, width: 90, borderRadius: 4 }}
                  />
                </div>
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={j}
                      className="skeleton"
                      style={{ height: 30, width: 80, borderRadius: 6 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loaded content */}
      {!loading && !error && (
        <>
          {/* Solutions — full width */}
          {solutionCats.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--color-text-main)",
                    margin: 0,
                  }}
                >
                  Solutions
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginTop: 2,
                  }}
                >
                  Extracto, Vision IQ, and ANPR products
                </p>
              </div>
              {solutionCats.map((cat) => {
                const isVisionIQ = cat.label.trim().toUpperCase() === "VISION IQ PRODUCT LIST";
                return (
                  <ProductListCard
                    key={cat.id}
                    cat={cat}
                    selected={selected}
                    onToggle={toggle}
                    quantities={isVisionIQ ? quantities : undefined}
                    onQuantityChange={isVisionIQ ? setQuantity : undefined}
                    quantityLabel="Cameras"
                  />
                );
              })}
            </div>
          )}

          {/* Product categories — full width */}
          {productCats.map((cat) => (
            <ProductListCard
              key={cat.id}
              cat={cat}
              selected={selected}
              onToggle={toggle}
            />
          ))}

          {/* Other categories — 2-col grid */}
          {otherCats.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              }}
            >
              {otherCats.map((cat, i) => {
                const withQuantity = hasQuantity(cat.label);
                return (
                  <div
                    key={cat.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(i * 45, 270)}ms` }}
                  >
                    <CategoryCard
                      cat={cat}
                      selected={selected}
                      onToggle={toggle}
                      quantities={withQuantity ? quantities : undefined}
                      onQuantityChange={withQuantity ? setQuantity : undefined}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {categories.length === 0 && (
            <EmptyState
              icon={Package}
              title="No categories yet"
              description="Ask your admin to add categories before creating a quotation."
            />
          )}
        </>
      )}

      {/* Sticky summary bar */}
      {!loading && <SummaryBar />}
    </div>
  );
}

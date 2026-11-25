// src/pages/AdminPanel/index.tsx

import { useEffect, useState } from "react";
import { Settings2, LayoutGrid } from "lucide-react";
import AddParentBar from "./AddParentBar";
import CategoryCard from "./CategoryCard";
import FieldsTable from "./FieldsTable";
import EditFieldModal from "./EditFieldModal";
import { PageHeader, StatPill, Segmented, EmptyState, ErrorBanner, Select } from "../../components/ui";
import { useAdminStore } from "../../store/adminStore";
import type { CustomerField, CategoryType } from "../../types";
import { CATEGORY_TYPES } from "./constants";

type ActiveTab = "categories" | "fields";
type TypeFilter = CategoryType | "All";

export default function AdminPanel() {
  const categories = useAdminStore((s) => s.categories);
  const fields = useAdminStore((s) => s.fields);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchCategories = useAdminStore((s) => s.fetchCategories);
  const fieldsLoading = useAdminStore((s) => s.fieldsLoading);
  const fieldsError = useAdminStore((s) => s.fieldsError);
  const fetchFields = useAdminStore((s) => s.fetchFields);

  const [activeTab, setActiveTab] = useState<ActiveTab>("categories");
  const [editField, setEditField] = useState<CustomerField | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

  const visibleCategories =
    typeFilter === "All"
      ? categories
      : categories.filter((c) => c.type === typeFilter);

  useEffect(() => {
    fetchCategories();
    fetchFields();
  }, [fetchCategories, fetchFields]);

  return (
    <div className="flex flex-col gap-7 px-1 pb-10">
      {/* ── Page header ── */}
      <PageHeader
        title="Admin Panel"
        subtitle="Manage categories, child items, and customer field structure."
        actions={
          <>
            <StatPill icon={LayoutGrid} label={`${categories.length} Categories`} />
            <StatPill icon={Settings2} label={`${fields.length} Fields`} accent="var(--color-warning-500)" />
          </>
        }
      />

      {/* ── Tab switcher ── */}
      <Segmented
        ariaLabel="Admin sections"
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { key: "categories", icon: LayoutGrid, label: "Categories" },
          { key: "fields", icon: Settings2, label: "Customer Fields" },
        ]}
      />

      {/* ── Categories tab ── */}
      {activeTab === "categories" && (
        <div className="flex flex-col gap-6">
          <AddParentBar />

          {/* Filter by type */}
          {!loading && categories.length > 0 && (
            <div className="w-full sm:w-56">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                aria-label="Filter categories by type"
                options={[
                  { value: "All", label: "All Types" },
                  ...CATEGORY_TYPES.map((t) => ({ value: t, label: t })),
                ]}
              />
            </div>
          )}

          {/* Error state */}
          {error && <ErrorBanner message={error} onRetry={fetchCategories} />}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border overflow-hidden"
                  style={{
                    background: "var(--color-bg-card)",
                    borderColor: "var(--color-border-light)",
                    minHeight: "240px",
                  }}
                >
                  <div className="h-20 px-6 py-5" style={{ background: "var(--color-bg-input)" }}>
                    <div className="flex items-center gap-3">
                      <div className="skeleton w-12 h-12 rounded-lg" />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="skeleton h-4 w-2/3" />
                        <div className="skeleton h-3 w-1/3" />
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="skeleton h-10" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && categories.length === 0 && (
            <EmptyState
              icon={LayoutGrid}
              title="No categories yet"
              description="Use the bar above to add your first category and start building your catalog."
            />
          )}

          {/* No results for filter */}
          {!loading && categories.length > 0 && visibleCategories.length === 0 && (
            <EmptyState
              icon={LayoutGrid}
              title={`No "${typeFilter}" categories`}
              description="Try a different type filter, or add one with the bar above."
            />
          )}

          {/* Category cards */}
          {!loading && visibleCategories.length > 0 && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleCategories.map((cat, i) => (
                <div
                  key={cat.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 45, 270)}ms` }}
                >
                  <CategoryCard cat={cat} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Fields tab ── */}
      {activeTab === "fields" && (
        <div className="flex flex-col gap-6">
          {/* Error state */}
          {fieldsError && <ErrorBanner message={fieldsError} onRetry={fetchFields} />}

          {/* Loading skeleton */}
          {fieldsLoading && (
            <div
              className="rounded-lg border overflow-hidden"
              style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border-light)" }}
            >
              <div className="h-16 px-6 flex items-center gap-3" style={{ background: "var(--color-bg-input)" }}>
                <div className="skeleton h-5 w-36" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 px-6 flex items-center gap-4 border-t" style={{ borderColor: "var(--color-border-light)" }}>
                  <div className="skeleton h-4 w-4" />
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!fieldsLoading && <FieldsTable onEdit={(field) => setEditField(field)} />}
        </div>
      )}

      {/* ── Edit field modal ── */}
      {editField && (
        <EditFieldModal field={editField} onClose={() => setEditField(null)} />
      )}
    </div>
  );
}

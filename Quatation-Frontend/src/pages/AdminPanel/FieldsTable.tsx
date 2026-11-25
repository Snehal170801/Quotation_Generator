// src/pages/AdminPanel/FieldsTable.tsx

import { useState } from "react";
import { GripVertical, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/adminStore";
import { Badge, Button, ConfirmModal } from "../../components/ui";
import { TYPE_STYLES, PLACEHOLDERS } from "./constants";
import EditFieldModal from "./EditFieldModal";
import type { CustomerField, FieldType } from "../../types";

interface FieldsTableProps {
  onEdit: (field: CustomerField) => void;
}

function TypeBadge({ type }: { type: FieldType }) {
  const s = TYPE_STYLES[type] ?? { bg: "#f1f1f5", color: "#555" };
  return (
    <Badge variant="custom" bg={s.bg} color={s.color}>
      {type}
    </Badge>
  );
}

function RequiredBadge({ required }: { required: boolean }) {
  return (
    <Badge variant={required ? "required" : "optional"}>
      {required ? "● Required" : "○ Optional"}
    </Badge>
  );
}

export default function FieldsTable({ onEdit }: FieldsTableProps) {
  const fields = useAdminStore((s) => s.fields);
  const removeField = useAdminStore((s) => s.removeField);

  const [confirmField, setConfirmField] = useState<CustomerField | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <section
        className="rounded-(--radius-lg) overflow-hidden"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border-light)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="h-18 flex items-center gap-3 px-6"
          style={{ borderBottom: "1px solid var(--color-border-light)" }}
        >
          <div
            className="w-1 h-6 rounded-sm shrink-0"
            style={{ background: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <h2 className="text-[19px] font-semibold flex-1">Customer Fields</h2>
          <Badge variant="primary">{fields.length} Fields</Badge>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            ＋ Add Field
          </Button>
        </div>

        {/* ── Empty state ── */}
        {fields.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-2 py-16"
            style={{ color: "var(--color-text-muted)" }}
          >
            <p className="text-[14px]">No fields yet</p>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              ＋ Add your first field
            </Button>
          </div>
        )}

        {/* ── Desktop table (md+) ── */}
        {fields.length > 0 && (
          <div className="hidden md:block">
            {/* Column headers */}
            <div
              className="grid items-center px-6 h-16
                         text-[14px] font-semibold uppercase tracking-[0.06em]"
              style={{
                gridTemplateColumns:
                  "52px 1fr 130px 140px minmax(180px,1fr) 104px",
                background: "var(--color-bg-input)",
                color: "#8c8c99",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <span>#</span>
              <span>Field Name</span>
              <span>Type</span>
              <span>Required</span>
              <span>Preview</span>
              <span>Actions</span>
            </div>

            {/* Data rows */}
            <div role="table" aria-label="Customer fields">
              {fields.map((field, idx) => (
                <div key={field.id}>
                  <div
                    className="grid items-center px-6 h-16
                               transition-colors duration-150 hover:bg-[#fafbff]"
                    style={{
                      gridTemplateColumns:
                        "52px 1fr 130px 140px minmax(180px,1fr) 104px",
                    }}
                    role="row"
                  >
                    {/* # */}
                    <span
                      className="flex items-center gap-1.5 text-[14px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <GripVertical
                        size={13}
                        color="#c8c8d4"
                        className="cursor-grab select-none"
                      />
                      {idx + 1}
                    </span>

                    {/* Name */}
                    <span className="text-[15px] font-medium">
                      {field.name}
                    </span>

                    {/* Type */}
                    <span>
                      <TypeBadge type={field.type} />
                    </span>

                    {/* Required */}
                    <span>
                      <RequiredBadge required={field.required} />
                    </span>

                    {/* Preview */}
                    <span>
                      <div
                        className="h-10 flex items-center px-3 rounded-md border
                                   text-[14px] max-w-65 overflow-hidden
                                   text-ellipsis whitespace-nowrap"
                        style={{
                          background: "var(--color-bg-input)",
                          borderColor: "var(--color-border)",
                          color: "#aaa",
                        }}
                      >
                        {PLACEHOLDERS[field.type]}
                      </div>
                    </span>

                    {/* Actions */}
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(field)}
                        aria-label={`Edit ${field.name}`}
                        title="Edit"
                        className="w-10 h-10 flex items-center justify-center
                                   rounded-md border cursor-pointer
                                   transition-colors duration-150
                                   hover:bg-primary-light hover:text-primary hover:border-primary
                                   focus-visible:outline-2 focus-visible:outline-primary"
                        style={{
                          background: "var(--color-bg-input)",
                          borderColor: "var(--color-border)",
                          color: "#555",
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => setConfirmField(field)}
                        aria-label={`Delete ${field.name}`}
                        title="Delete"
                        className="w-10 h-10 flex items-center justify-center
                                   rounded-md border cursor-pointer
                                   transition-colors duration-150
                                   hover:bg-danger-light hover:text-danger hover:border-danger
                                   focus-visible:outline-2 focus-visible:outline-danger"
                        style={{
                          background: "var(--color-bg-input)",
                          borderColor: "var(--color-border)",
                          color: "#555",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  </div>

                  {idx < fields.length - 1 && (
                    <div
                      className="mx-6 h-px"
                      style={{ background: "var(--color-border-light)" }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Mobile card list (< md) ── */}
        {fields.length > 0 && (
          <div className="md:hidden flex flex-col">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="flex flex-col gap-3 px-5 py-4"
                style={{
                  borderBottom:
                    idx < fields.length - 1
                      ? "1px solid var(--color-border-light)"
                      : "none",
                }}
              >
                {/* Row 1 — index + name + actions */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-[12px] font-semibold w-6 shrink-0"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-[14px] font-semibold flex-1 truncate">
                    {field.name}
                  </span>
                  <button
                    onClick={() => onEdit(field)}
                    aria-label={`Edit ${field.name}`}
                    className="w-8 h-8 flex items-center justify-center
                               rounded-md border cursor-pointer
                               transition-colors duration-150
                               hover:bg-primary-light hover:text-primary hover:border-primary"
                    style={{
                      background: "var(--color-bg-input)",
                      borderColor: "var(--color-border)",
                      color: "#555",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmField(field)}
                    aria-label={`Delete ${field.name}`}
                    className="w-8 h-8 flex items-center justify-center
                               rounded-md border cursor-pointer
                               transition-colors duration-150
                               hover:bg-danger-light hover:text-danger hover:border-danger"
                    style={{
                      background: "var(--color-bg-input)",
                      borderColor: "var(--color-border)",
                      color: "#555",
                    }}
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Row 2 — badges + preview */}
                <div className="flex items-center gap-2 flex-wrap pl-8">
                  <TypeBadge type={field.type} />
                  <RequiredBadge required={field.required} />
                  <span
                    className="text-[12px] truncate"
                    style={{ color: "#aaa" }}
                  >
                    {PLACEHOLDERS[field.type]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        {fields.length > 0 && (
          <div
            className="h-18 flex items-center px-6"
            style={{
              background: "var(--color-bg-input)",
              borderTop: "1px solid var(--color-border-light)",
            }}
          >
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              ＋ Add Custom Field
            </Button>
          </div>
        )}
      </section>

      {/* ── Add field modal ── */}
      {showAddModal && (
        <EditFieldModal
          field={{ id: -1, name: "", type: "Text", required: false }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* ── Confirm delete modal ── */}
      <ConfirmModal
        isOpen={!!confirmField}
        onClose={() => !deleting && setConfirmField(null)}
        onConfirm={async () => {
          if (!confirmField) return;
          setDeleting(true);
          try {
            await removeField(String(confirmField.id));
            toast.success(`"${confirmField.name}" deleted.`);
          } catch {
            toast.error("Failed to delete field. Please try again.");
          } finally {
            setDeleting(false);
            setConfirmField(null);
          }
        }}
        title="Delete Field"
        description={`Are you sure you want to delete "${confirmField?.name}"? This action cannot be undone.`}
        highlight={confirmField?.name}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
      />
    </>
  );
}

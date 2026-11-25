// src/pages/AdminPanel/CategoryCard.tsx

import { useRef, useState, useEffect } from "react";
import { GripVertical, X, Trash2, Plus, IndianRupee, Pencil, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminStore } from "../../store/adminStore";
import { ConfirmModal } from "../../components/ui";
import AddItemModal from "./AddItemModal";
import type { Category, CategoryItem, CategoryType } from "../../types";

interface CategoryCardProps {
  cat: Category;
}

const TYPE_CONFIG: Record<CategoryType, { color: string; bg: string; border: string }> = {
  Product:  { color: "#7045f7", bg: "#f0edff", border: "#d4c9ff" },
  Hardware: { color: "#f28c1a", bg: "#fff4e6", border: "#ffd9a0" },
  Software: { color: "#1280f7", bg: "#e5f0ff", border: "#b3d1ff" },
  Other:    { color: "#0f8050", bg: "#e6f9f0", border: "#a0dfc0" },
};

interface ConfirmState {
  type: "category" | "item";
  label: string;
  itemId?: string;
}

// ── Inline item name editor ───────────────────────────────────────────────────
interface ItemRowProps {
  item: CategoryItem;
  catId: string;
  cfg: { color: string; bg: string; border: string };
  isLast: boolean;
  onDelete: () => void;
  onPriceChange: (val: string) => void;
}

function ItemRow({ item, catId, cfg, isLast, onDelete, onPriceChange }: ItemRowProps) {
  const updateItemName = useAdminStore((s) => s.updateItemName);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(item.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  async function confirmEdit() {
    const trimmed = editVal.trim();
    if (!trimmed || trimmed === item.name) { setEditing(false); setEditVal(item.name); return; }
    setSaving(true);
    try {
      await updateItemName(catId, item.id, trimmed);
      toast.success(`Renamed to "${trimmed}".`);
    } catch {
      setEditVal(item.name);
      toast.error("Failed to rename item.");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") { setEditVal(item.name); setEditing(false); }
  }

  function handleBlur(e: React.FocusEvent) {
    if (e.relatedTarget?.getAttribute("data-item-confirm")) return;
    confirmEdit();
  }

  return (
    <li
      role="listitem"
      className="group grid items-center px-5 transition-colors duration-100 hover:bg-bg-page"
      style={{
        gridTemplateColumns: "1fr 88px 44px",
        borderBottom: !isLast ? "1px solid var(--color-border-light)" : "none",
        minHeight: "52px",
      }}
    >
      {/* Name — static or editing */}
      <span className="flex items-center gap-2 min-w-0 py-2">
        <GripVertical
          size={12}
          className="shrink-0 cursor-grab select-none opacity-30 group-hover:opacity-60"
          aria-hidden="true"
        />
        {editing ? (
          <input
            ref={inputRef}
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            disabled={saving}
            className="flex-1 text-[13px] rounded px-2 py-0.5 outline-none border min-w-0"
            style={{
              color: "var(--color-text-main)",
              background: "white",
              borderColor: cfg.color + "66",
              boxShadow: `0 0 0 2px ${cfg.color}22`,
              fontFamily: "var(--font-sans)",
            }}
          />
        ) : (
          <span className="text-[14px] truncate" style={{ color: "var(--color-text-main)" }}>
            {item.name}
          </span>
        )}
      </span>

      {/* Price input */}
      <div
        className="flex items-center gap-1 h-8 px-2 rounded border transition-all duration-150 mr-2"
        style={{ background: "var(--color-bg-input)", borderColor: "var(--color-border-light)" }}
      >
        <IndianRupee size={10} className="shrink-0" style={{ color: cfg.color + "99" }} />
        <input
          type="number"
          min="0"
          placeholder="0.00"
          value={item.price}
          onChange={(e) => onPriceChange(e.target.value)}
          aria-label={`Price for ${item.name}`}
          className="w-full text-[13px] outline-none border-none bg-transparent
                     placeholder:text-[#c0c0c8] [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
          style={{ color: "var(--color-text-main)", fontFamily: "var(--font-sans)" }}
        />
      </div>

      {/* Action buttons: edit confirm OR pencil + delete */}
      <div className="flex items-center justify-end gap-1">
        {editing ? (
          <button
            data-item-confirm="true"
            onMouseDown={(e) => e.preventDefault()}
            onClick={confirmEdit}
            disabled={saving}
            title="Confirm rename"
            className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none transition-opacity duration-150"
            style={{ background: cfg.color + "20", color: cfg.color }}
          >
            <Check size={11} />
          </button>
        ) : (
          <>
            <button
              onClick={() => { setEditVal(item.name); setEditing(true); }}
              title={`Edit ${item.name}`}
              aria-label={`Edit ${item.name}`}
              className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none
                         opacity-0 group-hover:opacity-70 hover:opacity-100! transition-opacity duration-150"
              style={{ background: "transparent", color: cfg.color }}
            >
              <Pencil size={11} />
            </button>
            <button
              onClick={onDelete}
              aria-label={`Remove ${item.name}`}
              className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none
                         opacity-0 group-hover:opacity-100 transition-opacity duration-150
                         focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-danger"
              style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
            >
              <X size={10} />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────
export default function CategoryCard({ cat }: CategoryCardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Rename state
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(cat.label);
  const [renameSaving, setRenameSaving] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const removeItem = useAdminStore((s) => s.removeItem);
  const removeCategory = useAdminStore((s) => s.removeCategory);
  const updateItemPrice = useAdminStore((s) => s.updateItemPrice);
  const renameCategory = useAdminStore((s) => s.renameCategory);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  async function handleRenameConfirm() {
    const trimmed = renameVal.trim();
    if (!trimmed || trimmed === cat.label) { setRenaming(false); return; }
    setRenameSaving(true);
    try {
      await renameCategory(cat.id, trimmed);
      toast.success(`Renamed to "${trimmed}".`);
    } catch {
      setRenameVal(cat.label);
      toast.error("Failed to rename. Please try again.");
    } finally {
      setRenameSaving(false);
      setRenaming(false);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleRenameConfirm();
    if (e.key === "Escape") { setRenameVal(cat.label); setRenaming(false); }
  }

  const cfg = TYPE_CONFIG[cat.type] ?? TYPE_CONFIG.Other;

  function handlePriceChange(item: CategoryItem, val: string) {
    updateItemPrice(cat.id, item.id, val).catch(() => {
      toast.error(`Failed to save price for "${item.name}".`);
    });
  }

  async function handleConfirm() {
    if (!confirm) return;
    setDeleting(true);
    try {
      if (confirm.type === "category") {
        await removeCategory(cat.id);
        toast.success(`Category "${cat.label}" deleted.`);
      } else if (confirm.type === "item" && confirm.itemId) {
        await removeItem(cat.id, confirm.itemId);
        toast.success(`"${confirm.label}" removed.`);
      }
    } catch {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  }

  const confirmConfig = {
    item: {
      title: "Delete Item",
      description: `Are you sure you want to delete "${confirm?.label}"? This action cannot be undone.`,
    },
    category: {
      title: "Delete Category",
      description: `Are you sure you want to delete "${confirm?.label}"? All items inside will also be removed. This cannot be undone.`,
    },
  };

  const cfg2 = confirm ? confirmConfig[confirm.type] : null;

  return (
    <>
      <div
        className="flex flex-col rounded-(--radius-lg) overflow-hidden border transition-shadow duration-200 hover:shadow-md"
        style={{
          background: "var(--color-bg-card)",
          borderColor: cfg.border,
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
        }}
      >
        {/* ── Colored header ── */}
        <div
          className="px-6 py-5 shrink-0"
          style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg shrink-0 text-lg"
              style={{
                background: "white",
                border: `1px solid ${cfg.border}`,
                boxShadow: `0 1px 3px ${cfg.color}22`,
              }}
            >
              {cat.icon}
            </div>

            <div className="flex-1 min-w-0">
              {renaming ? (
                <input
                  ref={renameInputRef}
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={(e) => {
                    if (e.relatedTarget?.getAttribute("data-rename-confirm")) return;
                    handleRenameConfirm();
                  }}
                  disabled={renameSaving}
                  className="w-full text-[15px] font-bold rounded px-2 py-0.5 outline-none border"
                  style={{
                    color: cfg.color,
                    background: "white",
                    borderColor: cfg.color + "66",
                    boxShadow: `0 0 0 2px ${cfg.color}22`,
                  }}
                />
              ) : (
                <p className="text-[16px] font-bold truncate" style={{ color: cfg.color }}>
                  {cat.label}
                </p>
              )}
              <p className="text-[13px]" style={{ color: cfg.color + "99" }}>
                {cat.items.length} {cat.items.length === 1 ? "item" : "items"}
              </p>
            </div>

            {/* Rename button */}
            {renaming ? (
              <button
                title="Confirm rename"
                onClick={handleRenameConfirm}
                onMouseDown={(e) => e.preventDefault()}
                data-rename-confirm="true"
                disabled={renameSaving}
                aria-label="Confirm rename"
                className="w-7 h-7 flex items-center justify-center rounded-md
                           cursor-pointer border-none transition-all duration-150
                           opacity-80 hover:opacity-100"
                style={{ background: cfg.color + "22", color: cfg.color }}
              >
                <Check size={14} />
              </button>
            ) : (
              <button
                title="Rename category"
                onClick={() => { setRenameVal(cat.label); setRenaming(true); }}
                aria-label={`Rename ${cat.label}`}
                className="w-7 h-7 flex items-center justify-center rounded-md
                           cursor-pointer border-none transition-all duration-150
                           opacity-50 hover:opacity-100 hover:bg-white
                           focus-visible:outline-2 focus-visible:outline-primary"
                style={{ background: "transparent", color: cfg.color }}
              >
                <Pencil size={13} />
              </button>
            )}

            <button
              title="Delete category"
              onClick={() => setConfirm({ type: "category", label: cat.label })}
              aria-label={`Delete ${cat.label}`}
              className="w-7 h-7 flex items-center justify-center rounded-md
                         cursor-pointer border-none transition-all duration-150
                         opacity-50 hover:opacity-100 hover:bg-danger-light hover:text-danger
                         focus-visible:outline-2 focus-visible:outline-danger"
              style={{ background: "transparent", color: cfg.color }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* ── Column labels ── */}
        <div
          className="grid px-5 h-8 text-[14px] font-semibold uppercase tracking-[0.06em]"
          style={{
            gridTemplateColumns: "1fr 88px 44px",
            background: cfg.bg + "55",
            borderBottom: `1px solid ${cfg.border}`,
            color: cfg.color + "99",
          }}
        >
          <span className="flex items-center gap-1.5">
            <GripVertical size={10} className="opacity-0" aria-hidden />
            Name
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee size={10} />
            Price
          </span>
          <span />
        </div>

        {/* ── Items list ── */}
        <ul className="list-none flex-1 py-1" role="list">
          {cat.items.length === 0 && (
            <li className="px-6 py-5 text-[13px]" style={{ color: "var(--color-text-muted)" }}>
              No items yet
            </li>
          )}

          {cat.items.map((item, idx) => (
            <ItemRow
              key={item.id}
              item={item}
              catId={cat.id}
              cfg={cfg}
              isLast={idx === cat.items.length - 1}
              onDelete={() => setConfirm({ type: "item", label: item.name, itemId: item.id })}
              onPriceChange={(val) => handlePriceChange(item, val)}
            />
          ))}
        </ul>

        {/* ── Footer — Add Item ── */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderTop: `1px solid ${cfg.border}`, background: cfg.bg + "66" }}
        >
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full h-10 flex items-center justify-center gap-2
                       rounded-md border text-[14px] font-semibold
                       transition-all duration-150 cursor-pointer"
            style={{ background: "white", borderColor: cfg.border, color: cfg.color }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = cfg.bg;
              (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.color;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "white";
              (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.border;
            }}
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>
      </div>

      {/* ── Add Item Modal ── */}
      {showAddModal && (
        <AddItemModal
          catId={cat.id}
          catLabel={cat.label}
          accent={cfg.color}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* ── Confirm delete modal ── */}
      {confirm && cfg2 && (
        <ConfirmModal
          isOpen={!!confirm}
          onClose={() => !deleting && setConfirm(null)}
          onConfirm={handleConfirm}
          title={cfg2.title}
          description={cfg2.description}
          highlight={confirm.label}
          confirmLabel={deleting ? "Deleting…" : "Delete"}
          cancelLabel="Cancel"
        />
      )}
    </>
  );
}

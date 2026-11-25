// src/pages/SalesPanel/ProductListCard.tsx

import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { SalesCategory } from "../../store/salesStore";

interface ProductListCardProps {
  cat: SalesCategory;
  selected: Set<string>;
  onToggle: (id: string) => void;
  quantities?: Record<string, number>;
  onQuantityChange?: (id: string, quantity: number) => void;
  quantityLabel?: string;
}

export default function ProductListCard({
  cat,
  selected,
  onToggle,
  quantities,
  onQuantityChange,
  quantityLabel = "Cameras",
}: ProductListCardProps) {
  const selectedCount = cat.items.filter((i) => selected.has(i.id)).length;
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function handleDelete(itemId: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    onToggle(itemId);
  }

  function handleSave(itemId: string) {
    const parsed = Math.max(1, Math.floor(Number(drafts[itemId])) || 1);
    onQuantityChange!(itemId, parsed);
    setDrafts((prev) => ({ ...prev, [itemId]: String(parsed) }));
    setSavedIds((prev) => new Set(prev).add(itemId));
  }

  function handleEdit(itemId: string, currentQuantity: number) {
    setDrafts((prev) => ({ ...prev, [itemId]: String(currentQuantity) }));
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }

  return (
    <section
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
        borderRadius: "var(--radius-lg, 12px)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--color-border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: cat.color,
              flexShrink: 0,
            }}
          />
          <div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--color-text-main)",
                margin: 0,
              }}
            >
              {cat.label}
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginTop: 1,
              }}
            >
              {cat.items.length} {cat.items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {selectedCount > 0 && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 11px",
              borderRadius: 999,
              background: cat.color + "14",
              color: cat.color,
              border: `1px solid ${cat.color}35`,
            }}
          >
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Chip grid */}
      {cat.items.length === 0 ? (
        <p
          style={{
            padding: "18px 24px",
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          No items in this category yet.
        </p>
      ) : (
        <div style={{ padding: "16px 24px 20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 8,
            }}
          >
            {cat.items.map((item) => {
              const isChecked = selected.has(item.id);
              const showQuantity = isChecked && !!onQuantityChange;
              const quantity = quantities?.[item.id] ?? 1;
              const isSaved = showQuantity && savedIds.has(item.id);
              return (
                <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSaved) return; // must use Delete once saved
                      if (isChecked) {
                        setDrafts((prev) => {
                          const next = { ...prev };
                          delete next[item.id];
                          return next;
                        });
                      }
                      onToggle(item.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: isChecked ? 600 : 400,
                      cursor: isSaved ? "default" : "pointer",
                      border: `1px solid ${isChecked ? cat.color + "55" : "var(--color-border-light)"}`,
                      background: isChecked
                        ? cat.color + "12"
                        : "var(--color-bg-input)",
                      color: isChecked ? cat.color : "var(--color-text-main)",
                      transition: "all 0.15s ease",
                      outline: "none",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    {/* Checkbox square */}
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: `1.5px solid ${isChecked ? cat.color : "var(--color-border-light)"}`,
                        background: isChecked ? cat.color : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isChecked && (
                        <Check size={10} color="#fff" strokeWidth={3} />
                      )}
                    </span>
                    <span style={{ lineHeight: 1.3 }}>{item.name}</span>
                  </button>

                  {showQuantity && !isSaved && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 2px",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {quantityLabel}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={drafts[item.id] ?? String(quantity)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(item.id);
                          }}
                          style={{
                            width: 56,
                            padding: "4px 6px",
                            borderRadius: 6,
                            border: "1px solid var(--color-border-light)",
                            background: "var(--color-bg-card)",
                            color: "var(--color-text-main)",
                            fontSize: 12,
                            outline: "none",
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSave(item.id)}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 6,
                          border: "none",
                          background: cat.color,
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )}

                  {isSaved && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                        padding: "4px 2px 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {quantity} {quantityLabel.toLowerCase()}
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          aria-label={`Edit ${item.name}`}
                          onClick={() => handleEdit(item.id, quantity)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: "1px solid var(--color-border-light)",
                            background: "var(--color-bg-input)",
                            color: "var(--color-text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${item.name}`}
                          onClick={() => handleDelete(item.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: "1px solid #fca5a5",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

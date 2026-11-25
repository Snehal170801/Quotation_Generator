// src/pages/AdminPanel/AddItemModal.tsx

import { useState } from "react";
import { IndianRupee, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, Input, Button, ConfirmModal } from "../../components/ui";
import { useAdminStore } from "../../store/adminStore";

interface AddItemModalProps {
  catId: string;
  catLabel: string;
  accent: string;
  onClose: () => void;
}

export default function AddItemModal({ catId, catLabel, accent, onClose }: AddItemModalProps) {
  const addItem = useAdminStore((s) => s.addItem);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [nameError, setNameError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSaveClick() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Item name is required.");
      return;
    }
    setNameError("");
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      await addItem(catId, name.trim(), price.trim());
      toast.success(`"${name.trim()}" added to ${catLabel}.`);
      setShowConfirm(false);
      onClose();
    } catch {
      toast.error("Failed to add item. Please try again.");
      setSaving(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={`Add Item to ${catLabel}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveClick} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Add Item
            </Button>
          </>
        }
      >
        <Input
          label="Item Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSaveClick()}
          placeholder="e.g. Laptops"
          error={nameError}
          required
          autoFocus
          disabled={saving}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold" style={{ color: "#737380" }}>
            Price
            <span className="ml-1 font-normal" style={{ color: "var(--color-text-muted)" }}>
              (optional)
            </span>
          </label>
          <div
            className="flex items-center gap-2 h-9 px-3 rounded-md border transition-all duration-150"
            style={{
              background: "var(--color-bg-input)",
              borderColor: "var(--color-border)",
            }}
          >
            <IndianRupee size={13} className="shrink-0" style={{ color: accent + "99" }} />
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveClick()}
              aria-label="Item price"
              disabled={saving}
              className="flex-1 text-[13px] outline-none border-none bg-transparent
                         placeholder:text-[#c0c0c8] [appearance:textfield]
                         [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
              style={{ color: "var(--color-text-main)", fontFamily: "var(--font-sans)" }}
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Add Item"
        description={`Are you sure you want to add "${name.trim()}" to ${catLabel}?`}
        highlight={name.trim()}
        confirmLabel={saving ? "Adding…" : "Add"}
        cancelLabel="Go Back"
      />
    </>
  );
}

// src/pages/AdminPanel/AddParentBar.tsx

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, ConfirmModal } from "../../components/ui";
import { CATEGORY_TYPES } from "./constants";
import { useAdminStore } from "../../store/adminStore";

type CategoryType = (typeof CATEGORY_TYPES)[number];

export default function AddParentBar() {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("Product");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const addCategory = useAdminStore((s) => s.addCategory);

  function handleSubmitClick() {
    const val = name.trim();
    if (!val) {
      setError("Category name is required.");
      return;
    }
    setError("");
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      await addCategory(name.trim(), type);
      toast.success(`Category "${name.trim()}" added.`);
      setName("");
    } catch {
      toast.error("Failed to add category. Please try again.");
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 p-4 rounded-(--radius-lg) border"
        style={{
          background: "var(--color-bg-card)",
          borderColor: "var(--color-border-light)",
        }}
      >
        <div className="flex-1 min-w-0">
          <Input
            placeholder="e.g. Networking Equipment"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitClick()}
            aria-label="New category name"
            error={error}
            disabled={saving}
          />
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            aria-label="Category type"
            options={CATEGORY_TYPES.map((t) => ({ value: t, label: t }))}
            disabled={saving}
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSubmitClick}
          className="w-full sm:w-auto shrink-0"
          disabled={saving}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
          Add Category
        </Button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Add Category"
        description={`Are you sure you want to add a new "${type}" category named "${name.trim()}"?`}
        highlight={name.trim()}
        confirmLabel={saving ? "Adding…" : "Add"}
        cancelLabel="Go Back"
      />
    </>
  );
}

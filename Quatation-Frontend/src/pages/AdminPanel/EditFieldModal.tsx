// src/pages/AdminPanel/EditFieldModal.tsx

import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, Input, Select, Checkbox, Button, ConfirmModal } from "../../components/ui";
import { useAdminStore } from "../../store/adminStore";
import { FIELD_TYPES } from "./constants";
import type { CustomerField, FieldType } from "../../types";

interface EditFieldModalProps {
  field: CustomerField;
  onClose: () => void;
}

const EMPTY_ID = -1;

export default function EditFieldModal({ field, onClose }: EditFieldModalProps) {
  const updateField = useAdminStore((s) => s.updateField);
  const addField = useAdminStore((s) => s.addField);

  const isNew = field.id === EMPTY_ID;

  const [name, setName] = useState(field.name);
  const [type, setType] = useState<FieldType>(field.type);
  const [required, setRequired] = useState(field.required);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSaveClick() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Field name is required.");
      return;
    }
    setError("");
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      if (isNew) {
        await addField(name.trim(), type, required);
        toast.success(`Field "${name.trim()}" added.`);
      } else {
        await updateField(String(field.id), { name: name.trim(), type, required });
        toast.success(`Field "${name.trim()}" updated.`);
      }
      setShowConfirm(false);
      onClose();
    } catch {
      toast.error(`Failed to ${isNew ? "add" : "update"} field. Please try again.`);
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={isNew ? "Add Field" : "Edit Field"}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveClick} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isNew ? "Add Field" : "Save Changes"}
            </Button>
          </>
        }
      >
        <Input
          label="Field Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSaveClick()}
          placeholder="e.g. Company Name"
          error={error}
          required
          autoFocus
          disabled={saving}
        />

        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as FieldType)}
          options={FIELD_TYPES.map((t) => ({ value: t, label: t }))}
          disabled={saving}
        />

        <div
          className="flex items-center justify-between px-3 rounded-md border"
          style={{ background: "var(--color-bg-input)", borderColor: "var(--color-border)" }}
        >
          <span className="text-[11px] font-semibold" style={{ color: "#737380" }}>
            Mark as Required
          </span>
          <Checkbox
            checked={required}
            onChange={setRequired}
            label={required ? "Yes" : "No"}
            disabled={saving}
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => !saving && setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={isNew ? "Add Field" : "Save Changes"}
        description={
          isNew
            ? `Are you sure you want to add a new field "${name.trim()}"?`
            : `Are you sure you want to save changes to "${name.trim()}"?`
        }
        highlight={name.trim()}
        confirmLabel={saving ? (isNew ? "Adding…" : "Saving…") : (isNew ? "Add" : "Save")}
        cancelLabel="Go Back"
      />
    </>
  );
}

// src/components/ui/ConfirmModal.tsx

import type { ReactNode } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

type ConfirmVariant = "danger" | "confirm";

interface VariantConfig {
  icon: ReactNode;
  iconBg: string;
  iconRing: string;
  confirmBtn: "danger" | "primary";
  accent: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  highlight?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

const VARIANT_CONFIG: Record<ConfirmVariant, VariantConfig> = {
  danger: {
    icon: <Trash2 size={18} />,
    iconBg: "linear-gradient(135deg, #fff1f1 0%, #ffe4e4 100%)",
    iconRing: "rgba(224,51,51,0.12)",
    confirmBtn: "danger",
    accent: "var(--color-danger)",
  },
  confirm: {
    icon: <CheckCircle2 size={18} />,
    iconBg: "linear-gradient(135deg, #f0edff 0%, #e4d9ff 100%)",
    iconRing: "rgba(112,69,247,0.12)",
    confirmBtn: "primary",
    accent: "var(--color-primary)",
  },
};

function resolveVariant(
  confirmLabel?: string,
  variant?: ConfirmVariant,
): ConfirmVariant {
  if (variant) return variant;
  const label = (confirmLabel ?? "").toLowerCase();
  if (label === "delete" || label === "remove") return "danger";
  return "confirm";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  highlight,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant,
}: ConfirmModalProps) {
  const resolved = resolveVariant(confirmLabel, variant);
  const vcfg = VARIANT_CONFIG[resolved];
  const parts = highlight ? description.split(highlight) : [description];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} className="min-w-22">
            {cancelLabel}
          </Button>
          <Button
            variant={vcfg.confirmBtn}
            onClick={onConfirm}
            className="min-w-22"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5 py-3 px-1 text-center">
        {/* ── Icon ── */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute w-16 h-16 rounded-full"
            style={{ background: vcfg.iconRing }}
          />
          {/* Inner circle */}
          <div
            className="relative w-12 h-12 flex items-center justify-center rounded-full"
            style={{
              background: vcfg.iconBg,
              boxShadow: `0 2px 12px ${vcfg.iconRing}`,
            }}
          >
            <span style={{ color: vcfg.accent }}>{vcfg.icon}</span>
          </div>
        </div>

        {/* ── Text ── */}
        <div className="flex flex-col gap-1.5 max-w-65">
          <p
            className="text-[15px] font-bold leading-snug"
            style={{ color: "var(--color-text-main)" }}
          >
            {title}
          </p>

          <p
            className="text-[12.5px] leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            {highlight
              ? parts.map((part, i) =>
                  i < parts.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span
                        className="font-semibold px-0.5 rounded-sm"
                        style={{
                          color: vcfg.accent,
                          background: vcfg.iconRing,
                        }}
                      >
                        {highlight}
                      </span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )
              : description}
          </p>
        </div>

        {/* ── Divider ── */}
        <div
          className="w-full h-px"
          style={{ background: "var(--color-border-light)" }}
          aria-hidden="true"
        />
      </div>
    </Modal>
  );
}

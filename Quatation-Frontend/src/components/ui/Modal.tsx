import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
}

const SIZES: Record<ModalSize, string> = {
  sm: "max-w-[360px]",
  md: "max-w-[480px]",
  lg: "max-w-[640px]",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-20000 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(10,8,20,0.55)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={
        closeOnBackdrop
          ? (e) => e.target === e.currentTarget && onClose()
          : undefined
      }
    >
      <div
        className={cn(
          "w-full rounded-xl overflow-hidden animate-scale-in",
          "flex flex-col",
          SIZES[size],
        )}
        style={{
          background: "var(--color-bg-card)",
          boxShadow: "var(--shadow-2xl)",
          border: "1px solid var(--color-border-light)",
        }}
      >
        {title && (
          <div
            className="h-14 flex items-center justify-between px-5 shrink-0"
            style={{ borderBottom: "1px solid var(--color-border-light)" }}
          >
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--color-text-main)" }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 flex items-center justify-center
                         rounded-md border-none cursor-pointer
                         transition-colors duration-150
                         hover:bg-(--color-bg-hover)
                         focus-visible:outline-2
                         focus-visible:outline-primary"
              style={{
                background: "transparent",
                color: "var(--color-text-muted)",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="p-5 flex flex-col gap-3 overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-5 py-4 shrink-0"
            style={{
              borderTop: "1px solid var(--color-border-light)",
              background: "var(--color-bg-input)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

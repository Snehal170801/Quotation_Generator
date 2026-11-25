// src/components/ui/EmptyState.tsx

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Render inside a bordered card surface (default true) */
  bordered?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  bordered = true,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center"
      style={
        bordered
          ? {
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border-light)",
              borderRadius: "var(--radius-lg)",
            }
          : undefined
      }
    >
      <div
        className="w-14 h-14 flex items-center justify-center rounded-full"
        style={{
          background: "var(--color-primary-50)",
          color: "var(--color-primary)",
        }}
      >
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold" style={{ color: "var(--color-text-main)" }}>
          {title}
        </p>
        {description && (
          <p className="text-[13px] max-w-xs" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

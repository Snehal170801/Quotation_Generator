// src/components/ui/Badge.tsx

import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

type BadgeVariant =
  | "primary"
  | "required"
  | "optional"
  | "count"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "custom";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  // For "custom" variant — pass colors directly
  bg?: string;
  color?: string;
}

const BASE = `
  inline-flex items-center justify-center gap-1
  text-[11px] font-semibold leading-none
  px-2.5 py-1 rounded-full
`;

const VARIANTS: Record<BadgeVariant, string> = {
  primary:  "bg-[var(--color-primary-50)] text-[var(--color-primary)]",
  required: "bg-[var(--color-warning-50)] text-[var(--color-warning-700)]",
  optional: "bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
  count:    "bg-[rgba(255,255,255,0.2)] text-white",
  success:  "bg-[var(--color-success-50)] text-[var(--color-success-600)]",
  danger:   "bg-[var(--color-danger-50)] text-[var(--color-danger-600)]",
  warning:  "bg-[var(--color-warning-50)] text-[var(--color-warning-600)]",
  info:     "bg-[var(--color-info-50)] text-[var(--color-info-600)]",
  custom:   "",
};

export default function Badge({
  variant = "primary",
  children,
  className,
  bg,
  color,
}: BadgeProps) {
  return (
    <span
      className={cn(BASE, VARIANTS[variant], className)}
      style={
        variant === "custom" && bg && color
          ? { background: bg, color }
          : undefined
      }
    >
      {children}
    </span>
  );
}

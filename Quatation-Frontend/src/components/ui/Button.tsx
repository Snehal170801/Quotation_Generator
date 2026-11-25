// src/components/ui/Button.tsx

import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from "react";

type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

const BASE = `
  group relative inline-flex items-center justify-center gap-1.5
  font-semibold cursor-pointer border rounded-[var(--radius-lg)]
  transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]
  whitespace-nowrap select-none
  focus-visible:outline-2
  focus-visible:outline-[var(--color-primary)]
  focus-visible:outline-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  active:scale-[0.97]
`;

const VARIANTS: Record<ButtonVariant, string> = {
  primary: `
    text-white border-transparent
    hover:brightness-[1.06]
  `,
  outline: `
    bg-white
    text-[var(--color-primary)]
    border-[var(--color-border-strong)]
    hover:border-[var(--color-primary)]
    hover:bg-[var(--color-primary-50)]
  `,
  ghost: `
    bg-transparent
    text-[var(--color-text-secondary)]
    border-transparent
    hover:bg-[var(--color-bg-hover)]
    hover:text-[var(--color-text-main)]
  `,
  danger: `
    text-white border-transparent
    hover:brightness-[1.06]
    focus-visible:outline-[var(--color-danger)]
  `,
};

const VARIANT_STYLE: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #7045f7 0%, #5d35d4 100%)",
    boxShadow: "0 1px 2px rgba(16,24,40,0.05), 0 4px 12px rgba(112,69,247,0.25)",
  },
  danger: {
    background: "linear-gradient(135deg, #e84545 0%, #c62828 100%)",
    boxShadow: "0 1px 2px rgba(16,24,40,0.05), 0 4px 12px rgba(224,51,51,0.22)",
  },
  outline: { boxShadow: "0 1px 2px rgba(16,24,40,0.04)" },
  ghost: {},
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8  px-3.5 text-[12px]",
  md: "h-10 px-4   text-[13px]",
  lg: "h-11 px-5   text-[14px]",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      style={{ ...VARIANT_STYLE[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

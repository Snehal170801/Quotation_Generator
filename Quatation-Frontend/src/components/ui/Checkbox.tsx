// src/components/ui/Checkbox.tsx

import { cn } from "../../utils/cn";
import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  className?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  color,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const accentColor = color ?? "var(--color-primary)";

  return (
    <label
      className={cn(
        "flex items-center gap-2 min-h-10 py-2.5 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <span
        className="w-4.5 h-4.5 flex items-center justify-center rounded-[5px] border shrink-0 transition-[background,border-color,transform] duration-150"
        style={{
          background: checked ? accentColor : "var(--color-bg-input)",
          borderColor: checked ? accentColor : "var(--color-border-strong)",
          transform: checked ? "scale(1)" : "scale(1)",
          boxShadow: checked ? `0 2px 6px ${accentColor}55` : "none",
        }}
        aria-hidden="true"
      >
        {checked && <Check size={12} strokeWidth={3} className="text-white animate-scale-in" />}
      </span>

      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={label}
        {...props}
      />

      {label && (
        <span
          className={cn(
            "text-[13px] transition-colors duration-150",
            checked ? "font-semibold" : "font-normal",
          )}
          style={{ color: checked ? accentColor : "#333338" }}
        >
          {label}
        </span>
      )}
    </label>
  );
}

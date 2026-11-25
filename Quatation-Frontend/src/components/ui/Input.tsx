import { cn } from "../../utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const INPUT_BASE = `
  h-10 px-3.5 text-[13px]
  rounded-[var(--radius-md)] border outline-none w-full
  transition-[border-color,box-shadow,background] duration-150
  placeholder:text-[#bfbfc7]
  hover:border-[var(--color-border-strong)]
  focus:border-primary focus:bg-white
  focus:shadow-[0_0_0_3px_rgba(112,69,247,0.14)]
  disabled:opacity-50 disabled:cursor-not-allowed
`;

export default function Input({
  label,
  error,
  required,
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "")}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-semibold"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {label}
          {required && (
            <span
              className="ml-0.5"
              style={{ color: "var(--color-danger)" }}
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          INPUT_BASE,
          error
            ? "border-danger focus:shadow-[0_0_0_3px_rgba(224,51,51,0.12)]"
            : "",
          className,
        )}
        style={{
          background: "var(--color-bg-input)",
          borderColor: error ? "var(--color-danger)" : "var(--color-border)",
          color: "var(--color-text-main)",
          fontFamily: "var(--font-sans)",
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <span
          id={`${inputId}-error`}
          className="text-[11px]"
          style={{ color: "var(--color-danger)" }}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}

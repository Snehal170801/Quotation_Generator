import { cn } from "../../utils/cn";
import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  options: SelectOption[];
}
const SELECT_BASE = `
  h-10 px-3.5 text-[13px] leading-[1]
  rounded-[var(--radius-md)] border outline-none w-full
  cursor-pointer appearance-none
  overflow-hidden whitespace-nowrap text-ellipsis
  transition-[border-color,box-shadow,background] duration-150
  hover:border-[var(--color-border-strong)]
  focus:border-primary focus:bg-white
  focus:shadow-[0_0_0_3px_rgba(112,69,247,0.14)]
  disabled:opacity-50 disabled:cursor-not-allowed
`;

export default function Select({
  label,
  error,
  required,
  fullWidth = true,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "")}>
      {label && (
        <label
          htmlFor={selectId}
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

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            SELECT_BASE,
            error
              ? "border-danger focus:shadow-[0_0_0_3px_rgba(224,51,51,0.12)]"
              : "",
            "pr-8",
            className,
          )}
          style={{
            background: "var(--color-bg-input)",
            borderColor: error ? "var(--color-danger)" : "var(--color-border)",
            color: "var(--color-text-main)",
            fontFamily: "var(--font-sans)",
            height: 40,
            lineHeight: "40px",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-muted)" }}
          aria-hidden="true"
        />
      </div>

      {error && (
        <span
          id={`${selectId}-error`}
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

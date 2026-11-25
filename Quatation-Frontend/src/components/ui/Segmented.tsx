// src/components/ui/Segmented.tsx

import type { LucideIcon } from "lucide-react";

export interface SegmentOption<T extends string> {
  key: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-[var(--radius-lg)] w-fit"
      style={{ background: "var(--color-bg-input)", border: "1px solid var(--color-border-light)" }}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className="flex items-center gap-2 px-5 h-9 rounded-[var(--radius-md)] text-[13px]
                       font-semibold cursor-pointer border-none
                       transition-all duration-200 ease-[cubic-bezier(0.25,1,0.5,1)]
                       focus-visible:outline-2 focus-visible:outline-primary"
            style={{
              background: active ? "var(--color-bg-card)" : "transparent",
              color: active ? "var(--color-primary)" : "var(--color-text-muted)",
              boxShadow: active ? "var(--shadow-sm)" : "none",
            }}
          >
            {Icon && <Icon size={15} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

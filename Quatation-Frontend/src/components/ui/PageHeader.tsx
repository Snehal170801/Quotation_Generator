// src/components/ui/PageHeader.tsx

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned slot — stat pills, actions, etc. */
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
      <div>
        <h1
          className="text-[26px] sm:text-[30px] font-bold tracking-tight"
          style={{ color: "var(--color-text-main)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
    </header>
  );
}

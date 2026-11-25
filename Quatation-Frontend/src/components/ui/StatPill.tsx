// src/components/ui/StatPill.tsx

import type { LucideIcon } from "lucide-react";

interface StatPillProps {
  icon: LucideIcon;
  label: string;
  /** Optional accent for the icon */
  accent?: string;
}

export default function StatPill({ icon: Icon, label, accent }: StatPillProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 h-10 rounded-full text-[13px] font-semibold border"
      style={{
        background: "var(--color-bg-card)",
        borderColor: "var(--color-border-light)",
        color: "var(--color-text-secondary)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <Icon size={14} style={{ color: accent ?? "var(--color-primary)" }} />
      {label}
    </div>
  );
}

// src/components/layout/NavItem.tsx
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import type { PageKey } from "../../types";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  page: PageKey;
  collapsed?: boolean;
}

const EASE = "cubic-bezier(0.25, 1, 0.5, 1)";
const ACTIVE_GRADIENT = "linear-gradient(135deg, #7045f7 0%, #5d35d4 100%)";
const ACTIVE_SHADOW = "0 6px 16px rgba(112, 69, 247, 0.40)";

export default function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed,
}: NavItemProps) {
  const [hovered, setHovered] = useState(false);

  // ── COLLAPSED ──────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "2px 0" }}>
        <button
          onClick={onClick}
          aria-current={active ? "page" : undefined}
          aria-label={label}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            transition: `all 0.25s ${EASE}`,
            background: active
              ? ACTIVE_GRADIENT
              : hovered
                ? "rgba(255,255,255,0.08)"
                : "transparent",
            boxShadow: active ? ACTIVE_SHADOW : "none",
            color: active ? "#ffffff" : hovered ? "#c4b2ff" : "rgba(180,170,220,0.65)",
            transform: hovered && !active ? "scale(1.06)" : "scale(1)",
          }}
        >
          <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
        </button>

        {/* Custom tooltip */}
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: "calc(100% + 4px)",
            top: "50%",
            transform: `translateY(-50%) translateX(${hovered ? "0" : "-4px"})`,
            background: "#0f0d18",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            padding: "6px 10px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: hovered ? 1 : 0,
            transition: `opacity 0.18s ${EASE}, transform 0.18s ${EASE}`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            zIndex: 200,
          }}
        >
          {label}
        </span>
      </div>
    );
  }

  // ── EXPANDED ───────────────────────────────────────────
  return (
    <div style={{ position: "relative", margin: "0 12px" }}>
      {/* Left active accent bar */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-12px",
          top: "50%",
          height: active ? "20px" : "0px",
          width: "3px",
          borderRadius: "0 3px 3px 0",
          background: "#a585fb",
          transform: "translateY(-50%)",
          transition: `height 0.25s ${EASE}`,
        }}
      />
      <button
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "11px 14px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: active ? 600 : 500,
          whiteSpace: "nowrap",
          transition: `background 0.22s ${EASE}, color 0.22s ${EASE}, box-shadow 0.22s ${EASE}`,
          background: active
            ? ACTIVE_GRADIENT
            : hovered
              ? "rgba(255,255,255,0.06)"
              : "transparent",
          color: active ? "#ffffff" : hovered ? "#c4b2ff" : "rgba(180,170,220,0.72)",
          boxShadow: active ? ACTIVE_SHADOW : "none",
        }}
      >
        <span
          style={{
            minWidth: "20px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "inherit",
            transition: `transform 0.25s ${EASE}`,
            transform: hovered && !active ? "scale(1.1)" : "scale(1)",
            flexShrink: 0,
          }}
        >
          <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
        </span>
        <span style={{ marginLeft: "13px" }}>{label}</span>
      </button>
    </div>
  );
}

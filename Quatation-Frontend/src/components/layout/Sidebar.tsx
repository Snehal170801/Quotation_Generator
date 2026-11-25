// src/components/layout/Sidebar.tsx
import { useState } from "react";
import { LayoutDashboard, FileText, Settings, LogOut, AlertCircle, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavItem from "./NavItem";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import { usePermissions } from "../../hooks/usePermissions";
import type { PageKey } from "../../types";

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  collapsed: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean;
}

const EASE = "cubic-bezier(0.25, 1, 0.5, 1)";
const BRAND_GRADIENT = "linear-gradient(135deg, #7045f7 0%, #5d35d4 100%)";

const ALL_NAV_ITEMS: { key: PageKey; icon: typeof LayoutDashboard; label: string; adminOnly?: boolean }[] = [
  { key: "admin",    icon: LayoutDashboard, label: "Admin Panel",  adminOnly: true },
  { key: "sales",    icon: FileText,        label: "Sales Panel" },
  { key: "orders",   icon: ClipboardList,   label: "Orders" },
  { key: "settings", icon: Settings,        label: "Settings" },
];

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  isMobile = false,
  mobileOpen = false,
}: SidebarProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const role = useAuthStore((s) => s.user?.role);
  const companyName = useSettingsStore((s) => s.company.name);
  const perms = usePermissions();

  const showLabels = isMobile ? true : !collapsed;
  const [showConfirm, setShowConfirm] = useState(false);

  const navItems = ALL_NAV_ITEMS.filter((i) => {
    if (i.adminOnly && role !== "admin") return false;
    if (i.key === "sales" && !perms.canAccessSalesPanel) return false;
    if (i.key === "orders" && !perms.canViewOrders) return false;
    return true;
  });
  const logoLetter = companyName.charAt(0).toUpperCase() || "D";

  return (
    <>
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.20)",
              padding: "24px",
              width: "90%",
              maxWidth: "400px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ padding: "12px", background: "#fee2e2", borderRadius: "50%", display: "flex" }}>
                <AlertCircle size={24} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
                Confirm Logout
              </h3>
            </div>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
              Are you sure you want to log out? You will need to sign in again to access your data.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 16px", fontSize: "14px", fontWeight: 500,
                  color: "#374151", background: "#f3f4f6", border: "none",
                  borderRadius: "8px", cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
              >
                Cancel
              </button>
              <button
                onClick={() => { clearAuth(); navigate("/login", { replace: true }); }}
                style={{
                  padding: "8px 16px", fontSize: "14px", fontWeight: 500,
                  color: "#fff", background: "#dc2626", border: "none",
                  borderRadius: "8px", cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#b91c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#dc2626")}
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      <aside
        aria-label="Sidebar navigation"
        style={{
          position: "fixed",
          top: isMobile ? 0 : "10px",
          left: isMobile ? (mobileOpen ? 0 : "-260px") : "10px",
          bottom: isMobile ? 0 : "10px",
          zIndex: 100,
          width: isMobile ? "210px" : collapsed ? "97px" : "210px",
          display: "flex",
          flexDirection: "column",
          borderRadius: isMobile ? "0 16px 16px 0" : "16px",
          background: "linear-gradient(180deg, #221d36 0%, #1a1628 100%)",
          boxShadow: "0 8px 32px rgba(15, 13, 24, 0.35)",
          overflow: "hidden",
          transition: `width 0.3s ${EASE}, left 0.3s ${EASE}`,
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: collapsed && !isMobile ? "20px 0" : "20px 15px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          {showLabels ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: BRAND_GRADIENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                  boxShadow: "0 6px 16px rgba(112,69,247,0.40)",
                }}
              >
                {logoLetter}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {companyName || "Daccess Systems"}
                </div>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#c4b2ff",
                  background: "rgba(112,69,247,0.18)",
                  border: "1px solid rgba(112,69,247,0.35)",
                  borderRadius: "5px",
                  padding: "2px 6px",
                  flexShrink: 0,
                  letterSpacing: "0.02em",
                }}
              >
                v1.0
              </span>
            </div>
          ) : (
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: BRAND_GRADIENT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "white",
                boxShadow: "0 6px 16px rgba(112,69,247,0.40)",
              }}
            >
              {logoLetter}
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav
          aria-label="Main navigation"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 0",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {showLabels && (
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(180,170,220,0.40)",
                padding: "0 26px",
                margin: "0 0 8px",
              }}
            >
              Menu
            </p>
          )}
          {navItems.map((item) => (
            <NavItem
              key={item.key}
              page={item.key}
              icon={item.icon}
              label={item.label}
              active={activePage === item.key}
              onClick={() => onNavigate(item.key)}
              collapsed={collapsed && !isMobile}
            />
          ))}
        </nav>

        {/* Logout */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "10px 0",
            flexShrink: 0,
          }}
        >
          <div style={{ margin: "0 12px" }}>
            <button
              title="Logout"
              aria-label="Logout"
              onClick={() => setShowConfirm(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                padding: "12px 15px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(180,170,220,0.55)",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)";
                e.currentTarget.style.color = "#f87171";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(180,170,220,0.55)";
              }}
            >
              <span
                style={{
                  minWidth: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: collapsed && !isMobile ? "0" : "0.75rem",
                  flexShrink: 0,
                }}
              >
                <LogOut size={20} />
              </span>
              {showLabels && (
                <span style={{ marginLeft: "15px", whiteSpace: "nowrap" }}>
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

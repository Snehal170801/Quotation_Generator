// src/components/layout/Navbar.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  ChevronRight,
  Power,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { PageKey } from "../../types";
import { useAuthStore } from "../../store/authStore";
import { orderService, type Order } from "../../services/orderService";

const PAGE_LABELS: Record<PageKey, string> = {
  admin: "Admin Panel",
  sales: "Sales Panel",
  orders: "Orders",
  settings: "Settings",
};

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
  navbarLeft: number;
  activePage: PageKey;
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Navbar({
  collapsed,
  onToggle,
  navbarLeft,
  activePage,
}: NavbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [bellLoading, setBellLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setShowDropdown(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setShowBell(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleBellOpen() {
    const next = !showBell;
    setShowBell(next);
    if (next) {
      setBellLoading(true);
      try {
        const data = await orderService.getAll();
        setRecentOrders(data);
      } catch {
        /* silent */
      } finally {
        setBellLoading(false);
      }
    }
  }

  return (
    <>
      {/* Logout modal */}
      {showLogoutModal && (
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  background: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                }}
              >
                <AlertCircle size={24} color="#dc2626" />
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Confirm Logout
              </h3>
            </div>
            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to log out? You will need to sign in again
              to access your data.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f3f4f6")
                }
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAuth();
                  setShowLogoutModal(false);
                  navigate("/login", { replace: true });
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#b91c1c")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#dc2626")
                }
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav
        aria-label="Top navigation"
        style={{
          position: "fixed",
          top: "10px",
          left: `${navbarLeft}px`,
          right: "10px",
          zIndex: 1000,
          height: "70px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          padding: "0 20px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #221d36 0%, #1a1628 100%)",
          boxShadow: "0 8px 32px rgba(15, 13, 24, 0.30)",
          transition: "left 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            style={{
              background: "none",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              borderRadius: "8px",
              color: "rgba(180,170,220,0.70)",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "rgba(180,170,220,0.70)";
            }}
          >
            <Menu size={22} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "13px",
                color: "rgba(180,170,220,0.45)",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              Quotation
            </span>
            <ChevronRight
              size={13}
              strokeWidth={2}
              color="rgba(180,170,220,0.30)"
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "14px",
                color: "#ffffff",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {PAGE_LABELS[activePage]}
            </span>
          </div>
        </div>

        {/* Middle spacer */}
        <div />

        {/* Right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifySelf: "end",
          }}
        >
          {/* Bell with dropdown */}
          <div style={{ position: "relative" }} ref={bellRef}>
            <button
              aria-label="Notifications"
              onClick={handleBellOpen}
              style={{
                background: showBell ? "rgba(255,255,255,0.08)" : "none",
                border: "none",
                cursor: "pointer",
                color: showBell ? "#ffffff" : "rgba(180,170,220,0.65)",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                position: "relative",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                if (!showBell) {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "rgba(180,170,220,0.65)";
                }
              }}
            >
              <Bell size={20} />
              {recentOrders.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "7px",
                    right: "7px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#f87171",
                    border: "1.5px solid #1E1B2E",
                  }}
                />
              )}
            </button>

            {showBell && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "52px",
                  width: "320px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  border: "1px solid #e5e7eb",
                  zIndex: 1001,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "480px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      All Orders
                    </span>
                    {recentOrders.length > 0 && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          background: "#f0edff",
                          color: "#7045f7",
                          borderRadius: "999px",
                          padding: "1px 7px",
                        }}
                      >
                        {recentOrders.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowBell(false);
                      navigate("/orders");
                    }}
                    style={{
                      fontSize: "12px",
                      color: "#7045f7",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Open page →
                  </button>
                </div>
                {/* Scrollable list */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {bellLoading && (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "13px",
                      }}
                    >
                      Loading…
                    </div>
                  )}
                  {!bellLoading && recentOrders.length === 0 && (
                    <div style={{ padding: "32px 24px", textAlign: "center" }}>
                      <ClipboardList
                        size={28}
                        color="#d1d5db"
                        style={{ margin: "0 auto 8px" }}
                      />
                      <p
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                          margin: 0,
                        }}
                      >
                        No orders yet
                      </p>
                    </div>
                  )}
                  {!bellLoading &&
                    recentOrders.map((o, idx) => (
                      <button
                        key={o._id}
                        onClick={() => {
                          setShowBell(false);
                          navigate("/orders");
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          background: "none",
                          border: "none",
                          borderBottom:
                            idx < recentOrders.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background:
                              o.status === "saved" ? "#e6f9f0" : "#fff3e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {o.status === "saved" ? (
                            <CheckCircle2 size={15} color="#0f8050" />
                          ) : (
                            <Clock size={15} color="#f28c1a" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: "#111827",
                              margin: "0 0 2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {o.quotationNumber}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            {formatCurrency(o.total)} · {timeAgo(o.createdAt)}
                            {o.createdBy && typeof o.createdBy === "object" && (
                              <span
                                style={{ marginLeft: "4px", color: "#c4b5fd" }}
                              >
                                · {o.createdBy.name}
                              </span>
                            )}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: "999px",
                            flexShrink: 0,
                            background:
                              o.status === "saved" ? "#e6f9f0" : "#fff3e0",
                            color: o.status === "saved" ? "#0f8050" : "#f28c1a",
                          }}
                        >
                          {o.status}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "24px",
              background: "rgba(255,255,255,0.08)",
              margin: "0 4px",
            }}
          />

          {/* User dropdown */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 10px",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #7045f7 0%, #5d35d4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  border: "2px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 2px 8px rgba(112,69,247,0.35)",
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name ?? "User"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(180,170,220,0.60)",
                    lineHeight: 1.3,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role ?? ""}
                </div>
              </div>
            </button>

            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "52px",
                  minWidth: "240px",
                  background: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  border: "1px solid #e5e7eb",
                  zIndex: 1001,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "4px",
                    }}
                  >
                    Signed in as
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151" }}>
                    {user?.email ?? ""}
                  </div>
                </div>
                <div style={{ padding: "8px" }}>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#dc2626",
                      fontSize: "14px",
                      fontWeight: 600,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fef2f2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Power size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

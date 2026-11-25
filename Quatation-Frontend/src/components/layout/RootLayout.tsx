import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import type { PageKey } from "../../types";

const PAGE_KEYS: PageKey[] = ["admin", "sales", "orders", "settings"];

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        setCollapsed(true);
        setMobileOpen(false);
      }
    };
    update(mq.matches);
    const handler = (e: MediaQueryListEvent) => update(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const rawPath = location.pathname.replace(/^\//, "") || "admin";
  const activePage = (
    PAGE_KEYS.includes(rawPath as PageKey) ? rawPath : "admin"
  ) as PageKey;

  function handleNavigate(page: PageKey) {
    navigate(`/${page}`);
    if (isMobile) setMobileOpen(false);
  }

  function handleToggle() {
    if (isMobile) setMobileOpen((v) => !v);
    else setCollapsed((v) => !v);
  }

  // Match sidebar: collapsed=97px, expanded=210px, margin=10px each side
  const sidebarWidth = collapsed ? 97 : 210;
  const MARGIN = 10;
  const offset = isMobile ? 0 : MARGIN + sidebarWidth + MARGIN;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-page)" }}>
      {/* Mask strip: covers the gap around the floating navbar (top/right margins,
          and the gap between sidebar and navbar) so scrolled page content can never
          peek through behind/around the navbar's rounded corners. Starts exactly where
          the navbar starts (matches navbarLeft) so it never touches the sidebar. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: `${isMobile ? MARGIN : offset}px`,
          right: 0,
          height: "90px", // 10px top margin + 70px navbar height + 10px breathing room
          background: "var(--color-bg-page)",
          zIndex: 999,
          transition: "left 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      />

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(0,0,0,0.50)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
      />

      <Navbar
        collapsed={collapsed}
        onToggle={handleToggle}
        navbarLeft={isMobile ? MARGIN : offset}
        activePage={activePage}
      />

      <main
        role="main"
        aria-label="Main content"
        style={{
          marginLeft: `${isMobile ? 0 : offset}px`,
          marginTop: "0",
          paddingTop: "90px",
          paddingLeft: isMobile ? "16px" : "24px",
          paddingRight: isMobile ? "16px" : "24px",
          paddingBottom: "40px",
          minHeight: "100vh",
          transition: "margin-left 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <div key={activePage} className="animate-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

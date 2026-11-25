// src/pages/Settings/index.tsx

import { useEffect, useState } from "react";
import { Building2, FileText, Lock, Users } from "lucide-react";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuthStore } from "../../store/authStore";
import CompanyProfileTab from "./CompanyProfileTab";
import QuotationSettingsTab from "./QuotationSettingsTab";
import ChangePasswordTab from "./ChangePasswordTab";
import UserManagementTab from "./UserManagementTab";
import { PageHeader } from "../../components/ui";

type Tab = "company" | "quotation" | "password" | "users";

const ADMIN_TABS: { key: Tab; icon: typeof Building2; label: string }[] = [
  { key: "company",   icon: Building2, label: "Company Profile" },
  { key: "quotation", icon: FileText,  label: "Quotation Settings" },
  { key: "users",     icon: Users,     label: "User Management" },
  { key: "password",  icon: Lock,      label: "Change Password" },
];

const SALES_TABS: { key: Tab; icon: typeof Building2; label: string }[] = [
  { key: "password",  icon: Lock,      label: "Change Password" },
];

export default function SettingsPage() {
  const role = useAuthStore((s) => s.user?.role);
  const TABS = role === "admin" ? ADMIN_TABS : SALES_TABS;
  const [activeTab, setActiveTab] = useState<Tab>(role === "admin" ? "company" : "password");
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="flex flex-col gap-7 px-1 pb-10">
      {/* ── Page header ── */}
      <PageHeader
        title="Settings"
        subtitle="Manage company profile, quotation defaults, and account security."
      />

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-7">
        {/* ── Sidebar nav (horizontal scroll on mobile, vertical on desktop) ── */}
        <nav
          className="flex lg:flex-col gap-1 shrink-0 w-full lg:w-52 overflow-x-auto pb-1 lg:pb-0
                     -mx-1 px-1 lg:mx-0 lg:px-0"
          aria-label="Settings sections"
        >
          {TABS.map(({ key, icon: Icon, label }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium
                           text-left cursor-pointer border-none transition-all duration-150
                           whitespace-nowrap shrink-0
                           focus-visible:outline-2 focus-visible:outline-primary"
                style={{
                  background: active ? "var(--color-primary-light, #f0edff)" : "transparent",
                  color: active ? "var(--color-primary)" : "var(--color-text-muted)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ── */}
        <div className="flex-1 min-w-0">
          {activeTab === "company"   && <CompanyProfileTab />}
          {activeTab === "quotation" && <QuotationSettingsTab />}
          {activeTab === "users"     && <UserManagementTab />}
          {activeTab === "password"  && <ChangePasswordTab />}
        </div>
      </div>
    </div>
  );
}

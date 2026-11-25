// src/pages/Settings/UserManagementTab.tsx

import { useEffect, useState } from "react";
import {
  UserPlus, RefreshCw, Eye, EyeOff, Loader2, Users,
  ShieldCheck, Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, ConfirmModal } from "../../components/ui";
import { userService, type AppUser } from "../../services/userService";
import { useAuthStore, FULL_PERMISSIONS, type UserPermissions } from "../../store/authStore";

const PERMISSION_LABELS: { key: keyof UserPermissions; label: string; description: string }[] = [
  { key: "canAccessSalesPanel", label: "Sales Panel",      description: "Can open and use the Sales Panel" },
  { key: "canCreateOrder",      label: "Save Drafts",      description: "Can save quotation drafts" },
  { key: "canFinalizeOrder",    label: "Finalize Orders",  description: "Can mark a draft as Saved" },
  { key: "canDownloadPDF",      label: "Download PDF",     description: "Can download quotation PDFs" },
  { key: "canViewOrders",       label: "View Orders",      description: "Can open the Orders history page" },
];

function RoleBadge({ role }: { role: "admin" | "sales" }) {
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
      style={{ background: role === "admin" ? "#f0edff" : "#e5f0ff", color: role === "admin" ? "#7045f7" : "#1280f7" }}>
      {role === "admin" ? <ShieldCheck size={10} /> : <Briefcase size={10} />}
      {role === "admin" ? "Admin" : "Sales"}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-[12px]" style={{ color: active ? "#0f8050" : "#9ca3af" }}>
      <span className="w-2 h-2 rounded-full" style={{ background: active ? "#0f8050" : "#d1d5db" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Permission toggle row ─────────────────────────────────────────────────────
function PermissionsPanel({ user, onUpdated }: { user: AppUser; onUpdated: (u: AppUser) => void }) {
  const [saving, setSaving] = useState<keyof UserPermissions | null>(null);
  const perms: UserPermissions = { ...FULL_PERMISSIONS, ...user.permissions };

  async function toggle(key: keyof UserPermissions) {
    setSaving(key);
    try {
      const updated = await userService.updatePermissions(user._id, { [key]: !perms[key] });
      onUpdated(updated);
    } catch {
      toast.error("Failed to update permission.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="px-4 md:px-6 py-3.5" style={{ background: "#f7f7fa", borderTop: "1px solid #f0f0f5" }}>
      <p style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
        Permissions
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
        {PERMISSION_LABELS.map(({ key, label, description }) => {
          const enabled = perms[key];
          const isSaving = saving === key;
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              disabled={!!saving}
              title={description}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "10px", padding: "10px 12px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
                border: `1px solid ${enabled ? "#d4c9ff" : "#e5e7eb"}`,
                background: enabled ? "#f0edff" : "white",
                transition: "all 0.15s", textAlign: "left",
                opacity: saving && !isSaving ? 0.5 : 1,
              }}
            >
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: enabled ? "#7045f7" : "#6b7280", margin: 0 }}>{label}</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{description}</p>
              </div>
              {isSaving
                ? <Loader2 size={14} style={{ color: "#7045f7", flexShrink: 0 }} className="animate-spin" />
                : (
                  <div style={{
                    width: "32px", height: "18px", borderRadius: "999px", flexShrink: 0,
                    background: enabled ? "#7045f7" : "#d1d5db", position: "relative", transition: "background 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: "2px",
                      left: enabled ? "16px" : "2px",
                      width: "14px", height: "14px", borderRadius: "50%", background: "white",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
                    }} />
                  </div>
                )
              }
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Add User Modal ─────────────────────────────────────────────────────────────
interface AddUserModalProps { onClose: () => void; onAdded: (user: AppUser) => void; }

function AddUserModal({ onClose, onAdded }: AddUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "sales">("sales");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Min. 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const user = await userService.create({ name: name.trim(), email: email.trim(), password, role });
      toast.success(`User "${user.name}" created.`);
      onAdded(user);
      onClose();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create user.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10002, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}>
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 20px 40px rgba(0,0,0,0.18)", width: "90%", maxWidth: "440px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f5", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0edff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserPlus size={17} color="#7045f7" />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1f", margin: 0 }}>Add New User</h3>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input label="Full Name" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: "" })); }} placeholder="e.g. Rahul Sharma" error={errors.name} required disabled={saving} autoFocus />
          <Input label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }} placeholder="user@daccess.com" error={errors.email} required disabled={saving} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold" style={{ color: "#737380" }}>Password <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <div className="flex items-center h-9 px-3 rounded-md border" style={{ background: "var(--color-bg-input)", borderColor: errors.password ? "var(--color-danger)" : "var(--color-border)" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: "" })); }} placeholder="Min. 6 characters" disabled={saving} className="flex-1 text-[13px] outline-none border-none bg-transparent" style={{ color: "var(--color-text-main)" }} />
              <button type="button" onClick={() => setShowPass(v => !v)} className="border-none bg-transparent cursor-pointer ml-2" style={{ color: "var(--color-text-muted)" }} tabIndex={-1}>{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
            {errors.password && <p className="text-[12px]" style={{ color: "var(--color-danger)" }}>{errors.password}</p>}
          </div>
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as "admin" | "sales")} options={[{ value: "sales", label: "Sales" }, { value: "admin", label: "Admin" }]} disabled={saving} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f5", background: "#fafafa", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            {saving ? "Creating…" : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main tab ───────────────────────────────────────────────────────────────────
export default function UserManagementTab() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<AppUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setUsers(await userService.getAll()); }
    catch { toast.error("Failed to load users."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(user: AppUser) {
    setTogglingId(user._id);
    try {
      const updated = await userService.toggleActive(user._id, !user.isActive);
      setUsers((us) => us.map((u) => (u._id === updated._id ? { ...u, isActive: updated.isActive } : u)));
      toast.success(`${user.name} ${updated.isActive ? "activated" : "deactivated"}.`);
    } catch {
      toast.error("Failed to update user.");
    } finally {
      setTogglingId(null);
      setConfirmToggle(null);
    }
  }

  function handlePermissionUpdated(updated: AppUser) {
    setUsers((us) => us.map((u) => (u._id === updated._id ? { ...u, permissions: updated.permissions } : u)));
  }

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <>
      <section className="rounded-(--radius-lg) overflow-hidden" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border-light)" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-light)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#fff3e0" }}>
            <Users size={17} style={{ color: "#f28c1a" }} />
          </div>
          <div className="flex-1">
            <h2 className="text-[17px] font-semibold" style={{ color: "var(--color-text-main)" }}>User Management</h2>
            <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>Manage accounts and control what each user can do.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-lg border cursor-pointer" style={{ background: "var(--color-bg-input)", borderColor: "var(--color-border-light)", color: "var(--color-text-muted)" }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <UserPlus size={14} /> Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-3 flex items-center gap-4" style={{ background: "var(--color-bg-input)", borderBottom: "1px solid var(--color-border-light)" }}>
          <span className="text-[13px]" style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-text-main)" }}>{users.length}</strong> total</span>
          <span className="text-[13px]" style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "#0f8050" }}>{activeCount}</strong> active</span>
          <span className="text-[13px]" style={{ color: "var(--color-text-muted)" }}><strong style={{ color: "#9ca3af" }}>{users.length - activeCount}</strong> inactive</span>
        </div>

        {/* Loading */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-4 md:px-6 h-16 flex items-center gap-4 border-b" style={{ borderColor: "var(--color-border-light)" }}>
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton flex-1 h-4" />
            <div className="skeleton w-16 h-6 rounded-full" />
          </div>
        ))}

        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16" style={{ color: "var(--color-text-muted)" }}>
            <Users size={28} strokeWidth={1.5} />
            <p className="text-[14px]">No users yet</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <>
            {/* Column headers */}
            <div className="hidden md:grid px-6 h-10 text-[11px] font-semibold uppercase tracking-wider items-center" style={{ gridTemplateColumns: "1fr 180px 100px 120px 120px", color: "#9ca3af", background: "var(--color-bg-input)", borderBottom: "1px solid var(--color-border-light)" }}>
              <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Action</span>
            </div>

            {users.map((user, idx) => {
              const isExpanded = expandedId === user._id;
              const isSales = user.role === "sales";
              const isCurrentUser = currentUser?.id === user._id;
              return (
                <div key={user._id} style={{ borderBottom: idx < users.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                  {/* ── Desktop grid row ── */}
                  <div className="hidden md:grid px-6 py-3 items-center transition-colors duration-100 hover:bg-(--color-bg-hover)" style={{ gridTemplateColumns: "1fr 180px 100px 120px 120px" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: user.role === "admin" ? "#7045f7" : "#1280f7" }}>
                        {user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex items-center gap-2">
                        <p className="text-[14px] font-medium truncate" style={{ color: "var(--color-text-main)" }}>{user.name}</p>
                        {isCurrentUser && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: "#f0edff", color: "#7045f7" }}>you</span>}
                        {isSales && (
                          <button onClick={() => setExpandedId(isExpanded ? null : user._id)} title="Manage permissions" className="border-none bg-transparent cursor-pointer p-0.5 shrink-0 opacity-50 hover:opacity-100 transition-opacity" style={{ color: "#7045f7" }}>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                    <span className="text-[13px] truncate" style={{ color: "var(--color-text-muted)" }}>{user.email}</span>
                    <RoleBadge role={user.role} />
                    <StatusDot active={user.isActive} />
                    <div>
                      {!isCurrentUser ? (
                        <button
                          onClick={() => setConfirmToggle(user)}
                          disabled={togglingId === user._id}
                          className="text-[12px] font-semibold px-3 py-1.5 rounded-md border cursor-pointer transition-colors duration-150"
                          style={{ background: user.isActive ? "#fee2e2" : "#e6f9f0", borderColor: user.isActive ? "#fca5a5" : "#a0dfc0", color: user.isActive ? "#dc2626" : "#0f8050" }}
                        >
                          {togglingId === user._id ? <Loader2 size={12} className="animate-spin" /> : (user.isActive ? "Deactivate" : "Activate")}
                        </button>
                      ) : (
                        <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>—</span>
                      )}
                    </div>
                  </div>

                  {/* ── Mobile card row ── */}
                  <div className="md:hidden flex flex-col gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0" style={{ background: user.role === "admin" ? "#7045f7" : "#1280f7" }}>
                        {user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium truncate" style={{ color: "var(--color-text-main)" }}>{user.name}</p>
                          {isCurrentUser && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: "#f0edff", color: "#7045f7" }}>you</span>}
                        </div>
                        <p className="text-[12px] truncate" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={user.role} />
                        <StatusDot active={user.isActive} />
                      </div>
                      <div className="flex items-center gap-2">
                        {isSales && (
                          <button onClick={() => setExpandedId(isExpanded ? null : user._id)} className="flex items-center gap-1 text-[12px] font-semibold px-2.5 h-8 rounded-md border cursor-pointer" style={{ borderColor: "var(--color-border)", color: "#7045f7", background: "var(--color-bg-input)" }}>
                            Permissions {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                        {!isCurrentUser && (
                          <button
                            onClick={() => setConfirmToggle(user)}
                            disabled={togglingId === user._id}
                            className="text-[12px] font-semibold px-3 h-8 rounded-md border cursor-pointer"
                            style={{ background: user.isActive ? "#fee2e2" : "#e6f9f0", borderColor: user.isActive ? "#fca5a5" : "#a0dfc0", color: user.isActive ? "#dc2626" : "#0f8050" }}
                          >
                            {togglingId === user._id ? <Loader2 size={12} className="animate-spin" /> : (user.isActive ? "Deactivate" : "Activate")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Permissions panel (sales only, expanded) */}
                  {isSales && isExpanded && (
                    <PermissionsPanel user={user} onUpdated={handlePermissionUpdated} />
                  )}
                </div>
              );
            })}
          </>
        )}
      </section>

      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onAdded={(u) => setUsers((us) => [u, ...us])} />
      )}

      <ConfirmModal
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && handleToggle(confirmToggle)}
        title={confirmToggle?.isActive ? "Deactivate User" : "Activate User"}
        description={confirmToggle?.isActive
          ? `Deactivate "${confirmToggle?.name}"? They won't be able to log in.`
          : `Activate "${confirmToggle?.name}"? They will be able to log in again.`}
        highlight={confirmToggle?.name}
        confirmLabel={confirmToggle?.isActive ? "Deactivate" : "Activate"}
        cancelLabel="Cancel"
      />
    </>
  );
}

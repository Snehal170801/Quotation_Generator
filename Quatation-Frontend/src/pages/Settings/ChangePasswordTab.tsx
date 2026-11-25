// src/pages/Settings/ChangePasswordTab.tsx

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui";
import api from "../../services/api";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold" style={{ color: "#737380" }}>
        {label} <span style={{ color: "var(--color-danger)" }}>*</span>
      </label>
      <div
        className="flex items-center h-9 px-3 rounded-md border transition-all duration-150"
        style={{
          background: "var(--color-bg-input)",
          borderColor: error ? "var(--color-danger)" : "var(--color-border)",
        }}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 text-[13px] outline-none border-none bg-transparent"
          style={{ color: "var(--color-text-main)" }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="cursor-pointer border-none bg-transparent p-0 ml-2"
          style={{ color: "var(--color-text-muted)" }}
          tabIndex={-1}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && (
        <p className="text-[12px]" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function ChangePasswordTab() {
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<PasswordForm>>({});
  const [saving, setSaving] = useState(false);

  function update(key: keyof PasswordForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const errs: Partial<PasswordForm> = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required.";
    if (!form.newPassword) errs.newPassword = "New password is required.";
    else if (form.newPassword.length < 6) errs.newPassword = "Must be at least 6 characters.";
    else if (form.newPassword === form.currentPassword) errs.newPassword = "New password must differ from current.";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your new password.";
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update password.";
      if (msg.toLowerCase().includes("current")) {
        setErrors({ currentPassword: msg });
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  const strength =
    form.newPassword.length === 0 ? 0
    : form.newPassword.length < 6 ? 1
    : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword) ? 3
    : 2;

  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "#f28c1a", "#1280f7", "#0f8050"];

  return (
    <section
      className="rounded-(--radius-lg) overflow-hidden"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-light)",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--color-border-light)" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#e6f9f0" }}
        >
          <Lock size={17} style={{ color: "#0f8050" }} />
        </div>
        <div>
          <h2 className="text-[17px] font-semibold" style={{ color: "var(--color-text-main)" }}>
            Change Password
          </h2>
          <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            Update your account password. You'll stay logged in after saving.
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6 flex flex-col gap-5 max-w-md">
        <PasswordInput
          label="Current Password"
          value={form.currentPassword}
          onChange={(v) => update("currentPassword", v)}
          placeholder="Enter current password"
          disabled={saving}
          error={errors.currentPassword}
        />

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            label="New Password"
            value={form.newPassword}
            onChange={(v) => update("newPassword", v)}
            placeholder="Min. 6 characters"
            disabled={saving}
            error={errors.newPassword}
          />
          {/* Strength bar */}
          {form.newPassword.length > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i <= strength ? strengthColor[strength] : "var(--color-border-light)",
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold" style={{ color: strengthColor[strength] }}>
                {strengthLabel[strength]}
              </span>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={(v) => update("confirmPassword", v)}
          placeholder="Re-enter new password"
          disabled={saving}
          error={errors.confirmPassword}
        />

        {/* Tips */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-lg"
          style={{
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border-light)",
          }}
        >
          <ShieldCheck size={15} className="shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
          <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
            Use at least 6 characters with uppercase, lowercase, and a number for a strong password.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 flex justify-end"
        style={{
          borderTop: "1px solid var(--color-border-light)",
          background: "var(--color-bg-input)",
        }}
      >
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {saving ? "Updating…" : "Update Password"}
        </Button>
      </div>
    </section>
  );
}

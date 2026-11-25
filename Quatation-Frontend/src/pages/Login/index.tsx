// src/pages/Login/index.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";

interface LoginForm {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

interface ServerBanner {
  type: "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverBanner, setServerBanner] = useState<ServerBanner | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, touchedFields },
    watch,
  } = useForm<LoginForm>({ mode: "onTouched" });

  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setServerBanner(null);
    setServerFieldErrors({});

    try {
      const res = await api.post("/auth/login", {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      const { token, user } = res.data;
      setAuth(token, user);
      toast.success(`Welcome back, ${user.name}!`, { duration: 3000 });
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { code?: string; message?: string } } })?.response;
      const status = response?.status;
      const code = response?.data?.code;

      if (!navigator.onLine) {
        setServerBanner({
          type: "error",
          title: "No internet connection",
          message: "Check your network and try again.",
        });
        setLoading(false);
        return;
      }

      // Field-level server errors — highlight the specific field
      if (code === "USER_NOT_FOUND") {
        setServerFieldErrors({ email: "No account found with this email address." });
        setServerBanner({
          type: "error",
          title: "Account not found",
          message: "We couldn't find an account matching that email. Double-check your email or contact your admin.",
        });
        setTimeout(() => setFocus("email"), 50);
      } else if (code === "WRONG_PASSWORD") {
        setServerFieldErrors({ password: "The password you entered is incorrect." });
        setServerBanner({
          type: "error",
          title: "Incorrect password",
          message: "The password you entered doesn't match our records. Please try again.",
        });
        setTimeout(() => setFocus("password"), 50);
      } else if (status === 403 || code === "ACCOUNT_DISABLED") {
        setServerBanner({
          type: "warning",
          title: "Account deactivated",
          message: "Your account has been deactivated. Please contact your system administrator to restore access.",
        });
      } else if (status === 429) {
        setServerBanner({
          type: "warning",
          title: "Too many attempts",
          message: "You've made too many login attempts. Please wait a few minutes before trying again.",
        });
      } else if (status && status >= 500) {
        setServerBanner({
          type: "error",
          title: "Server error",
          message: "We're experiencing technical difficulties. Please try again in a few minutes.",
        });
      } else {
        setServerBanner({
          type: "error",
          title: "Login failed",
          message: response?.data?.message ?? "Something went wrong. Please try again.",
        });
      }

      setLoading(false);
    }
  }

  // Merge react-hook-form errors with server field errors
  const emailError =
    serverFieldErrors.email ??
    (touchedFields.email ? errors.email?.message : undefined);

  const passwordError =
    serverFieldErrors.password ??
    (touchedFields.password ? errors.password?.message : undefined);

  const emailValid = !emailError && emailValue.length > 0 && touchedFields.email;
  const passwordValid = !passwordError && passwordValue.length > 0 && touchedFields.password;

  const bannerColors: Record<string, { bg: string; border: string; icon: string; titleColor: string; textColor: string }> = {
    error: {
      bg: "#fff5f5",
      border: "#fecaca",
      icon: "#dc2626",
      titleColor: "#991b1b",
      textColor: "#dc2626",
    },
    warning: {
      bg: "#fffbeb",
      border: "#fde68a",
      icon: "#d97706",
      titleColor: "#92400e",
      textColor: "#b45309",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      icon: "#2563eb",
      titleColor: "#1e40af",
      textColor: "#3b82f6",
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0effe",
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(112,69,247,0.18) 0%, transparent 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Brand header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #7045f7 0%, #4d1acc 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 12px 32px rgba(112,69,247,0.35)",
            }}
          >
            <ShieldCheck size={28} color="#fff" strokeWidth={2} />
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1a1a2e",
              marginBottom: "8px",
              letterSpacing: "-0.4px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6b80", lineHeight: 1.5 }}>
            Sign in to your Quotation Portal account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e4e4f0",
            padding: "36px 32px",
            boxShadow:
              "0 4px 6px rgba(0,0,0,0.04), 0 20px 48px rgba(112,69,247,0.08)",
          }}
        >
          {/* Server banner */}
          {serverBanner && (
            <div
              role="alert"
              aria-live="polite"
              style={{
                background: bannerColors[serverBanner.type].bg,
                border: `1px solid ${bannerColors[serverBanner.type].border}`,
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "24px",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <AlertCircle
                size={16}
                color={bannerColors[serverBanner.type].icon}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: bannerColors[serverBanner.type].titleColor,
                    marginBottom: "2px",
                  }}
                >
                  {serverBanner.title}
                </p>
                <p
                  style={{
                    fontSize: "12.5px",
                    color: bannerColors[serverBanner.type].textColor,
                    lineHeight: 1.5,
                  }}
                >
                  {serverBanner.message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor="login-email"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#4b4b60",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Email address <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={15}
                    style={{
                      position: "absolute",
                      left: "13px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: emailError ? "#dc2626" : emailValid ? "#22c55e" : "#9090a8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@company.com"
                    disabled={loading}
                    {...register("email", {
                      required: "Email address is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email (e.g. name@company.com).",
                      },
                      validate: (v) =>
                        v.trim().length > 0 || "Email address cannot be blank.",
                      onChange: () => setServerFieldErrors((p) => ({ ...p, email: undefined })),
                    })}
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 40px 0 38px",
                      fontSize: "14px",
                      borderRadius: "10px",
                      border: emailError
                        ? "1.5px solid #dc2626"
                        : emailValid
                          ? "1.5px solid #22c55e"
                          : "1.5px solid #e0e0eb",
                      background: loading ? "#f9f9fc" : "#f7f7fb",
                      color: "#1a1a2e",
                      outline: "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      fontFamily: "var(--font-sans)",
                      boxShadow: emailError ? "0 0 0 3px rgba(220,38,38,0.10)" : "none",
                    }}
                    onFocus={(e) => {
                      if (!emailError) e.currentTarget.style.boxShadow = "0 0 0 3px rgba(112,69,247,0.14)";
                      e.currentTarget.style.borderColor = emailError ? "#dc2626" : "#7045f7";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = emailError ? "0 0 0 3px rgba(220,38,38,0.10)" : "none";
                      e.currentTarget.style.borderColor = emailError ? "#dc2626" : emailValid ? "#22c55e" : "#e0e0eb";
                    }}
                  />
                  {emailValid && (
                    <CheckCircle2
                      size={15}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#22c55e",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
                {emailError && (
                  <p
                    role="alert"
                    style={{
                      fontSize: "12px",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <AlertCircle size={12} style={{ flexShrink: 0 }} />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#4b4b60",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Password <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={15}
                    style={{
                      position: "absolute",
                      left: "13px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: passwordError ? "#dc2626" : passwordValid ? "#22c55e" : "#9090a8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={loading}
                    {...register("password", {
                      required: "Password is required.",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters.",
                      },
                      onChange: () => setServerFieldErrors((p) => ({ ...p, password: undefined })),
                    })}
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 44px 0 38px",
                      fontSize: "14px",
                      borderRadius: "10px",
                      border: passwordError
                        ? "1.5px solid #dc2626"
                        : passwordValid
                          ? "1.5px solid #22c55e"
                          : "1.5px solid #e0e0eb",
                      background: loading ? "#f9f9fc" : "#f7f7fb",
                      color: "#1a1a2e",
                      outline: "none",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      fontFamily: "var(--font-sans)",
                      boxShadow: passwordError ? "0 0 0 3px rgba(220,38,38,0.10)" : "none",
                    }}
                    onFocus={(e) => {
                      if (!passwordError) e.currentTarget.style.boxShadow = "0 0 0 3px rgba(112,69,247,0.14)";
                      e.currentTarget.style.borderColor = passwordError ? "#dc2626" : "#7045f7";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = passwordError ? "0 0 0 3px rgba(220,38,38,0.10)" : "none";
                      e.currentTarget.style.borderColor = passwordError ? "#dc2626" : passwordValid ? "#22c55e" : "#e0e0eb";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: "11px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#9090a8",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                      borderRadius: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p
                    role="alert"
                    style={{
                      fontSize: "12px",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <AlertCircle size={12} style={{ flexShrink: 0 }} />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading
                    ? "#a78bfa"
                    : "linear-gradient(135deg, #7045f7 0%, #5535d4 100%)",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  letterSpacing: "0.01em",
                  transition: "opacity 0.15s, transform 0.1s",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(112,69,247,0.35)",
                  fontFamily: "var(--font-sans)",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.99)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>

            </div>
          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#9090a8" }}>
          Protected by enterprise-grade security.{" "}
          <span style={{ color: "#7045f7", fontWeight: 600 }}>Quotation Portal</span>
        </p>
      </div>
    </div>
  );
}

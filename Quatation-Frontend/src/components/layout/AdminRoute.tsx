// src/components/layout/AdminRoute.tsx

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "admin") return <Navigate to="/sales" replace />;
  return <>{children}</>;
}

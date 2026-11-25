// src/store/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserPermissions {
  canAccessSalesPanel: boolean;
  canCreateOrder: boolean;
  canFinalizeOrder: boolean;
  canDownloadPDF: boolean;
  canViewOrders: boolean;
}

export const FULL_PERMISSIONS: UserPermissions = {
  canAccessSalesPanel: true,
  canCreateOrder: true,
  canFinalizeOrder: true,
  canDownloadPDF: true,
  canViewOrders: true,
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
  permissions?: UserPermissions;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: "quotation-auth" }
  )
);

/** Returns effective permissions — admins always get FULL_PERMISSIONS */
export function getPermissions(user: AuthUser | null): UserPermissions {
  if (!user) return FULL_PERMISSIONS;
  if (user.role === "admin") return FULL_PERMISSIONS;
  return { ...FULL_PERMISSIONS, ...user.permissions };
}

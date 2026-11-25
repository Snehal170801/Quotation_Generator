// src/hooks/usePermissions.ts

import { useAuthStore, getPermissions } from "../store/authStore";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  return getPermissions(user);
}

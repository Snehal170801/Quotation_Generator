// src/services/userService.ts

import api from "./api";
import type { UserPermissions } from "../store/authStore";

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
  isActive: boolean;
  permissions: UserPermissions;
  createdAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "sales";
}

export const userService = {
  async getAll(): Promise<AppUser[]> {
    const res = await api.get("/users");
    return res.data.users;
  },

  async create(payload: CreateUserPayload): Promise<AppUser> {
    const res = await api.post("/users", payload);
    return res.data.user;
  },

  async toggleActive(id: string, isActive: boolean): Promise<AppUser> {
    const res = await api.put(`/users/${id}`, { isActive });
    return res.data.user;
  },

  async updatePermissions(id: string, permissions: Partial<UserPermissions>): Promise<AppUser> {
    const res = await api.put(`/users/${id}`, { permissions });
    return res.data.user;
  },

  async resetPassword(id: string, password: string): Promise<void> {
    await api.put(`/users/${id}`, { password });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

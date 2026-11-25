// src/services/categoryService.ts

import api from "./api";
import type { CategoryType } from "../types";

// Backend uses lowercase, frontend uses title-case
export const toBackendType = (t: CategoryType): string => t.toLowerCase();
export const toFrontendType = (t: string): CategoryType =>
  (t.charAt(0).toUpperCase() + t.slice(1)) as CategoryType;

export interface BackendChild {
  _id: string;
  name: string;
  type: string;
  price: number | null;
}

export interface BackendParent {
  _id: string;
  name: string;
  type: string;
  children: BackendChild[];
}

export const categoryService = {
  // Fetch full nested tree (active only) — used for display
  async getTree(): Promise<BackendParent[]> {
    const res = await api.get("/categories/tree");
    return res.data.tree;
  },

  // Create a top-level category section
  async createParent(name: string, type: CategoryType): Promise<BackendParent & { children: [] }> {
    const res = await api.post("/categories/parent", {
      name,
      type: toBackendType(type),
    });
    return { ...res.data.category, children: [] };
  },

  // Create a child item under a parent
  async createChild(
    parentId: string,
    name: string,
    type: CategoryType,
    price?: number | null
  ): Promise<BackendChild> {
    const res = await api.post("/categories/child", {
      name,
      type: toBackendType(type),
      parent: parentId,
      price: price ?? null,
    });
    return res.data.category;
  },

  // Update a category or child item (name, price, isActive, etc.)
  async update(id: string, updates: { name?: string; price?: number | null; isActive?: boolean }) {
    const res = await api.put(`/categories/${id}`, updates);
    return res.data.category;
  },

  // Delete a category or child item
  async remove(id: string) {
    await api.delete(`/categories/${id}`);
  },
};

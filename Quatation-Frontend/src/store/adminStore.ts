// src/store/adminStore.ts

import { create } from "zustand";
import type { Category, CategoryItem, CustomerField, CategoryType, FieldType } from "../types";
import { categoryService, toFrontendType } from "../services/categoryService";
import { fieldService, toFrontendFieldType } from "../services/fieldService";
import { CATEGORY_ICONS } from "../pages/AdminPanel/constants";

interface AdminState {
  // ── Categories (backend-driven) ────────────────────────────────────────────
  categories: Category[];
  loading: boolean;
  error: string | null;

  // ── Fields (backend-driven) ────────────────────────────────────────────────
  fields: CustomerField[];
  fieldsLoading: boolean;
  fieldsError: string | null;

  // ── Category async actions ─────────────────────────────────────────────────
  fetchCategories: () => Promise<void>;
  addCategory: (name: string, type: CategoryType) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  renameCategory: (id: string, name: string) => Promise<void>;
  addItem: (catId: string, name: string, price: string) => Promise<void>;
  removeItem: (catId: string, itemId: string) => Promise<void>;
  updateItemPrice: (catId: string, itemId: string, price: string) => Promise<void>;
  updateItemName: (catId: string, itemId: string, name: string) => Promise<void>;

  // ── Field async actions ────────────────────────────────────────────────────
  fetchFields: () => Promise<void>;
  addField: (name: string, type: FieldType, required: boolean) => Promise<void>;
  removeField: (id: string) => Promise<void>;
  updateField: (id: string, updates: { name?: string; type?: FieldType; required?: boolean }) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  fields: [],
  fieldsLoading: false,
  fieldsError: null,

  // ── Fetch full category tree from backend ──────────────────────────────────
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const tree = await categoryService.getTree();
      const categories: Category[] = tree.map((parent) => ({
        id: parent._id,
        label: parent.name,
        type: toFrontendType(parent.type),
        icon: CATEGORY_ICONS[toFrontendType(parent.type)] ?? "📦",
        items: parent.children.map((child) => ({
          id: child._id,
          name: child.name,
          price: child.price != null ? String(child.price) : "",
        })),
      }));
      set({ categories, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load categories. Please refresh." });
    }
  },

  // ── Add top-level category ─────────────────────────────────────────────────
  addCategory: async (name, type) => {
    const created = await categoryService.createParent(name, type);
    const newCat: Category = {
      id: created._id,
      label: created.name,
      type: toFrontendType(created.type),
      icon: CATEGORY_ICONS[toFrontendType(created.type)] ?? "📦",
      items: [],
    };
    set((s) => ({ categories: [...s.categories, newCat] }));
  },

  // ── Rename a category (optimistic, then API) ──────────────────────────────
  renameCategory: async (id, name) => {
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, label: name } : c)),
    }));
    await categoryService.update(id, { name });
  },

  // ── Remove category (backend first, then local) ────────────────────────────
  removeCategory: async (id) => {
    await categoryService.remove(id);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  // ── Add child item ─────────────────────────────────────────────────────────
  addItem: async (catId, name, price) => {
    const parent = get().categories.find((c) => c.id === catId);
    if (!parent) return;

    const priceNum = price.trim() !== "" ? parseFloat(price) : null;
    const child = await categoryService.createChild(catId, name, parent.type, priceNum);

    const newItem: CategoryItem = {
      id: child._id,
      name: child.name,
      price: child.price != null ? String(child.price) : "",
    };

    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === catId ? { ...c, items: [...c.items, newItem] } : c
      ),
    }));
  },

  // ── Remove child item ──────────────────────────────────────────────────────
  removeItem: async (catId, itemId) => {
    await categoryService.remove(itemId);
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c
      ),
    }));
  },

  // ── Rename an item (optimistic, then API) ─────────────────────────────────
  updateItemName: async (catId, itemId, name) => {
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, name } : i)) }
          : c
      ),
    }));
    await categoryService.update(itemId, { name });
  },

  // ── Update item price (optimistic local, then API) ─────────────────────────
  updateItemPrice: async (catId, itemId, price) => {
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, price } : i)) }
          : c
      ),
    }));

    const priceNum = price.trim() !== "" ? parseFloat(price) : null;
    await categoryService.update(itemId, { price: priceNum });
  },

  // ── Fetch all customer fields ──────────────────────────────────────────────
  fetchFields: async () => {
    set({ fieldsLoading: true, fieldsError: null });
    try {
      const raw = await fieldService.getAll();
      const fields: CustomerField[] = raw.map((f) => ({
        id: f._id,
        name: f.name,
        type: toFrontendFieldType(f.type),
        required: f.required,
      }));
      set({ fields, fieldsLoading: false });
    } catch {
      set({ fieldsLoading: false, fieldsError: "Failed to load fields. Please refresh." });
    }
  },

  // ── Add a new field ────────────────────────────────────────────────────────
  addField: async (name, type, required) => {
    const created = await fieldService.create(name, type, required);
    const newField: CustomerField = {
      id: created._id,
      name: created.name,
      type: toFrontendFieldType(created.type),
      required: created.required,
    };
    set((s) => ({ fields: [...s.fields, newField] }));
  },

  // ── Remove a field ─────────────────────────────────────────────────────────
  removeField: async (id) => {
    await fieldService.remove(id);
    set((s) => ({ fields: s.fields.filter((f) => f.id !== id) }));
  },

  // ── Update a field ─────────────────────────────────────────────────────────
  updateField: async (id, updates) => {
    const updated = await fieldService.update(id, updates);
    const field: CustomerField = {
      id: updated._id,
      name: updated.name,
      type: toFrontendFieldType(updated.type),
      required: updated.required,
    };
    set((s) => ({ fields: s.fields.map((f) => (f.id === id ? field : f)) }));
  },
}));

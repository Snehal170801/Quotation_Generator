// src/store/salesStore.ts

import { create } from "zustand";
import type { CategoryType, FieldType } from "../types";
import { categoryService, toFrontendType } from "../services/categoryService";
import { fieldService, toFrontendFieldType } from "../services/fieldService";

const TYPE_COLORS: Record<CategoryType, string> = {
  Product:  "#7045f7",
  Software: "#1280f7",
  Hardware: "#f28c1a",
  Other:    "#0f8050",
};

const TYPE_ICONS: Record<CategoryType, string> = {
  Product:  "📦",
  Software: "💾",
  Hardware: "🔧",
  Other:    "📎",
};

export interface SalesItem {
  id: string;
  name: string;
  price: number;
}

export interface SalesCategory {
  id: string;
  label: string;
  type: CategoryType;
  icon: string;
  color: string;
  items: SalesItem[];
}

export interface SalesField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
}

interface SalesState {
  // ── Backend data ──────────────────────────────────────────────────────────
  categories: SalesCategory[];
  fields: SalesField[];
  loading: boolean;
  error: string | null;

  // ── Selection (flat set of item IDs) ──────────────────────────────────────
  selected: Set<string>;

  // ── Per-item quantity (e.g. number of cameras), keyed by item id ─────────
  quantities: Record<string, number>;

  // ── Customer form (keyed by field._id) ───────────────────────────────────
  formValues: Record<string, string>;

  // ── Actions ───────────────────────────────────────────────────────────────
  fetchData: () => Promise<void>;
  toggle: (itemId: string) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  setFormValue: (fieldId: string, value: string) => void;
  resetAll: () => void;
}

export const useSalesStore = create<SalesState>((set) => ({
  categories: [],
  fields: [],
  loading: false,
  error: null,
  selected: new Set(),
  quantities: {},
  formValues: {},

  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [tree, rawFields] = await Promise.all([
        categoryService.getTree(),
        fieldService.getAll(),
      ]);

      const categories: SalesCategory[] = tree.map((parent) => {
        const type = toFrontendType(parent.type);
        return {
          id: parent._id,
          label: parent.name,
          type,
          icon: TYPE_ICONS[type] ?? "📦",
          color: TYPE_COLORS[type] ?? "#7045f7",
          items: parent.children.map((child) => ({
            id: child._id,
            name: child.name,
            price: child.price ?? 0,
          })),
        };
      });

      const fields: SalesField[] = rawFields.map((f) => ({
        id: f._id,
        name: f.name,
        type: toFrontendFieldType(f.type),
        required: f.required,
      }));

      set({ categories, fields, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load data. Please refresh." });
    }
  },

  toggle: (itemId) =>
    set((s) => {
      const next = new Set(s.selected);
      const nextQuantities = { ...s.quantities };
      if (next.has(itemId)) {
        next.delete(itemId);
        delete nextQuantities[itemId];
      } else {
        next.add(itemId);
        nextQuantities[itemId] = nextQuantities[itemId] ?? 1;
      }
      return { selected: next, quantities: nextQuantities };
    }),

  setQuantity: (itemId, quantity) =>
    set((s) => ({
      quantities: { ...s.quantities, [itemId]: Math.max(1, Math.floor(quantity) || 1) },
    })),

  setFormValue: (fieldId, value) =>
    set((s) => ({ formValues: { ...s.formValues, [fieldId]: value } })),

  resetAll: () =>
    set({ selected: new Set(), quantities: {}, formValues: {} }),
}));

// src/types/index.ts

import type { FC } from "react";
import type { LucideProps } from "lucide-react";

// ── Navigation ────────────────────────────────────────────────────────────────

export type PageKey = "admin" | "sales" | "orders" | "settings";

export interface NavItemConfig {
  key: PageKey;
  icon: FC<LucideProps>;
  label: string;
}

// ── Admin Panel ───────────────────────────────────────────────────────────────

export type CategoryType = "Product" | "Hardware" | "Software" | "Other";

export type FieldType = "Text" | "Email" | "Phone" | "Address";

export interface CategoryItem {
  id: string;
  name: string;
  price: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  type: CategoryType;
  items: CategoryItem[];
}

export interface CustomerField {
  id: string | number;
  name: string;
  type: FieldType;
  required: boolean;
}

// ── Sales Panel ───────────────────────────────────────────────────────────────

export interface SelectableItem {
  id: string;
  label: string;
  // Placeholder pricing for now — will be bound to the backend/Admin Panel
  // pricing source later. Stored in plain rupees (no currency symbol).
  price: number;
}

export type SelectionSet = Set<string>;

export interface CustomerForm {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

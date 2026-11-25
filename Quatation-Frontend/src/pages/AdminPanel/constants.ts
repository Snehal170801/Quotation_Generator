// src/pages/AdminPanel/constants.ts

import type { FieldType, CategoryType } from "../../types";

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  Product: "📦",
  Hardware: "🔧",
  Software: "💾",
  Other: "📎",
};

export const CATEGORY_TYPES: CategoryType[] = [
  "Product",
  "Hardware",
  "Software",
  "Other",
];

export const FIELD_TYPES: FieldType[] = ["Text", "Email", "Phone", "Address"];

export const TYPE_STYLES: Record<FieldType, { bg: string; color: string }> = {
  Text: { bg: "#f0edff", color: "#7045f7" },
  Email: { bg: "#e5f0ff", color: "#1280f7" },
  Phone: { bg: "#fff3e0", color: "#f28c1a" },
  Address: { bg: "#e6f9f0", color: "#0f8050" },
};

export const PLACEHOLDERS: Record<FieldType, string> = {
  Text: "Enter text…",
  Email: "Enter email address…",
  Phone: "Enter phone number…",
  Address: "Enter billing address…",
};

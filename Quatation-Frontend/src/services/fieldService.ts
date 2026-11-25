// src/services/fieldService.ts

import api from "./api";
import type { FieldType } from "../types";

// Backend uses lowercase field types, frontend uses title-case
export const toBackendFieldType = (t: FieldType): string => t.toLowerCase();
export const toFrontendFieldType = (t: string): FieldType =>
  (t.charAt(0).toUpperCase() + t.slice(1)) as FieldType;

export interface BackendField {
  _id: string;
  name: string;
  type: string;
  required: boolean;
  order: number;
}

export const fieldService = {
  async getAll(): Promise<BackendField[]> {
    const res = await api.get("/fields");
    return res.data.data;
  },

  async create(name: string, type: FieldType, required: boolean): Promise<BackendField> {
    const res = await api.post("/fields", {
      name,
      type: toBackendFieldType(type),
      required,
    });
    return res.data.data;
  },

  async update(
    id: string,
    updates: { name?: string; type?: FieldType; required?: boolean }
  ): Promise<BackendField> {
    const payload: Record<string, unknown> = { ...updates };
    if (updates.type) payload.type = toBackendFieldType(updates.type);
    const res = await api.put(`/fields/${id}`, payload);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/fields/${id}`);
  },
};

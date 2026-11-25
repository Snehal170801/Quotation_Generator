// src/services/settingsService.ts

import api from "./api";

export interface CompanySettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
}

export interface QuotationSettings {
  gstRate: number;
  validityDays: number;
  prefix: string;
  defaultDiscountPercent: number;
}

export interface AppSettings {
  company: CompanySettings;
  quotation: QuotationSettings;
}

export const settingsService = {
  async get(): Promise<AppSettings> {
    const res = await api.get("/settings");
    return res.data.data;
  },

  async update(payload: Partial<AppSettings>): Promise<AppSettings> {
    const res = await api.put("/settings", payload);
    return res.data.data;
  },
};

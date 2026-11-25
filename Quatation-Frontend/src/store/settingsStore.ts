// src/store/settingsStore.ts

import { create } from "zustand";
import { settingsService, type CompanySettings, type QuotationSettings } from "../services/settingsService";

interface SettingsState {
  company: CompanySettings;
  quotation: QuotationSettings;
  loading: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  saveCompany: (data: CompanySettings) => Promise<void>;
  saveQuotation: (data: QuotationSettings) => Promise<void>;
}

const DEFAULT_COMPANY: CompanySettings = {
  name: "Daccess Systems Private Limited",
  tagline: "Daccess Security Systems Private Limited",
  address: "Baner, Pune, Maharashtra, India",
  phone: "+91 9999999999",
  email: "sales@daccess.com",
  gst: "27ABCDE1234F1Z5",
};

const DEFAULT_QUOTATION: QuotationSettings = {
  gstRate: 18,
  validityDays: 30,
  prefix: "QT",
  defaultDiscountPercent: 0,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  company: DEFAULT_COMPANY,
  quotation: DEFAULT_QUOTATION,
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await settingsService.get();
      set({ company: data.company, quotation: data.quotation, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load settings." });
    }
  },

  saveCompany: async (data) => {
    const result = await settingsService.update({ company: data });
    set({ company: result.company });
  },

  saveQuotation: async (data) => {
    const result = await settingsService.update({ quotation: data });
    set({ quotation: result.quotation });
  },
}));

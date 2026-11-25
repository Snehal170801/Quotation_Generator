// src/services/orderService.ts

import api from "./api";

export interface OrderCustomerDetail { label: string; value: string; }
export interface OrderLineItem { category: string; name: string; price: number; quantity: number; }

export interface Order {
  _id: string;
  quotationNumber: string;
  customerDetails: OrderCustomerDetail[];
  lineItems: OrderLineItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status: "draft" | "saved";
  createdBy: { _id: string; name: string; email: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  quotationNumber: string;
  customerDetails: OrderCustomerDetail[];
  lineItems: OrderLineItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  status?: "draft" | "saved";
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post("/orders", payload);
    return res.data.order;
  },

  async getAll(params?: { search?: string; status?: string }): Promise<Order[]> {
    const res = await api.get("/orders", { params });
    return res.data.orders;
  },

  async getById(id: string): Promise<Order> {
    const res = await api.get(`/orders/${id}`);
    return res.data.order;
  },

  async updateStatus(id: string, status: "draft" | "saved"): Promise<Order> {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data.order;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};

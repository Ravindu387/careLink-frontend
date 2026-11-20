import { request } from "./api";
import type {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierStatusPayload,
  SupplierSummary,
} from "../types/supplier";

export const supplierService = {
  async getSuppliers(params?: {
    tab?: string;
    search?: string;
    category?: string;
    region?: string;
    verification?: string;
    status?: string;
  }): Promise<Supplier[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All categories") {
      query.append("category", params.category);
    }
    if (params?.region && params.region !== "All regions") {
      query.append("region", params.region);
    }
    if (params?.verification && params.verification !== "All verification states") {
      query.append("verification", params.verification);
    }
    if (params?.status && params.status !== "All statuses") {
      query.append("status", params.status);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Supplier[]>(`/suppliers${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getSupplierById(id: string): Promise<Supplier> {
    const response = await request<Supplier>(`/suppliers/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getSummary(): Promise<SupplierSummary> {
    const response = await request<SupplierSummary>("/suppliers/summary", {
      method: "GET",
    });
    return response.data;
  },

  async createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    const response = await request<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateSupplierStatusPayload
  ): Promise<Supplier> {
    const response = await request<Supplier>(`/suppliers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteSupplier(id: string): Promise<boolean> {
    const response = await request<boolean>(`/suppliers/${id}`, {
      method: "DELETE",
    });
    return response.data ?? true;
  },
};

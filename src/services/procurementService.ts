import { request } from "./api";
import type {
  PurchaseOrder,
  ProcurementSummary,
  CreatePurchaseOrderPayload,
  UpdatePurchaseOrderStatusPayload,
  ProcurementQueryParams,
} from "../types/procurement";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const procurementService = {
  async getOrders(params?: ProcurementQueryParams): Promise<PurchaseOrder[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.supplier && params.supplier !== "All suppliers") {
      query.append("supplier", params.supplier);
    }
    if (params?.type && params.type !== "All procurement types") {
      query.append("type", params.type);
    }
    if (params?.status && params.status !== "All statuses" && params.status !== "All") {
      query.append("status", params.status);
    }
    if (params?.tab && params.tab !== "All") {
      query.append("tab", params.tab);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<PurchaseOrder[]>(`/procurement${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getOrderById(id: string): Promise<PurchaseOrder> {
    const response = await request<PurchaseOrder>(`/procurement/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getSummary(): Promise<ProcurementSummary | null> {
    const response = await request<ProcurementSummary>("/procurement/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async createOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
    const response = await request<PurchaseOrder>("/procurement", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateOrderStatus(
    id: string,
    payload: UpdatePurchaseOrderStatusPayload
  ): Promise<PurchaseOrder> {
    const response = await request<PurchaseOrder>(`/procurement/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const response = await request<boolean>(`/procurement/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  getExportUrl(params?: ProcurementQueryParams): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.supplier && params.supplier !== "All suppliers") {
      query.append("supplier", params.supplier);
    }
    if (params?.type && params.type !== "All procurement types") {
      query.append("type", params.type);
    }
    if (params?.status && params.status !== "All statuses") {
      query.append("status", params.status);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/procurement/export${queryString}`;
  },
};

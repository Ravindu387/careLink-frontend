import { request } from "./api";
import type {
  InventoryItem,
  InventorySummary,
  CreateInventoryPayload,
  UpdateInventoryPayload,
  AdjustStockPayload,
  InventoryQueryParams,
} from "../types/inventory";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const inventoryService = {
  async getInventory(params?: InventoryQueryParams): Promise<InventoryItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All categories") {
      query.append("category", params.category);
    }
    if (params?.warehouse && params.warehouse !== "All warehouses") {
      query.append("warehouse", params.warehouse);
    }
    if (params?.status && params.status !== "All stock states" && params.status !== "All") {
      query.append("status", params.status);
    }
    if (params?.tab && params.tab !== "All") {
      query.append("tab", params.tab);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<InventoryItem[]>(`/inventory${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getInventoryById(id: string): Promise<InventoryItem> {
    const response = await request<InventoryItem>(`/inventory/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getInventorySummary(): Promise<InventorySummary | null> {
    const response = await request<InventorySummary>("/inventory/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async createInventoryItem(payload: CreateInventoryPayload): Promise<InventoryItem> {
    const response = await request<InventoryItem>("/inventory", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateInventoryItem(
    id: string,
    payload: UpdateInventoryPayload
  ): Promise<InventoryItem> {
    const response = await request<InventoryItem>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async adjustStock(
    id: string,
    payload: AdjustStockPayload
  ): Promise<InventoryItem> {
    const response = await request<InventoryItem>(`/inventory/${id}/adjust`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteInventoryItem(id: string): Promise<boolean> {
    const response = await request<boolean>(`/inventory/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  getExportUrl(params?: InventoryQueryParams): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category && params.category !== "All categories") {
      query.append("category", params.category);
    }
    if (params?.warehouse && params.warehouse !== "All warehouses") {
      query.append("warehouse", params.warehouse);
    }
    if (params?.status && params.status !== "All stock states") {
      query.append("status", params.status);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/inventory/export${queryString}`;
  },
};

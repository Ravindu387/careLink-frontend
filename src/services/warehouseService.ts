import { request } from "./api";
import type {
  Warehouse,
  CreateWarehousePayload,
  UpdateWarehousePayload,
  WarehouseSummary,
  WarehouseStatus,
} from "../types/warehouse";

export const warehouseService = {
  async getWarehouses(params?: {
    tab?: string;
    search?: string;
    district?: string;
    capacityState?: string;
    status?: string;
  }): Promise<Warehouse[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.search) query.append("search", params.search);
    if (params?.district && params.district !== "All districts") {
      query.append("district", params.district);
    }
    if (params?.capacityState && params.capacityState !== "All capacity states") {
      query.append("capacityState", params.capacityState);
    }
    if (params?.status && params.status !== "All statuses") {
      query.append("status", params.status);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Warehouse[]>(`/warehouses${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getWarehouseById(id: string): Promise<Warehouse> {
    const response = await request<Warehouse>(`/warehouses/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getSummary(): Promise<WarehouseSummary> {
    const response = await request<WarehouseSummary>("/warehouses/summary", {
      method: "GET",
    });
    return response.data;
  },

  async createWarehouse(payload: CreateWarehousePayload): Promise<Warehouse> {
    const response = await request<Warehouse>("/warehouses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateWarehousePayload | { status: WarehouseStatus }
  ): Promise<Warehouse> {
    const response = await request<Warehouse>(`/warehouses/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteWarehouse(id: string): Promise<boolean> {
    const response = await request<boolean>(`/warehouses/${id}`, {
      method: "DELETE",
    });
    return response.data ?? true;
  },
};

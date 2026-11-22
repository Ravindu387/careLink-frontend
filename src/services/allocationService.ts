import { request } from "./api";
import type {
  Allocation,
  AllocationSummary,
  CreateAllocationPayload,
  UpdateAllocationStatusPayload,
  AllocationQueryParams,
} from "../types/allocation";

export const allocationService = {
  async getAllocations(params?: AllocationQueryParams): Promise<Allocation[]> {
    const query = new URLSearchParams();
    if (params?.tab) query.append("tab", params.tab);
    if (params?.search) query.append("search", params.search);
    if (params?.warehouse && params.warehouse !== "All warehouses") query.append("warehouse", params.warehouse);
    if (params?.destination && params.destination !== "All destinations") query.append("destination", params.destination);
    if (params?.status && params.status !== "All allocation states") query.append("status", params.status);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Allocation[]>(`/allocations${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getAllocationById(id: string): Promise<Allocation> {
    const response = await request<Allocation>(`/allocations/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getAllocationSummary(): Promise<AllocationSummary | null> {
    const response = await request<AllocationSummary>("/allocations/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async createAllocation(payload: CreateAllocationPayload): Promise<Allocation> {
    const response = await request<Allocation>("/allocations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateAllocationStatus(
    id: string,
    payload: UpdateAllocationStatusPayload
  ): Promise<Allocation> {
    const response = await request<Allocation>(`/allocations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteAllocation(id: string): Promise<boolean> {
    const response = await request<boolean>(`/allocations/${id}`, {
      method: "DELETE",
    });
    return response.data ?? false;
  },
};

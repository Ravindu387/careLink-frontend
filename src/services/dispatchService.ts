import { request } from "./api";
import type {
  Dispatch,
  DispatchSummary,
  CreateDispatchPayload,
  UpdateDispatchStatusPayload,
  DispatchQueryParams,
} from "../types/dispatch";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5277/api";

export const dispatchService = {
  async getDispatches(params?: DispatchQueryParams): Promise<Dispatch[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "All delivery states" && params.status !== "All") {
      query.append("status", params.status);
    }
    if (params?.route && params.route !== "All routes") {
      query.append("route", params.route);
    }
    if (params?.vehicle && params.vehicle !== "All vehicles") {
      query.append("vehicle", params.vehicle);
    }
    if (params?.tab && params.tab !== "All") {
      query.append("tab", params.tab);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await request<Dispatch[]>(`/dispatches${queryString}`, {
      method: "GET",
    });
    return response.data || [];
  },

  async getDispatchById(id: string): Promise<Dispatch> {
    const response = await request<Dispatch>(`/dispatches/${id}`, {
      method: "GET",
    });
    return response.data;
  },

  async getDispatchSummary(): Promise<DispatchSummary | null> {
    const response = await request<DispatchSummary>("/dispatches/summary", {
      method: "GET",
    });
    return response.data || null;
  },

  async createDispatch(payload: CreateDispatchPayload): Promise<Dispatch> {
    const response = await request<Dispatch>("/dispatches", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async updateDispatchStatus(
    id: string,
    payload: UpdateDispatchStatusPayload
  ): Promise<Dispatch> {
    const response = await request<Dispatch>(`/dispatches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  async deleteDispatch(id: string): Promise<boolean> {
    const response = await request<boolean>(`/dispatches/${id}`, {
      method: "DELETE",
    });
    return response.success;
  },

  getExportUrl(params?: DispatchQueryParams): string {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.status && params.status !== "All delivery states") {
      query.append("status", params.status);
    }
    if (params?.route && params.route !== "All routes") {
      query.append("route", params.route);
    }
    if (params?.vehicle && params.vehicle !== "All vehicles") {
      query.append("vehicle", params.vehicle);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return `${API_BASE_URL}/dispatches/export${queryString}`;
  },
};
